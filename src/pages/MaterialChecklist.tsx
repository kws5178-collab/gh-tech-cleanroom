import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Camera, Plus, X } from 'lucide-react';
import { processes as fallbackProcesses, ProcessData } from '../data/processes';
import { fetchProcesses } from '../api/processApi';
import { initDB, saveImage, getImagesByRelatedId, addCustomItem, getCustomItems, deleteCustomItem, CustomItem } from '../utils/db';
import { getIconForName } from '../utils/iconMapper';

const MaterialChecklist: React.FC = () => {
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

    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    // States
    const [imageError, setImageError] = useState<Record<string, boolean>>({});
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [materialImages, setMaterialImages] = useState<Record<string, string>>({});
    const [allMaterials, setAllMaterials] = useState<Array<{ id?: number; name: string; image: string; spec?: string; isCustom?: boolean }>>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState('');

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

    // Load materials (standard + custom)
    React.useEffect(() => {
        const loadMaterials = async () => {
            if (!process) return;
            await initDB();

            const standardMaterials = process.materials.map(m => ({ ...m, isCustom: false }));

            try {
                const customItems = await getCustomItems(id!, 'material');
                const customMaterials = customItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    image: '',
                    spec: item.spec || '사용자 추가 자재',
                    isCustom: true
                }));
                setAllMaterials([...standardMaterials, ...customMaterials]);
            } catch (error) {
                console.error("Error loading custom materials:", error);
                setAllMaterials(standardMaterials);
            }
        };
        loadMaterials();
    }, [id, process]);

    // Load images for all materials
    React.useEffect(() => {
        const loadMaterialImages = async () => {
            if (allMaterials.length === 0) return;

            const uniqueMaterials = Array.from(new Set(allMaterials.map(m => m.name)));
            const imagesMap: Record<string, string> = {};

            await Promise.all(uniqueMaterials.map(async (matName) => {
                const images = await getImagesByRelatedId(`material:${matName}`);
                if (images.length > 0) {
                    imagesMap[matName] = images[images.length - 1].data;
                }
            }));

            setMaterialImages(imagesMap);
        };
        loadMaterialImages();
    }, [allMaterials]);

    const [isCommon, setIsCommon] = useState(false);

    const handleAddMaterial = async () => {
        if (!newMaterialName.trim() || !id) return;

        try {
            const newItemId = await addCustomItem({
                processId: isCommon ? 'COMMON' : id,
                type: 'material',
                name: newMaterialName.trim(),
                spec: '사용자 추가 자재'
            });

            setAllMaterials(prev => [...prev, {
                id: newItemId,
                name: newMaterialName.trim(),
                image: '',
                spec: '사용자 추가 자재',
                isCustom: true
            }]);
            setNewMaterialName('');
            setIsCommon(false);
            setShowAddModal(false);
        } catch (error) {
            console.error("Failed to add material:", error);
            alert("자재 추가 실패");
        }
    };

    const handleDeleteMaterial = async (e: React.MouseEvent, itemId: number, name: string) => {
        e.stopPropagation(); // Prevent toggling check
        if (window.confirm(`'${name}' 자재를 삭제하시겠습니까?`)) {
            try {
                await deleteCustomItem(itemId);
                setAllMaterials(prev => prev.filter(item => item.id !== itemId));
            } catch (error) {
                console.error("Failed to delete material:", error);
                alert("삭제 실패");
            }
        }
    };

    const handleImageUpload = async (matName: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                await saveImage(file, `material:${matName}`);
                const images = await getImagesByRelatedId(`material:${matName}`);
                if (images.length > 0) {
                    setMaterialImages(prev => ({
                        ...prev,
                        [matName]: images[images.length - 1].data
                    }));
                    // Reset error state for this image if it was previously failed
                    setImageError(prev => ({ ...prev, [matName]: false }));
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

    return (
        <div className="container" style={{ paddingBottom: '110px' }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate(`/process/${id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>자재 입고 확인</h1>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {allMaterials.map((mat, index) => (
                    <motion.div
                        key={`${mat.name}-${index}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => toggleCheck(mat.name)}
                        className="glass"
                        style={{
                            padding: '20px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: checkedItems.includes(mat.name) ? '2px solid var(--secondary)' : '1px solid transparent',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: '#F8FAFC',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const customImage = materialImages[mat.name];
                                    const staticImage = mat.image;
                                    const imageUrl = (customImage && (customImage.startsWith('data:') || customImage.startsWith('blob:')))
                                        ? customImage
                                        : staticImage;

                                    if (imageUrl) {
                                        setViewingImage(imageUrl);
                                    }
                                }}
                            >
                                {(() => {
                                    const customImage = materialImages[mat.name];
                                    const hasCustomImage = customImage && (customImage.startsWith('data:') || customImage.startsWith('blob:'));
                                    const staticImage = mat.image;

                                    if (hasCustomImage || (staticImage && !imageError[mat.name])) {
                                        return (
                                            <img
                                                src={hasCustomImage ? customImage : staticImage}
                                                alt={mat.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={() => handleImageError(mat.name)}
                                            />
                                        );
                                    }

                                    const IconComponent = getIconForName(mat.name);
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
                                            onChange={(e) => handleImageUpload(mat.name, e)}
                                        />
                                    </label>
                                )}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>{mat.name}</h3>
                                <p style={{ fontSize: '13px', color: '#718096' }}>{mat.spec || ''}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isAdmin && mat.isCustom && mat.id && (
                                <button
                                    onClick={(e) => handleDeleteMaterial(e, mat.id!, mat.name)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#E53E3E',
                                        padding: '5px'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                border: '2px solid',
                                borderColor: checkedItems.includes(mat.name) ? 'var(--secondary)' : '#CBD5E0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: checkedItems.includes(mat.name) ? 'var(--secondary)' : 'transparent'
                            }}>
                                {checkedItems.includes(mat.name) && <CheckCircle2 size={18} color="white" />}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                {isAdmin && (
                    <button
                        className="btn glass"
                        style={{ flex: '1', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '14px', background: 'rgba(255, 255, 255, 0.8)' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={18} />
                        자재추가
                    </button>
                )}
                <button
                    className="btn btn-primary"
                    style={{ flex: isAdmin ? '2' : '1', padding: '20px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    onClick={() => navigate(`/process/${id}`)}
                >
                    확인 완료 ({checkedItems.length}/{allMaterials.length})
                </button>
            </div>

            {/* Add Material Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 3000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowAddModal(false)}>
                    <div className="glass" style={{ padding: '25px', width: '85%', maxWidth: '320px', borderRadius: '20px', background: 'white' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>새 자재 추가</h3>
                        <input
                            type="text"
                            value={newMaterialName}
                            onChange={(e) => setNewMaterialName(e.target.value)}
                            placeholder="자재 이름 입력"
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
                                onClick={handleAddMaterial}
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

export default MaterialChecklist;
