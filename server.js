import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data File Path - Render Disk path vs Local path
const RENDER_DISK_PATH = '/opt/render/project/src/src/data/processes.json';
const LOCAL_DATA_PATH = path.join(__dirname, 'src', 'data', 'processes.json');
const DATA_FILE = fs.existsSync(RENDER_DISK_PATH) ? RENDER_DISK_PATH : LOCAL_DATA_PATH;

// Static files from Vite build
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// API Routes
app.get('/api/processes', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) return res.json({});
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('API Error (GET):', err);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/processes', (req, res) => {
    try {
        const newData = req.body;
        if (!newData) return res.status(400).json({ error: 'No data received' });

        // Ensure directory exists for local development
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 4), 'utf8');
        res.json({ success: true });
    } catch (err) {
        console.error('API Error (POST):', err);
        res.status(500).json({ error: 'Failed to write data' });
    }
});

// Single Page Application (SPA) - Must be LAST handler
app.get('*', (req, res) => {
    // Only handle if it's not an API call
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API not found' });

    const indexFile = path.join(distPath, 'index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(404).send('Application not ready. Please wait for the build to complete.');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
