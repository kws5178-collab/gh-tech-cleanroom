import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowDownToLine,
    Nut,
    Square,
    Activity,
    Grid3X3,
    Cpu,
    Disc,
    Box,
    PanelTop,
    Zap,
    Wind,
    Filter
} from 'lucide-react';
import { processes as fallbackProcesses, ProcessData } from '../data/processes';
import { fetchProcesses } from '../api/processApi';

const iconMap: Record<string, React.ReactNode> = {
    'ArrowDownToLine': <ArrowDownToLine size={24} />,
    'Nut': <Nut size={24} />,
    'Square': <Square size={24} />,
    'Activity': <Activity size={24} />,
    'Grid3X3': <Grid3X3 size={24} />,
    'Cpu': <Cpu size={24} />,
    'Disc': <Disc size={24} />,
    'Box': <Box size={24} />,
    'PanelTop': <PanelTop size={24} />,
    'Zap': <Zap size={24} />,
    'Wind': <Wind size={24} />,
    'Filter': <Filter size={24} />,
};

const MaterialSpecs: React.FC = () => {
    const navigate = useNavigate();
    const [allProcesses, setAllProcesses] = useState<Record<string, ProcessData>>(fallbackProcesses);

    useEffect(() => {
        const loadProcesses = async () => {
            try {
                const data = await fetchProcesses();
                setAllProcesses(data);
            } catch (err) {
                console.error('Failed to load processes:', err);
            }
        };
        loadProcesses();
    }, []);

    return (
        <div className="container" style={{ paddingBottom: '30px' }}>
            <header style={{
                background: 'linear-gradient(90deg, #1A3A5F 0%, #0F243D 100%)',
                padding: '25px 20px',
                borderRadius: '0 0 25px 25px',
                margin: '-20px -20px 20px -20px',
                color: 'white',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'white',
                            position: 'absolute',
                            left: '0'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        G.H tech 클린룸 작업관리
                    </h1>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {/* Material Specs Button */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass"
                    onClick={() => navigate('/material-details')}
                    style={{
                        flex: 1,
                        padding: '15px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: '800',
                        fontSize: '16px',
                        boxShadow: '0 4px 10px rgba(26, 58, 95, 0.2)',
                        cursor: 'pointer'
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    자재 제원
                </motion.div>

                {/* Leveling Guide Button */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass"
                    onClick={() => navigate('/leveling-guide')}
                    style={{
                        flex: 1,
                        padding: '15px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: '800',
                        fontSize: '16px',
                        boxShadow: '0 4px 10px rgba(26, 58, 95, 0.2)',
                        cursor: 'pointer'
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    레벨링
                </motion.div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '30px'
            }}>
                {Object.values(allProcesses).filter(p => !p.isHidden).map((process, index) => (
                    <motion.div
                        key={process.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => navigate(`/process/${process.id}`)}
                        className="glass"
                        style={{
                            height: '110px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: '10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            borderRadius: '15px',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            border: '1px solid rgba(26, 58, 95, 0.1)'
                        }}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ backgroundColor: 'rgba(26, 58, 95, 0.05)' }}
                    >
                        <div style={{ marginBottom: '8px', color: 'var(--secondary)' }}>
                            {iconMap[process.iconName] || <div style={{ opacity: 0.4 }}>{(index + 1).toString().padStart(2, '0')}</div>}
                        </div>
                        {process.name}
                    </motion.div>
                ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
                G.H Tech Clean Room Management System
            </p>
        </div>
    );
};

export default MaterialSpecs;
