'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>관리자 페이지</h1>
        
        <div className={styles.buttonGroup}>
          <Link href="/editor" className={styles.button}>
            페이지 편집
          </Link>
          <Link href="/logo" className={styles.button}>
            로고 이미지 편집
          </Link>
        </div>
      </div>
    </main>
  );
}
