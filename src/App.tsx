import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ToolChecklist from './pages/ToolChecklist';
import MaterialChecklist from './pages/MaterialChecklist';
import MaterialSpecs from './pages/MaterialSpecs';
import MaterialDetails from './pages/MaterialDetails';
import ProcessDashboard from './pages/ProcessDashboard';
import WorkGuide from './pages/WorkGuide';
import LevelingGuide from './pages/LevelingGuide';
import './index.css';

function Footer() {
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
      <p>© 2026 G.H Tech. All rights reserved.</p>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Login />} />
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
