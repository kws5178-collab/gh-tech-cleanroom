import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ToolChecklist from './pages/ToolChecklist';
import MaterialChecklist from './pages/MaterialChecklist';
import MaterialSpecs from './pages/MaterialSpecs';
import MaterialDetails from './pages/MaterialDetails';
import ProcessDashboard from './pages/ProcessDashboard';
import WorkGuide from './pages/WorkGuide';
import LevelingGuide from './pages/LevelingGuide';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './index.css';
import { useEffect } from 'react';

// 자동 데이터 동기화 컴포넌트
const DataSync = () => {
  useEffect(() => {
    const syncData = async (manual = false) => {
      console.log('🔍 Sync process started... (Manual: ' + manual + ')');

      // 1. LocalStorage 데이터 수집
      const storageData: Record<string, string> = {};
      let hasData = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('leveling') || key.includes('guide') || key.includes('processes') || key.includes('backup') || key.includes('isAdmin'))) {
          storageData[key] = localStorage.getItem(key) || '';
          hasData = true;
        }
      }

      // 2. IndexedDB 데이터 수집
      let customItems: any[] = [];
      let images: any[] = [];
      try {
        const dbRequest = indexedDB.open('MaterialDB');
        const dbResult: IDBDatabase = await new Promise((resolve, reject) => {
          dbRequest.onsuccess = () => resolve(dbRequest.result);
          dbRequest.onerror = () => reject(dbRequest.error);
        });

        // custom_items 수집
        if (dbResult.objectStoreNames.contains('custom_items')) {
          const transaction = dbResult.transaction(['custom_items'], 'readonly');
          const store = transaction.objectStore('custom_items');
          customItems = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }

        // images 수집
        if (dbResult.objectStoreNames.contains('images')) {
          const transaction = dbResult.transaction(['images'], 'readonly');
          const store = transaction.objectStore('images');
          images = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
        dbResult.close();
      } catch (err) {
        console.warn('IndexedDB extraction failed:', err);
      }

      if (customItems.length > 0 || images.length > 0) hasData = true;

      console.log('📊 Collected data:', {
        storageCount: Object.keys(storageData).length,
        customItemsCount: customItems.length,
        imagesCount: images.length
      });

      // 데이터가 없어도 manual이면 빈 객체라도 보냄 (연결 확인용)
      if (!hasData && !manual) {
        console.log('✨ No modified data found to sync.');
        return;
      }

      try {
        const response = await fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'frontend_data',
            data: { localStorage: storageData, indexedDB: customItems, images: images, timestamp: new Date().toISOString() }
          })
        });

        if (response.ok) {
          console.log('✅ Frontend data synced to server');
          // alert('수정사항 동기화 성공! 이제 메인 서버 배포가 진행됩니다.');
          // sessionStorage.setItem('sync_notified', 'true');
        } else {
          console.error('❌ Sync failed with status:', response.status);
          if (manual) alert('서버 연결 실패 (Status: ' + response.status + ').');
        }
      } catch (err) {
        console.error('❌ Sync failed:', err);
        if (manual) alert('동기화 중 오류가 발생했습니다.');
      }
    };

    // 전역 함수 등록
    (window as any).forceSyncData = () => syncData(true);

    // 자동 실행 (백그라운드에서 조용히 실행)
    syncData();
  }, []);

  return null;
};

function Footer() {
  const navigate = useNavigate();
  return (
    <footer style={{
      padding: '2rem 1.5rem',
      textAlign: 'center',
      fontSize: '0.7rem',
      color: '#94a3b8',
      marginTop: 'auto',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      background: '#f8fafc'
    }}>
      <p style={{ lineHeight: '1.5', marginBottom: '0.5rem' }}>
        ⚠️ <strong>면책 조항</strong><br />
        본 애플리케이션에서 제공하는 작업 가이드와 체크리스트는 업무 보조를 위한 참고 자료입니다.
        실제 작업 시에는 반드시 현장 관리자의 지시와 최신 안전 수칙을 최우선으로 준수해야 하며,
        본 앱의 정보 활용으로 인한 결과에 대해 G.H Tech는 법적 책임을 지지 않습니다.
      </p>
      <p>© 2026 G.H Tech. All rights reserved. | <span onClick={() => window.location.href = '/privacy'} style={{ cursor: 'pointer', textDecoration: 'underline' }}>개인정보처리방침</span></p>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <DataSync />
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/material-specs" element={<MaterialSpecs />} />
            <Route path="/material-details" element={<MaterialDetails />} />
            <Route path="/leveling-guide" element={<LevelingGuide />} />
            <Route path="/process/:id" element={<ProcessDashboard />} />
            <Route path="/process/:id/tools" element={<ToolChecklist />} />
            <Route path="/process/:id/materials" element={<MaterialChecklist />} />
            <Route path="/process/:id/guide" element={<WorkGuide />} />
            {/* Backward compatibility / Default */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
