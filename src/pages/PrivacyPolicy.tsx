import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ paddingBottom: '50px' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', paddingTop: '10px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>개인정보처리방침</h1>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={{ padding: '25px', borderRadius: '20px', lineHeight: '1.6', fontSize: '14px', color: '#4A5568' }}
            >
                <section style={{ marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>1. 수집하는 개인정보 항목</h2>
                    <p>G.H Tech 작업관리 시스템은 서비스 제공을 위해 최소한의 정보만을 수집하며, 사용자가 직접 입력하거나 촬영한 다음의 정보를 포함할 수 있습니다:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                        <li>작업 현장 및 자재 점검 사진 (사용자 촬영본)</li>
                        <li>추가한 사용자 정의 자재 및 공구 명칭</li>
                        <li>서비스 이용 기록 및 로그</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>2. 개인정보의 수집 및 이용 목적</h2>
                    <p>수집된 정보는 다음의 목적을 위해서만 이용됩니다:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                        <li>작업 공정별 자재 및 공구 점검 상태 기록</li>
                        <li>현장 작업 증빙을 위한 자재 사진 관리</li>
                        <li>서비스 품질 개선 및 오류 진단</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>3. 개인정보의 보유 및 이용기간</h2>
                    <p>원칙적으로, 이용자의 개인정보는 서비스 이용 기간 동안 보유하며, 사용자가 앱 내 데이터를 삭제하거나 서비스 탈퇴 요청 시 지체 없이 파기합니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.</p>
                </section>

                <section style={{ marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>4. 개인정보의 파기절차 및 방법</h2>
                    <p>전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다. 브라우저 내 로컬 데이터(IndexedDB 등)의 경우 사용자가 직접 데이터를 초기화함으로써 즉시 파기할 수 있습니다.</p>
                </section>

                <section style={{ marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>5. 이용자의 권리와 그 행사방법</h2>
                    <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 데이터 삭제를 요청할 수 있습니다.</p>
                </section>

                <section>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>6. 개인정보 보호책임자 및 문의</h2>
                    <p>서비스 이용 중 발생하는 개인정보 보호 관련 민원은 현장 관리자 또는 G.H Tech 본사 담당자에게 문의하시기 바랍니다.</p>
                    <p style={{ marginTop: '10px', fontWeight: '600' }}>시행일자: 2026년 2월 21일</p>
                </section>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;
