'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import './EditorStyles.css'; // 에디터 스타일 적용

// Editor 컴포넌트 동적 임포트
const Editor = dynamic(() => import('@/components/Editor'), {
    ssr: false,
    loading: () => <p>에디터 로딩 중...</p>
});

// Props 타입 정의
interface PageData {
  editorContent: any; // Tiptap JSON 콘텐츠
}

interface PageClientProps {
  initialData?: PageData | null;
  defaultLanguage?: Language;
}

// 지원되는 언어 타입
type Language = 'ko' | 'en';

export default function PageClient({ initialData = null, defaultLanguage = 'ko' }: PageClientProps) {
    // 언어 상태 관리 (초기값은 defaultLanguage)
    const [language, setLanguage] = useState<Language>(defaultLanguage);
    // 현재 언어에 대한 데이터 상태
    const [currentData, setCurrentData] = useState<PageData | null>(initialData);
    // 로딩 상태
    const [loading, setLoading] = useState<boolean>(false);
    // 에러 메시지
    const [error, setError] = useState<string | null>(null);

    // 페이지 데이터 가져오기 함수
    const fetchPageData = useCallback(async (lang: Language) => {
        setLoading(true);
        setError(null);
        
        try {
            // 언어별 API 엔드포인트 설정
            const endpoint = lang === 'en' ? 'page-content-en' : 'page-content';
            const response = await fetch(`/api/${endpoint}`, {
                headers: { 
                    'Accept': 'application/json',
                    'x-api-key': 'jux6229!'
                },
                cache: 'no-store'
            });
            
            if (!response.ok) {
                // 404는 콘텐츠가 없는 정상적인 케이스로 처리
                if (response.status === 404) {
                    console.log(`${lang} 페이지 콘텐츠가 아직 없습니다.`);
                    setCurrentData(null);
                    return;
                }
                
                throw new Error(`페이지 콘텐츠 가져오기 실패: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data && typeof data.editorContent === 'object' && data.editorContent !== null) {
                console.log(`${lang} 페이지 콘텐츠 로드 성공:`, data);
                setCurrentData(data);
            } else {
                console.warn(`${lang} 페이지 콘텐츠 형식이 올바르지 않습니다:`, data);
                setCurrentData(null);
            }
        } catch (err) {
            console.error(`${lang} 페이지 콘텐츠 로드 오류:`, err);
            setError('페이지 콘텐츠를 가져오는 중 오류가 발생했습니다.');
            setCurrentData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // 컴포넌트 마운트 시 또는 언어 변경 시 데이터 로드
    useEffect(() => {
        // 초기 데이터가 없거나 언어가 변경된 경우에만 API에서 데이터 로드
        if (!initialData || language !== defaultLanguage) {
            fetchPageData(language);
        }
    }, [language, initialData, defaultLanguage, fetchPageData]);

    // 언어 전환 핸들러 - 언어 변경 시 URL 파라미터 업데이트
    const toggleLanguage = () => {
        const newLang = language === 'ko' ? 'en' : 'ko';
        setLanguage(newLang);
        
        // URL 업데이트 (페이지 새로고침 없이)
        const url = new URL(window.location.href);
        if (newLang === 'en') {
            url.searchParams.set('lang', 'en');
        } else {
            url.searchParams.delete('lang');
        }
        window.history.pushState({}, '', url.toString());
    };
    
    // 로딩 중인 경우
    if (loading) {
        return (
            <div className="page-container">
                <div className="language-toggle">
                    <button onClick={toggleLanguage} className="language-button" disabled>
                        {language === 'ko' ? '영어로 전환' : '한국어로 전환'}
                    </button>
                </div>
                <div className="loading-container">콘텐츠 로딩 중...</div>
            </div>
        );
    }
    
    // 에러가 발생한 경우
    if (error) {
        return (
            <div className="page-container">
                <div className="language-toggle">
                    <button onClick={toggleLanguage} className="language-button">
                        {language === 'ko' ? '영어로 전환' : '한국어로 전환'}
                    </button>
                </div>
                <div className="error-container">{error}</div>
            </div>
        );
    }
    
    // 현재 언어에 맞는 데이터가 없으면 빈 Editor 렌더링
    if (!currentData || !currentData.editorContent) {
        console.log(`Rendering empty Editor component (client) in ${language} mode.`);
        return (
            <div className="page-container">
                <div className="language-toggle">
                    <button onClick={toggleLanguage} className="language-button">
                        {language === 'ko' ? '영어로 전환' : '한국어로 전환'}
                    </button>
                </div>
                <Editor language={language} />
            </div>
        );
    }

    // 데이터가 있으면 Editor에 초기 콘텐츠로 전달
    console.log(`Rendering Editor with saved content (client) in ${language} mode.`);
    return (
        <div className="page-container">
            <div className="language-toggle">
                <button onClick={toggleLanguage} className="language-button">
                    {language === 'ko' ? '영어로 전환' : '한국어로 전환'}
                </button>
            </div>
            <Editor initialContent={currentData.editorContent} language={language} />
        </div>
    );
} 