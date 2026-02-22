const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// 이미지 업로드 엔드포인트 (Base64 데이터를 파일로 저장)
app.post('/api/upload-image', (req, res) => {
    try {
        const { data, name, relatedId } = req.body;
        if (!data) return res.status(400).json({ error: 'No image data' });

        // public/images/uploads 폴더 생성
        const uploadDir = path.join(__dirname, 'public', 'images', 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        // 파일명 생성 (관련 ID + 타임스탬프)
        const safeRelatedId = (relatedId || 'unknown').replace(/[^a-z0-9]/gi, '_');
        const timestamp = Date.now();
        const safeName = (name || 'image').replace(/[^a-z0-9.]/gi, '_');
        const fileName = `${safeRelatedId}_${timestamp}_${safeName}`;
        const filePath = path.join(uploadDir, fileName);

        // Base64 데이터에서 실제 데이터 추출
        const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filePath, base64Data, 'base64');

        const publicUrl = `/images/uploads/${fileName}`;
        console.log(`Image saved: ${fileName}`);
        res.json({ success: true, url: publicUrl });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: 'Upload Error' });
    }
});

// 특정 ID 관련 이미지 목록 조회 엔드포인트
app.get('/api/list-images/:relatedId', (req, res) => {
    try {
        const { relatedId } = req.params;
        const uploadDir = path.join(__dirname, 'public', 'images', 'uploads');
        if (!fs.existsSync(uploadDir)) return res.json([]);

        const safeRelatedId = (relatedId || 'unknown').replace(/[^a-z0-9]/gi, '_');
        const files = fs.readdirSync(uploadDir);
        const filteredFiles = files.filter(f => f.startsWith(`${safeRelatedId}_`));

        const urls = filteredFiles.map(f => `/images/uploads/${f}`);
        res.json(urls);
    } catch (err) {
        console.error('List Images Error:', err);
        res.status(500).json({ error: 'List Error' });
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

// 정적 파일 서비스
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// 그 외 모든 요청 처리 (SPA fallback)
app.use((req, res, next) => {
    // API 요청이 아니면 index.html 전송
    if (!req.path.startsWith('/api')) {
        const indexFile = path.join(distPath, 'index.html');
        if (fs.existsSync(indexFile)) {
            // index.html도 캐시 방지 적용
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            return res.sendFile(indexFile);
        }
    }
    next();
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
