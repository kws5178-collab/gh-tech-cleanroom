const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 데이터 경로 설정
const DATA_FILE = fs.existsSync('/opt/render/project/src/src/data/processes.json')
    ? '/opt/render/project/src/src/data/processes.json'
    : path.join(__dirname, 'src', 'data', 'processes.json');

// 정적 파일 서비스
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// API 라우트
app.get('/api/processes', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) return res.json({});
        res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
    } catch (err) {
        res.status(500).json({ error: 'Read Error' });
    }
});

app.post('/api/processes', (req, res) => {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Write Error' });
    }
});

// 모든 요청을 index.html로 (앱 구동)
app.get('*', (req, res) => {
    const file = path.join(distPath, 'index.html');
    if (fs.existsSync(file)) {
        res.sendFile(file);
    } else {
        res.send('앱 빌드 중입니다. 잠시만 기다려 주세요.');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
