import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, BookOpen, Edit, Save, Plus, Trash2 } from 'lucide-react';
import { ProcessData, processes as fallbackProcesses } from '../data/processes';
import { initDB, saveImage, getImagesByRelatedId, deleteImage } from '../utils/db';
import { fetchProcesses, saveProcesses, uploadImage, listImages } from '../api/processApi';

const WorkGuide: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Process Data State
    const [processData, setProcessData] = useState<ProcessData | null>(null);
    const [allProcesses, setAllProcesses] = useState<Record<string, ProcessData> | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentStep, setCurrentStep] = useState(0);

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editedSteps, setEditedSteps] = useState<string[]>([]);
    const [editedDescriptions, setEditedDescriptions] = useState<string[]>([]);

    // Image Upload State
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [savedImages, setSavedImages] = useState<{ id: number, data: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Safety Backup Storage Keys
    const BACKUP_STEPS_KEY = `backup_steps_${id}`;
    const BACKUP_DESCS_KEY = `backup_descs_${id}`;

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchProcesses();
                setAllProcesses(data);
                if (id && data[id]) {
                    setProcessData(data[id]);

                    // Try to load from backup first if available (unsaved changes)
                    const backupSteps = localStorage.getItem(BACKUP_STEPS_KEY);
                    const backupDescs = localStorage.getItem(BACKUP_DESCS_KEY);

                    if (backupSteps) setEditedSteps(JSON.parse(backupSteps));
                    else setEditedSteps(data[id].guideSteps || []);

                    if (backupDescs) setEditedDescriptions(JSON.parse(backupDescs));
                    else setEditedDescriptions(data[id].guideStepDescriptions || []);
                }
            } catch (err) {
                console.error('Failed to load processes:', err);
                setAllProcesses(fallbackProcesses);
                if (id && fallbackProcesses[id]) {
                    setProcessData(fallbackProcesses[id]);
                    setEditedSteps(fallbackProcesses[id].guideSteps || []);
                    setEditedDescriptions(fallbackProcesses[id].guideStepDescriptions || []);
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Save backup to LocalStorage as user types
    useEffect(() => {
        if (isEditing && id) {
            localStorage.setItem(BACKUP_STEPS_KEY, JSON.stringify(editedSteps));
            localStorage.setItem(BACKUP_DESCS_KEY, JSON.stringify(editedDescriptions));
        }
    }, [isEditing, editedSteps, editedDescriptions, id]);

    // Load saved images from IndexedDB and Server on mount (filtered by process ID and Step)
    useEffect(() => {
        const loadImages = async () => {
            if (!id) return;
            try {
                await initDB();
                const relatedId = `${id}_step_${currentStep}`;

                // 1. 로컬 DB 로드 (Base64)
                const localImages = await getImagesByRelatedId(relatedId);
                const formattedLocal = localImages.map(img => ({
                    id: img.id!,
                    data: img.data,
                    isServer: false
                }));

                // 2. 서버 이미지 목록 로드 (URL)
                let serverImages: any[] = [];
                try {
                    const serverUrls = await listImages(relatedId);
                    serverImages = serverUrls.map((url: string, idx: number) => ({
                        id: 999000 + idx, // 더미 ID
                        data: url,
                        isServer: true
                    }));
                } catch (err) {
                    console.warn('Failed to load server images:', err);
                }

                // 합치기 (중복 제거는 생략하고 모두 표시)
                setSavedImages([...formattedLocal, ...serverImages]);
            } catch (error) {
                console.error('Failed to load images:', error);
            }
        };
        loadImages();
    }, [id, currentStep]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleSave = async () => {
        if (!allProcesses || !id || !processData) return;

        const updatedProcess = {
            ...processData,
            guideSteps: editedSteps,
            guideStepDescriptions: editedDescriptions
        };

        const updatedAllProcesses = {
            ...allProcesses,
            [id]: updatedProcess
        };

        try {
            await saveProcesses(updatedAllProcesses);
            setProcessData(updatedProcess);
            setAllProcesses(updatedAllProcesses);
            setIsEditing(false);

            // Clear backup on successful save
            localStorage.removeItem(BACKUP_STEPS_KEY);
            localStorage.removeItem(BACKUP_DESCS_KEY);

            alert('저장되었습니다.');
        } catch (err) {
            console.error('Failed to save:', err);
            alert(`저장에 실패했습니다: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const handleAddStep = () => {
        setEditedSteps([...editedSteps, '새로운 단계']);
        setEditedDescriptions([...editedDescriptions, '설명을 입력하세요.']);
    };

    const handleDeleteStep = (index: number) => {
        if (window.confirm('이 단계를 삭제하시겠습니까?')) {
            const newSteps = editedSteps.filter((_, i) => i !== index);
            const newDescs = editedDescriptions.filter((_, i) => i !== index);
            setEditedSteps(newSteps);
            setEditedDescriptions(newDescs);
            if (currentStep >= newSteps.length) {
                setCurrentStep(Math.max(0, newSteps.length - 1));
            }
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const validFiles = files.filter(file => file.type.startsWith('image/'));
            if (validFiles.length > 0) {
                setSelectedFiles(prev => [...prev, ...validFiles]);
                const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                setPreviewUrls(prev => [...prev, ...newPreviews]);
            }
        }
        if (event.target) event.target.value = '';
    };

    const handleUpload = async () => {
        if (!id || selectedFiles.length === 0) return;
        setIsUploading(true);
        setUploadStatus('업로드 중...');
        const relatedId = `${id}_step_${currentStep}`;
        try {
            for (const file of selectedFiles) {
                // 1. 로컬 저장
                const base64 = await saveImage(file, relatedId);

                // 2. 서버 업로드 시도
                try {
                    await uploadImage(base64, file.name, relatedId);
                } catch (apiErr) {
                    console.warn('Server upload failed (Image stored locally only):', apiErr);
                }
            }
            const images = await getImagesByRelatedId(relatedId);
            setSavedImages(images.map(img => ({ id: img.id!, data: img.data })));
            setSelectedFiles([]);
            setPreviewUrls([]);
            setUploadStatus('완료');
            setTimeout(() => setUploadStatus(''), 1000);
            alert('업로드 완료 (서버 동기화 포함)');
        } catch (error) {
            console.error(error);
            alert('오류 발생');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveSaved = async (imageId: number) => {
        if (window.confirm('삭제하시겠습니까?')) {
            try {
                await deleteImage(imageId);
                setSavedImages(prev => prev.filter(img => img.id !== imageId));
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (loading) return <div className="container">로딩 중...</div>;
    if (!processData) return <div className="container">데이터를 찾을 수 없습니다.</div>;

    const steps = isEditing ? editedSteps : processData.guideSteps;

    return (
        <div className="container" style={{ paddingBottom: '30px' }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate(`/process/${id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>작업 가이드</h1>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}>
                        <Edit size={20} />
                    </button>
                ) : (
                    <button onClick={handleSave} style={{ background: 'var(--primary)', border: 'none', cursor: 'pointer', color: 'white', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Save size={16} /> 저장
                    </button>
                )}
            </header>

            <div className="glass" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden', marginBottom: '30px' }}>
                <div style={{ height: '200px', backgroundColor: '#1A3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '15px' }}>
                    <BookOpen size={48} opacity={0.3} />
                    <div style={{ fontSize: '14px', opacity: 0.9, textAlign: 'center', marginBottom: '5px', whiteSpace: 'pre-line', lineHeight: '1.5', fontWeight: '500' }}>
                        "작업의 방법은 다양합니다.{'\n'}
                        안전하고 효율적인 방법으로 작업 하십시오."
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>현재 단계</div>
                        <div style={{ fontSize: '24px', fontWeight: '800' }}>STEP {currentStep + 1} / {steps.length}</div>
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ minHeight: '120px' }}
                        >
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input
                                        value={editedSteps[currentStep]}
                                        onChange={(e) => {
                                            const newSteps = [...editedSteps];
                                            newSteps[currentStep] = e.target.value;
                                            setEditedSteps(newSteps);
                                        }}
                                        style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '8px' }}
                                    />
                                    <textarea
                                        value={editedDescriptions[currentStep] || ''}
                                        onChange={(e) => {
                                            const newDescs = [...editedDescriptions];
                                            newDescs[currentStep] = e.target.value;
                                            setEditedDescriptions(newDescs);
                                        }}
                                        style={{ color: '#718096', lineHeight: '1.6', width: '100%', minHeight: '100px', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical' }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '15px' }}>
                                        {steps[currentStep]}
                                    </h2>
                                    <p style={{ color: '#718096', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                        {processData.guideStepDescriptions?.[currentStep] ||
                                            `${steps[currentStep]} 작업을 시작합니다. 안내에 따라 정확하게 진행해 주세요.`}
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                        <button
                            className="btn"
                            style={{ flex: 1, backgroundColor: '#F7FAFC', color: '#718096', padding: '15px', borderRadius: '12px' }}
                            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                            disabled={currentStep === 0}
                        >
                            이전
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 2, padding: '15px', borderRadius: '12px' }}
                            onClick={() => {
                                if (currentStep < steps.length - 1) {
                                    setCurrentStep(prev => prev + 1);
                                } else {
                                    navigate(`/process/${id}`);
                                }
                            }}
                        >
                            {currentStep === steps.length - 1 ? '가이드 숙지 완료' : '다음 단계'}
                        </button>
                    </div>

                    {/* Image Upload Section for Current Step */}
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '700', color: '#1A3A5F' }}>현장 사진 / 참조 이미지</h3>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                style={{ flex: 1, padding: '10px', background: '#f0f2f5', borderRadius: '8px', fontWeight: '600', color: '#1A3A5F', border: '1px dashed #1A3A5F', fontSize: '14px' }}
                            >
                                + 사진 추가
                            </button>
                            {selectedFiles.length > 0 && (
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    style={{ flex: 1, padding: '10px', background: isUploading ? '#ccc' : '#1A3A5F', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '14px' }}
                                >
                                    {isUploading ? uploadStatus : '업로드'}
                                </button>
                            )}
                        </div>

                        {/* Previews */}
                        {previewUrls.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                                {previewUrls.map((url, i) => (
                                    <div key={i} style={{ aspectRatio: '1', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => {
                                                setSelectedFiles(prev => prev.filter((_, idx) => idx !== i));
                                                setPreviewUrls(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Saved Images */}
                        {savedImages.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>저장된 이미지 ({savedImages.length})</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {savedImages.map((img) => (
                                        <div key={img.id} style={{ aspectRatio: '1', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                                            <img
                                                src={img.data}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => setViewingImage(img.data)}
                                            />
                                            <button
                                                onClick={() => handleRemoveSaved(img.id)}
                                                style={{ position: 'absolute', top: 2, right: 2, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Steps List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1A3A5F' }}>전체 진행 단계</h3>
                    {isEditing && (
                        <button onClick={handleAddStep} style={{ background: '#48BB78', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={18} />
                        </button>
                    )}
                </div>
                {steps.map((step, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '15px',
                            borderRadius: '15px',
                            backgroundColor: idx === currentStep ? 'rgba(0, 210, 255, 0.05)' : 'white',
                            border: idx === currentStep ? '1px solid var(--secondary)' : '1px solid #F1F5F9',
                            cursor: 'pointer'
                        }}
                        onClick={() => setCurrentStep(idx)}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: idx <= currentStep ? 'var(--secondary)' : '#E2E8F0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700'
                        }}>
                            {idx < currentStep ? <CheckCircle size={14} /> : idx + 1}
                        </div>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: idx === currentStep ? '700' : '500',
                            color: idx === currentStep ? 'var(--primary)' : '#A0AEC0',
                            flex: 1
                        }}>{step}</span>
                        {isEditing && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStep(idx);
                                }}
                                style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Viewer Modal */}
            {viewingImage && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setViewingImage(null)}
                >
                    <img src={viewingImage} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
                    <button style={{ position: 'absolute', top: 20, right: 20, background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 24 }} onClick={() => setViewingImage(null)}>✕</button>
                </div>
            )}
        </div>
    );
};

export default WorkGuide;
