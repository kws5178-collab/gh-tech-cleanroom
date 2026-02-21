import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import { initDB, saveImage, getAllImages, deleteImage, getImagesByRelatedId } from '../utils/db'; // Import DB utils

const MaterialDetails: React.FC = () => {
    const navigate = useNavigate();
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
    const [savedImages, setSavedImages] = React.useState<{ id: number, data: string }[]>([]); // Store objects from DB
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadStatus, setUploadStatus] = React.useState('');
    const [viewingImage, setViewingImage] = React.useState<string | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Load saved images from IndexedDB on mount
    React.useEffect(() => {
        const loadImages = async () => {
            try {
                await initDB();
                const images = await getImagesByRelatedId('material-specs');
                // Map to the format we need (id and data)
                setSavedImages(images.map(img => ({ id: img.id!, data: img.data })));
            } catch (error) {
                console.error('Failed to load images from DB:', error);
            }
        };
        loadImages();
    }, []);

    // Cleanup object URLs on unmount (only for new previews)
    React.useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);

            // Validate file type
            const validFiles = files.filter(file => file.type.startsWith('image/'));
            if (validFiles.length < files.length) {
                alert('이미지 파일만 선택할 수 있습니다.');
            }

            if (validFiles.length > 0) {
                setSelectedFiles(prev => [...prev, ...validFiles]);

                // Create preview URLs
                const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                setPreviewUrls(prev => [...prev, ...newPreviews]);
            }
        }
        // Reset input value to allow selecting the same file again if needed
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleSelectClick = () => {
        fileInputRef.current?.click();
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert('업로드할 이미지를 선택해주세요.');
            return;
        }

        setIsUploading(true);
        setUploadStatus('업로드 중...');

        try {
            // Save each file to IndexedDB
            for (let i = 0; i < selectedFiles.length; i++) {
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 300));
                await saveImage(selectedFiles[i], 'material-specs');
            }

            // Reload images from DB to update UI
            const images = await getImagesByRelatedId('material-specs');
            setSavedImages(images.map(img => ({ id: img.id!, data: img.data })));

            // Clear selections
            setSelectedFiles([]);
            setPreviewUrls([]);

            setUploadStatus('업로드 완료');
            await new Promise(resolve => setTimeout(resolve, 500));
            alert('업로드 완료');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
            setUploadStatus('');
        }
    };

    const handleRemovePreview = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newUrls = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index]);
            return newUrls;
        });
    };

    const handleRemoveSaved = async (id: number) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await deleteImage(id);
                // Update local state
                setSavedImages(prev => prev.filter(img => img.id !== id));
            } catch (error) {
                console.error('Failed to delete image:', error);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

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
                        onClick={() => navigate(-1)}
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
                    <h1 style={{ fontSize: '18px', fontWeight: '800' }}>자재 제원 목록</h1>
                </div>
            </header>

            <div style={{ marginTop: '20px', padding: '0 10px' }}>
                <div style={{
                    marginBottom: '20px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '15px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '700', color: '#1A3A5F' }}>이미지 업로드</h3>

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
                            onClick={handleSelectClick}
                            disabled={isUploading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: '#f0f2f5',
                                borderRadius: '10px',
                                textAlign: 'center',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#1A3A5F',
                                border: '1px dashed #1A3A5F'
                            }}
                        >
                            + 이미지 선택
                        </button>

                        <button
                            onClick={handleUpload}
                            disabled={isUploading || selectedFiles.length === 0}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: isUploading ? '#ccc' : '#1A3A5F',
                                color: 'white',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: isUploading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}
                        >
                            {isUploading ? uploadStatus : '업로드 시작'}
                        </button>
                    </div>

                    {isUploading && (
                        <div style={{ marginBottom: '15px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                            {uploadStatus}
                        </div>
                    )}

                    {/* Preview Section */}
                    {previewUrls.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>업로드 대기 중 ({previewUrls.length})</h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '10px'
                            }}>
                                {previewUrls.map((url, index) => (
                                    <div key={`preview-${index}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden' }}>
                                        <img
                                            src={url}
                                            alt={`Preview ${index}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                            onClick={() => setViewingImage(url)}
                                        />
                                        {!isUploading && (
                                            <button
                                                onClick={() => handleRemovePreview(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    background: 'rgba(0,0,0,0.5)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Saved Images Section */}
                {savedImages.length > 0 && (
                    <div style={{
                        padding: '20px',
                        background: 'white',
                        borderRadius: '15px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '700', color: '#1A3A5F' }}>업로드된 이미지 ({savedImages.length})</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '10px'
                        }}>
                            {savedImages.map((record) => (
                                <div key={`saved-${record.id}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee' }}>
                                    <img
                                        src={record.data}
                                        alt={`Saved ${record.id}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                                        onClick={() => setViewingImage(record.data)}
                                    />
                                    <button
                                        onClick={() => handleRemoveSaved(record.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            background: 'rgba(255, 0, 0, 0.7)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Image Viewer Modal */}
            {viewingImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '10px'
                    }}
                    onClick={() => setViewingImage(null)}
                >
                    <img
                        src={viewingImage}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            borderRadius: '8px'
                        }}
                    />
                    <button
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'white',
                            border: 'none',
                            color: '#333',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            fontSize: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setViewingImage(null);
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default MaterialDetails;
