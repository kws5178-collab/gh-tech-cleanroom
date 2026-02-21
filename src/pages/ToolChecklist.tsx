import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, CheckCircle2, Camera, Plus, X } from 'lucide-react';
import { processes as fallbackProcesses, ProcessData } from '../data/processes';
import { fetchProcesses } from '../api/processApi';
import { initDB, saveImage, getImagesByRelatedId, addCustomItem, getCustomItems, CustomItem } from '../utils/db';
import { getIconForName } from '../utils/iconMapper';

const ToolChecklist: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [process, setProcess] = useState<ProcessData | null>(id ? fallbackProcesses[id] : null);

    React.useEffect(() => {
        const loadProcessData = async () => {
            if (!id) return;
            try {
                const data = await fetchProcesses();
                if (data[id]) setProcess(data[id]);
            } catch (err) {
                console.error('Failed to fetch process:', err);
            }
        };
        loadProcessData();
    }, [id]);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    // States
    const [imageError, setImageError] = useState<Record<string, boolean>>({});
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [toolImages, setToolImages] = useState<Record<string, string>>({});
    const [allTools, setAllTools] = useState<Array<{ name: string; image: string; isCustom?: boolean }>>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newToolName, setNewToolName] = useState('');

    // Admin Mode
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

    const toggleAdmin = () => {
        if (!isAdmin) {
            const pwd = prompt('관리자 비밀번호를 입력하세요.');
            if (pwd === '1234') { // 기본 비밀번호 1234
                localStorage.setItem('isAdmin', 'true');
                setIsAdmin(true);
            } else {
                alert('비밀번호가 틀렸습니다.');
            }
        } else {
            localStorage.setItem('isAdmin', 'false');
            setIsAdmin(false);
        }
    };

    // Load tools (standard + custom)
    React.useEffect(() => {
        const loadTools = async () => {
            if (!process) return;
            await initDB();

            // Force clear tools for insert-embedded due to potential backend caching issues
            const toolsToUse = (id === 'insert-embedded') ? [] : process.tools;
            const standardTools = toolsToUse.map(t => ({ ...t, isCustom: false }));

            try {
                const customItems = await getCustomItems(id!, 'tool');
                const customTools = customItems.map(item => ({
                    name: item.name,
                    image: '',
                    isCustom: true
                }));
                // Combine standard tools and custom tools, avoid duplicates if any
                setAllTools([...standardTools, ...customTools]);
            } catch (error) {
                console.error("Error loading custom tools:", error);
                setAllTools(standardTools);
            }
        };
        loadTools();
    }, [id, process]);

    // Load images for all tools
    React.useEffect(() => {
        const loadToolImages = async () => {
            if (allTools.length === 0) return;

            const uniqueTools = Array.from(new Set(allTools.map(t => t.name)));
            const imagesMap: Record<string, string> = {};

            await Promise.all(uniqueTools.map(async (toolName) => {
                const images = await getImagesByRelatedId(`tool:${toolName}`);
                if (images.length > 0) {
                    imagesMap[toolName] = images[images.length - 1].data;
                }
            }));

            setToolImages(imagesMap);
        };
        loadToolImages();
    }, [allTools]);

    const [isCommon, setIsCommon] = useState(false);

    const handleAddTool = async () => {
        if (!newToolName.trim() || !id) return;

        try {
            await addCustomItem({
                processId: isCommon ? 'COMMON' : id,
                type: 'tool',
                name: newToolName.trim()
            });

            setAllTools(prev => [...prev, { name: newToolName.trim(), image: '', isCustom: true }]);
            setNewToolName('');
            setIsCommon(false);
            setShowAddModal(false);
        } catch (error) {
            console.error("Failed to add tool:", error);
            alert("공구 추가 실패");
        }
    };

    // ... (rest of the code)

    const handleImageUpload = async (toolName: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                // Save with key "tool:ToolName"
                await saveImage(file, `tool:${toolName}`);
                // Reload image for this tool
                const images = await getImagesByRelatedId(`tool:${toolName}`);
                if (images.length > 0) {
                    setToolImages(prev => ({
                        ...prev,
                        [toolName]: images[images.length - 1].data
                    }));
                    // Reset error state
                    setImageError(prev => ({ ...prev, [toolName]: false }));
                }
            } catch (error) {
                console.error('Failed to save image:', error);
                alert('이미지 저장 실패');
            }
        }
    };

    if (!process) return <div className="container">데이터를 찾을 수 없습니다.</div>;

    const toggleCheck = (name: string) => {
        setCheckedItems(prev =>
            prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
        );
    };

    const handleImageError = (name: string) => {
        setImageError(prev => ({ ...prev, [name]: true }));
    };

    const filteredTools = allTools.filter(t => t.name.includes(searchTerm));

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate(`/process/${id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>수공구 점검</h1>
                </div>
                <button
                    onClick={toggleAdmin}
                    className="glass"
                    style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: isAdmin ? '#E53E3E' : 'var(--primary)',
                        border: '1px solid currentColor',
                        background: 'transparent'
                    }}
                >
                    {isAdmin ? '관리자 모드' : '모드 변경'}
                </button>
            </header>

            <div style={{ position: 'relative', marginBottom: '25px' }}>
                <input
                    type="text"
                    placeholder="공구 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '15px', border: '1px solid #E2E8F0', outline: 'none' }}
                />
                <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatePresence>
                    {filteredTools.map((tool, index) => (
                        <motion.div
                            key={tool.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => toggleCheck(tool.name)}
                            className="glass"
                            style={{
                                padding: '15px',
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                border: checkedItems.includes(tool.name) ? '2px solid var(--secondary)' : '1px solid transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {/* Image Container */}
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        background: '#F8FAFC',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const customImage = toolImages[tool.name];
                                        const staticImage = tool.image;
                                        const imageUrl = (customImage && (customImage.startsWith('data:') || customImage.startsWith('blob:')))
                                            ? customImage
                                            : staticImage;

                                        if (imageUrl) {
                                            setViewingImage(imageUrl);
                                        }
                                    }}
                                >
                                    {(() => {
                                        const customImage = toolImages[tool.name];
                                        const hasCustomImage = customImage && (customImage.startsWith('data:') || customImage.startsWith('blob:'));
                                        const staticImage = tool.image;

                                        if (hasCustomImage || (staticImage && !imageError[tool.name])) {
                                            return (
                                                <img
                                                    src={hasCustomImage ? customImage : staticImage}
                                                    alt={tool.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={() => handleImageError(tool.name)}
                                                />
                                            );
                                        }

                                        const IconComponent = getIconForName(tool.name);
                                        return <IconComponent size={32} color="#3182CE" strokeWidth={1.5} />;
                                    })()}

                                    {isAdmin && (
                                        <label
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                background: 'rgba(255,255,255,0.9)',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                borderTopLeftRadius: '6px',
                                                boxShadow: '-1px -1px 2px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <Camera size={14} color="#4A5568" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleImageUpload(tool.name, e)}
                                            />
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>{tool.name}</h3>
                                    <span style={{ fontSize: '12px', color: checkedItems.includes(tool.name) ? 'var(--secondary)' : '#A0AEC0' }}>
                                        {checkedItems.includes(tool.name) ? '확인 완료' : '미확인'}
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                border: '2px solid',
                                borderColor: checkedItems.includes(tool.name) ? 'var(--secondary)' : '#CBD5E0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: checkedItems.includes(tool.name) ? 'var(--secondary)' : 'transparent'
                            }}>
                                {checkedItems.includes(tool.name) && <CheckCircle2 size={16} color="white" />}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                {isAdmin && (
                    <button
                        className="btn glass"
                        style={{ flex: '1', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.8)' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={18} />
                        공구추가
                    </button>
                )}
                <button
                    className="btn btn-primary"
                    style={{ flex: isAdmin ? '2' : '1', padding: '18px', boxShadow: '0 10px 15px -3px rgba(26, 58, 95, 0.3)' }}
                    onClick={() => navigate(`/process/${id}`)}
                >
                    점검 완료 ({checkedItems.length}/{allTools.length})
                </button>
            </div>

            {/* Add Tool Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 3000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowAddModal(false)}>
                    <div className="glass" style={{ padding: '25px', width: '85%', maxWidth: '320px', borderRadius: '20px', background: 'white' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>새 공구 추가</h3>
                        <input
                            type="text"
                            value={newToolName}
                            onChange={(e) => setNewToolName(e.target.value)}
                            placeholder="공구 이름 입력"
                            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px', color: '#4A5568', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isCommon}
                                onChange={(e) => setIsCommon(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            모든 공정에 적용
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#EDF2F7', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddTool}
                                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                추가
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {viewingImage && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setViewingImage(null)}
                >
                    <img src={viewingImage} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
                    <button style={{ position: 'absolute', top: 20, right: 20, background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setViewingImage(null)}>✕</button>
                </div>
            )}
        </div>
    );
};

export default ToolChecklist;
