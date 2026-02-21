import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate to Material Specs first as requested
        navigate('/material-specs');
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #1A3A5F 0%, #0F243D 100%)', color: 'white' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ padding: '40px 30px', borderRadius: '24px', textAlign: 'center' }}
            >
                <div style={{ background: 'white', display: 'inline-block', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#1A3A5F', fontWeight: '900', fontSize: '28px' }}>G.H</h2>
                    <p style={{ color: '#1A3A5F', fontWeight: '700', fontSize: '14px', marginTop: '-5px' }}>Tech</p>
                </div>

                <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>클린룸 작업관리</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '30px' }}>Clean Room Management System</p>

                <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px', position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', bottom: '12px', left: '0', color: 'var(--secondary)' }} />
                        <input
                            type="text"
                            placeholder="아이디"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', padding: '10px 10px 10px 30px', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div style={{ marginBottom: '40px', position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', bottom: '12px', left: '0', color: 'var(--secondary)' }} />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', padding: '10px 10px 10px 30px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px' }}>
                        로그인 <ArrowRight size={18} />
                    </button>
                </form>
            </motion.div>

            <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                © 2026 G.H Tech. All Rights Reserved.
            </p>
        </div>
    );
};

export default Login;
