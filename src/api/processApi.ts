import { ProcessData } from '../data/processes';

const API_URL = '/api/processes';

export const fetchProcesses = async (): Promise<Record<string, ProcessData>> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch processes');
    return response.json();
};

export const saveProcesses = async (processes: Record<string, ProcessData>): Promise<void> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(processes),
    });
    if (!response.ok) throw new Error('Failed to save processes');
};
