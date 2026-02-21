import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Render uses process.env.PORT
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data File Path - Consider both local and Render Disk environments
const DATA_FILE = fs.existsSync('/opt/render/project/src/src/data/processes.json')
    ? '/opt/render/project/src/src/data/processes.json'
    : path.join(__dirname, 'src', 'data', 'processes.json');

// Serve static files from the Vite build directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// API: GET
app.get('/api/processes', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return res.json({});
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading data:', err);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// API: POST
app.post('/api/processes', (req, res) => {
    try {
        const newData = req.body;
        if (!newData) return res.status(400).json({ error: 'No data received' });

        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 4), 'utf8');
        res.json({ success: true });
    } catch (err) {
        console.error('Error writing data:', err);
        res.status(500).json({ error: 'Failed to write data' });
    }
});

// For all other routes, serve index.html (Client-side routing support)
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application build not found. Please run build first.');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
