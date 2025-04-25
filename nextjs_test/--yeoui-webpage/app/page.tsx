'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageClient from '@/components/PageClient';

// 페이지 컨텐츠 컴포넌트
function PageContent() {
  const searchParams = useSearchParams();
  const lang = searchParams?.get('lang') || 'ko';
  return <PageClient defaultLanguage={lang as 'ko' | 'en'} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PageContent />
    </Suspense>
  );
}
