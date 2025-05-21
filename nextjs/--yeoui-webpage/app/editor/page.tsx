'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageClient from '@/components/PageClient';
import Link from 'next/link';
import styles from './editor.module.css';

// 페이지 컨텐츠 컴포넌트
function PageContent() {
  const searchParams = useSearchParams();
  const lang = searchParams?.get('lang') || 'ko';
  return <PageClient defaultLanguage={lang as 'ko' | 'en'} />;
}

export default function EditorPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← 메인으로 돌아가기
        </Link>
        <h1>페이지 편집</h1>
      </div>
      
      <Suspense fallback={<div>로딩 중...</div>}>
        <PageContent />
      </Suspense>
    </div>
  );
} 