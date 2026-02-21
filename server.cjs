const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data File Path
const RENDER_DISK_PATH = '/opt/render/project/src/src/data/processes.json';
const LOCAL_DATA_PATH = path.join(__dirname, 'src', 'data', 'processes.json');
const DATA_FILE = fs.existsSync(RENDER_DISK_PATH) ? RENDER_DISK_PATH : LOCAL_DATA_PATH;

// Serve static files from 'dist'
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// API
app.get('/api/processes', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) return res.json({});
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Read error' });
    }
});

app.post('/api/processes', (req, res) => {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 4), 'utf8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Write error' });
    }
});

// SPA Routing
app.get('*', (req, res) => {
    const indexFile = path.join(distPath, 'index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(200).send('Building... Please refresh in a minute.');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server live on ${port}`);
});
