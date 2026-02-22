const DB_NAME = 'MaterialDB';
const DB_VERSION = 4;
const STORE_NAME = 'images';
const CUSTOM_ITEMS_STORE = 'custom_items';

export interface CustomItem {
    id?: number;
    processId: string;
    type: 'tool' | 'material';
    name: string;
    spec?: string;
    createdAt?: number;
}

interface ImageRecord {
    id?: number;
    data: string; // Base64 string
    name: string;
    type: string;
    date: number;
    relatedId?: string; // Process ID or category
}

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event);
            reject("Error opening database");
        };

        request.onblocked = (event) => {
            console.error("IndexedDB blocked: Please close other tabs with this app open.", event);
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = (event.target as IDBOpenDBRequest).transaction;

            let store: IDBObjectStore;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            } else {
                store = transaction!.objectStore(STORE_NAME);
            }

            // Create index for relatedId if it doesn't exist (added in v2)
            if (!store.indexNames.contains('relatedId')) {
                store.createIndex('relatedId', 'relatedId', { unique: false });
            }

            // Create custom items store (v3/v4)
            if (!db.objectStoreNames.contains(CUSTOM_ITEMS_STORE)) {
                const customStore = db.createObjectStore(CUSTOM_ITEMS_STORE, { keyPath: 'id', autoIncrement: true });
                customStore.createIndex('processId', 'processId', { unique: false });
                customStore.createIndex('type', 'type', { unique: false });
            }
        };
    });
};

export const initDB = async (): Promise<void> => {
    await openDB();
};

export const saveImage = async (file: File, relatedId?: string): Promise<string> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result as string;
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const record: ImageRecord = {
                data: base64,
                name: file.name,
                type: file.type,
                date: Date.now(),
                relatedId: relatedId
            };
            const request = store.add(record);

            request.onsuccess = () => resolve(base64);
            request.onerror = () => reject(request.error);
        };
        reader.onerror = () => reject(reader.error);
    });
};

export const getAllImages = async (): Promise<ImageRecord[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getImagesByRelatedId = async (relatedId: string): Promise<ImageRecord[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('relatedId');

        // First try: Exact match (current format e.g., "tool:Hammmer")
        const request = index.getAll(relatedId);

        request.onsuccess = () => {
            const results = request.result;
            if (results && results.length > 0) {
                resolve(results);
            } else {
                // Second try: Fallback for legacy data (without prefix e.g., "Hammer")
                // Extract name part if prefix exists
                let legacyId = relatedId;
                if (relatedId.startsWith('tool:')) legacyId = relatedId.replace('tool:', '');
                else if (relatedId.startsWith('material:')) legacyId = relatedId.replace('material:', '');

                if (legacyId !== relatedId) {
                    const legacyRequest = index.getAll(legacyId);
                    legacyRequest.onsuccess = () => resolve(legacyRequest.result);
                    legacyRequest.onerror = () => reject(legacyRequest.error);
                } else {
                    resolve([]);
                }
            }
        };
        request.onerror = () => reject(request.error);
    });
};

export const deleteImage = async (id: number): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// Custom Items Helpers
export const addCustomItem = async (item: CustomItem): Promise<number> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CUSTOM_ITEMS_STORE], 'readwrite');
        const store = transaction.objectStore(CUSTOM_ITEMS_STORE);
        item.createdAt = Date.now();
        const request = store.add(item);

        request.onsuccess = () => resolve(request.result as number);
        request.onerror = () => reject(request.error);
    });
};

export const getCustomItems = async (processId: string, type: 'tool' | 'material'): Promise<CustomItem[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CUSTOM_ITEMS_STORE], 'readonly');
        const store = transaction.objectStore(CUSTOM_ITEMS_STORE);
        const index = store.index('processId');

        const processRequest = index.getAll(processId);
        const commonRequest = index.getAll('COMMON');

        let processItems: CustomItem[] = [];
        let commonItems: CustomItem[] = [];
        let completed = 0;

        const checkCompletion = () => {
            if (completed === 2) {
                // Filter by type
                const filteredProcessItems = processItems.filter(item => item.type === type);
                const filteredCommonItems = commonItems.filter(item => item.type === type);

                // Merge and deduplicate by name (Process specific items take precedence if names conflict)
                const itemMap = new Map<string, CustomItem>();

                filteredCommonItems.forEach(item => itemMap.set(item.name, item));
                filteredProcessItems.forEach(item => itemMap.set(item.name, item));

                resolve(Array.from(itemMap.values()));
            }
        };

        processRequest.onsuccess = () => {
            processItems = processRequest.result;
            completed++;
            checkCompletion();
        };
        processRequest.onerror = () => reject(processRequest.error);

        commonRequest.onsuccess = () => {
            commonItems = commonRequest.result;
            completed++;
            checkCompletion();
        };
        commonRequest.onerror = () => reject(commonRequest.error);
    });
};

export const deleteCustomItem = async (id: number): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([CUSTOM_ITEMS_STORE], 'readwrite');
        const store = transaction.objectStore(CUSTOM_ITEMS_STORE);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
