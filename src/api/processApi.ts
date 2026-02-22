import { ProcessData } from '../data/processes';

const API_URL = '/api/processes';

export const fetchProcesses = async (): Promise<Record<string, ProcessData>> => {
    const response = await fetch(`${API_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch processes');
    return response.json();
};

export const saveProcesses = async (processes: Record<string, ProcessData>): Promise<void> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(processes),
    });
    if (!response.ok) throw new Error('Failed to save processes');
};

export const uploadImage = async (data: string, name: string, relatedId?: string): Promise<{ success: boolean, url: string }> => {
    const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, name, relatedId }),
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
};

export const listImages = async (relatedId: string): Promise<string[]> => {
    const response = await fetch(`/api/list-images/${encodeURIComponent(relatedId)}?t=${Date.now()}`);
    if (!response.ok) return [];
    return response.json();
};
