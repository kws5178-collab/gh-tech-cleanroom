import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Hammer, BookOpen, User, Bell, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const menuItems = [
        { title: '수공구 체크리스트', icon: <Hammer />, path: '/tools', color: '#1A3A5F' },
        { title: '자재 체크리스트', icon: <ClipboardList />, path: '/materials', color: '#00D2FF' },
        { title: '작업 가이드', icon: <BookOpen />, path: '/guides', color: '#FFCC33' },
    ];

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingTop: '10px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>G.H Tech</h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>클린룸 작업 관리 시스템</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        onClick={() => (window as any).forceSyncData?.()}
                        className="glass"
                        style={{
                            padding: '8px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        데이터 동기화
                    </button>
                    <Bell size={24} color="var(--text-muted)" />
                    <User size={24} color="var(--primary)" />
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{ padding: '20px', borderRadius: '20px', marginBottom: '30px', background: 'linear-gradient(90deg, #1A3A5F 0%, #0F243D 100%)', color: 'white' }}
            >
                <p style={{ fontSize: '14px', opacity: 0.8 }}>오늘의 작업 현황</p>
                <h2 style={{ fontSize: '24px', margin: '5px 0' }}>작업 완료율 67%</h2>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', marginTop: '15px', overflow: 'hidden' }}>
                    <div style={{ width: '67%', height: '100%', background: 'var(--secondary)' }}></div>
                </div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass"
                        onClick={() => navigate(item.path)}
                        style={{
                            padding: '20px',
                            borderRadius: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: `${item.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: item.color
                            }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{item.title}</h3>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                    </motion.div>
                ))}
            </div>

            <nav style={{ position: 'fixed', bottom: '0', left: '0', right: '0', background: 'white', padding: '15px 30px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' }}>
                <User size={24} color="var(--primary)" />
                <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-30px', border: '5px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <ClipboardList size={24} color="white" />
                </div>
                <Bell size={24} color="var(--text-muted)" />
            </nav>
        </div>
    );
};

export default Dashboard;
