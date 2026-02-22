const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 데이터 경로 설정
const DATA_FILE = path.join(__dirname, 'src', 'data', 'processes.json');

// 캐시 방지 미들웨어
const noCache = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

// API 라우트 우선 정의 (캐시 비활성화 적용)
app.get('/api/processes', noCache, (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) return res.json({});
        res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
    } catch (err) {
        res.status(500).json({ error: 'Read Error' });
    }
});

app.post('/api/processes', noCache, (req, res) => {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Write Error' });
    }
});

// 클라이언트 스토리지(LocalStorage 등) 데이터를 서버 파일로 동기화하는 엔드포인트
app.post('/api/sync-data', (req, res) => {
    try {
        const { type, data } = req.body;
        const syncDir = path.join(__dirname, 'src', 'data', 'sync');
        if (!fs.existsSync(syncDir)) fs.mkdirSync(syncDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `sync_${type}_${timestamp}.json`;
        fs.writeFileSync(path.join(syncDir, fileName), JSON.stringify(data, null, 2), 'utf8');

        console.log(`Synced ${type} data saved to ${fileName}`);
        res.json({ success: true, file: fileName });
    } catch (err) {
        console.error('Sync Error:', err);
        res.status(500).json({ error: 'Sync Error' });
    }
});

// 정적 파일 서비스 (문제가 되는 와일드카드 제거)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// 그 외 모든 요청 처리 (SPA fallback)
app.use((req, res, next) => {
    // API 요청이 아니면 index.html 전송
    if (!req.path.startsWith('/api')) {
        const indexFile = path.join(distPath, 'index.html');
        if (fs.existsSync(indexFile)) {
            return res.sendFile(indexFile);
        }
    }
    next();
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
