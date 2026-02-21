import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Hammer, ClipboardList, BookOpen, ChevronRight } from 'lucide-react';
import { processes as fallbackProcesses, ProcessData } from '../data/processes';
import { fetchProcesses } from '../api/processApi';

const ProcessDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [process, setProcess] = useState<ProcessData | null>(id ? fallbackProcesses[id] : null);

    useEffect(() => {
        const loadProcess = async () => {
            if (!id) return;
            try {
                const data = await fetchProcesses();
                if (data[id]) {
                    setProcess(data[id]);
                }
            } catch (err) {
                console.error('Failed to load process:', err);
            }
        };
        loadProcess();
    }, [id]);

    if (!process) {
        return <div className="container">공정을 찾을 수 없습니다.</div>;
    }

    // Sub-process selection view
    if (process.subProcesses && process.subProcesses.length > 0) {
        return (
            <div className="container" style={{ paddingBottom: '30px' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingTop: '10px' }}>
                    <button onClick={() => navigate('/material-specs')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>{process.name}</h1>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#666', marginBottom: '5px' }}>세부 공정을 선택하세요</h2>
                    {process.subProcesses.map((sub, index) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass"
                            onClick={() => navigate(`/process/${sub.id}`)}
                            style={{
                                padding: '22px',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                border: `1px solid rgba(0,0,0,0.05)`
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--primary)' }}>{sub.name}</span>
                            <ChevronRight size={18} color="#CBD5E0" />
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // Standard view
    const menuItems = [
        { title: '수공구 체크리스트', icon: <Hammer />, path: `/process/${id}/tools`, color: '#1A3A5F' },
        { title: '자재 체크리스트', icon: <ClipboardList />, path: `/process/${id}/materials`, color: '#00D2FF' },
        { title: '작업 가이드', icon: <BookOpen />, path: `/process/${id}/guide`, color: '#FFCC33' },
    ];

    return (
        <div className="container" style={{ paddingBottom: '30px' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingTop: '10px' }}>
                <button onClick={() => navigate('/material-specs')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>{process.name}</h1>
            </header>

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
                            padding: '22px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            border: `1px solid rgba(0,0,0,0.05)`
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                            <div style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(26, 58, 95, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                {React.cloneElement(item.icon as React.ReactElement, { size: 22 })}
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--primary)' }}>{item.title}</span>
                        </div>
                        <ChevronRight size={18} color="#CBD5E0" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ProcessDashboard;
