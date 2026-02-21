import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
const logError = (msg) => {
    const logPath = path.join(__dirname, 'server_error.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    console.error(msg);
};

// Data File Path
const DATA_FILE = path.join(__dirname, 'src', 'data', 'processes.json');

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// GET
app.get('/api/processes', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            res.json({});
            return;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData);
    } catch (err) {
        logError(`Error reading data: ${err.message}`);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// POST
app.post('/api/processes', (req, res) => {
    try {
        const newData = req.body;
        if (!newData) {
            throw new Error('No data received');
        }
        // Write file
        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 4), 'utf8');
        res.json({ success: true });
    } catch (err) {
        logError(`Error writing data: ${err.message}`);
        res.status(500).json({ error: 'Failed to write data' });
    }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
