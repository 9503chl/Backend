'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './logo.module.css';

export default function LogoEditor() {
  const router = useRouter();
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageStyles, setImageStyles] = useState({
    width: '',
    height: '',
    marginLeft: '',
    marginRight: ''
  });

  // 임시로 해시된 API 키를 사용합니다. (실제 프로덕션에서는 안전한 방법으로 관리 필요)
  // 이 값은 Unity 클라이언트 WebServerUtility.cs 에서 "jux6229!"를 SHA256으로 해싱한 값입니다.
  const HASHED_API_KEY_FOR_CLIENT = "870fae1aaa4d079c10456704cfdb2ab9f555e04c42f2b6fa97dd08196c42b92a";

  // 로고 이미지 로드
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('/api/logo');
        if (response.ok) {
          const data = await response.json();
          setLogoImage(data.imageUrl);
          // 이미지 스타일 정보도 로드
          if (data.styles) {
            setImageStyles(data.styles);
          }
        }
      } catch (error) {
        console.error('로고 로드 중 오류:', error);
      }
    };

    loadLogo();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleChange = (property: string, value: string) => {
    setImageStyles(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handleSave = async () => {
    if (!logoImage) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Base64 이미지를 Blob으로 변환
      const base64Data = logoImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/png' });
      const file = new File([blob], 'logo.png', { type: 'image/png' });
      
      // FormData 생성 및 API 호출
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('styles', JSON.stringify(imageStyles));
      
      // API 요청 URL에 apiKey 추가
      const apiUrl = `/api/logo?apiKey=${HASHED_API_KEY_FOR_CLIENT}`;
      
      const response = await fetch(apiUrl, { // 수정된 apiUrl 사용
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        // 서버로부터 받은 에러 메시지를 사용하도록 시도
        let errorMessage = '로고 저장에 실패했습니다.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }
      
      alert('로고가 성공적으로 저장되었습니다.');
      router.refresh();
    } catch (error) {
      console.error('로고 저장 중 오류:', error);
      setError('로고 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← 메인으로 돌아가기
        </Link>
        <h1>로고 이미지 편집</h1>
      </div>

      <div className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.imageContainer} onClick={handleImageClick}>
          {logoImage ? (
            <img 
              src={logoImage} 
              alt="로고 미리보기" 
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.placeholder}>
              로고 이미지를 업로드해주세요
            </div>
          )}
        </div>

        {logoImage && (
          <div className={styles.imageControls}>
            <div className={styles.controlGroup}>
              <label>너비:</label>
              <input
                type="number"
                value={imageStyles.width}
                onChange={(e) => handleStyleChange('width', e.target.value)}
                placeholder="자동"
                min="0"
              />
              <span>px</span>
            </div>

            <div className={styles.controlGroup}>
              <label>높이:</label>
              <input
                type="number"
                value={imageStyles.height}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                placeholder="자동"
                min="0"
              />
              <span>px</span>
            </div>

            <div className={styles.controlGroup}>
              <label>왼쪽 여백:</label>
              <input
                type="number"
                value={imageStyles.marginLeft}
                onChange={(e) => handleStyleChange('marginLeft', e.target.value)}
                placeholder="0"
                min="0"
              />
              <span>px</span>
            </div>

            <div className={styles.controlGroup}>
              <label>오른쪽 여백:</label>
              <input
                type="number"
                value={imageStyles.marginRight}
                onChange={(e) => handleStyleChange('marginRight', e.target.value)}
                placeholder="0"
                min="0"
              />
              <span>px</span>
            </div>
          </div>
        )}

        <div className={styles.controls}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.fileInput}
            id="logoUpload"
          />
          <label htmlFor="logoUpload" className={styles.uploadButton}>
            이미지 선택
          </label>
          
          <button
            onClick={handleSave}
            disabled={!logoImage || isSaving}
            className={styles.saveButton}
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
} 