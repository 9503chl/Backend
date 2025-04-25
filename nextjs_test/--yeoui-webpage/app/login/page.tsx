'use client';

import LoginForm from '@/components/LoginForm';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.loginContainer}>
      <LoginForm />
    </div>
  );
} 