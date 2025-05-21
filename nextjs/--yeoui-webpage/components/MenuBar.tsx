'use client';

import { Editor } from '@tiptap/react';
import { useCallback, useRef, useState } from 'react';
import styles from '../app/page.module.css';

// 지원되는 언어 타입
type Language = 'ko' | 'en';

interface MenuBarProps {
  editor: Editor | null;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onSave: () => void;
  saving: boolean;
  onAddImage: (file: File) => void;
}

// 사용 가능한 폰트 목록
const FONTS = [
  { name: '기본 글꼴', value: 'Arial' },
  { name: '명조체', value: 'serif' },
  { name: '고딕체', value: 'sans-serif' },
  { name: '굴림체', value: 'Gulim' },
  { name: '돋움체', value: 'Dotum' },
  { name: '바탕체', value: 'Batang' },
  { name: '맑은 고딕', value: 'Malgun Gothic' },
];

// 색상 팔레트
const COLORS = [
  '#ffffff', '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080',
  '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
];

const MenuBar = ({ editor, language, onLanguageChange, onSave, saving, onAddImage }: MenuBarProps) => {
  // 파일 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 색상 팝업 상태
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // 언어 전환 핸들러
  const handleLanguageChange = useCallback(() => {
    const newLanguage = language === 'ko' ? 'en' : 'ko';
    onLanguageChange(newLanguage);
  }, [language, onLanguageChange]);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddImage(files[0]);
      
      // 파일 입력 초기화 (동일한 파일 다시 선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 이미지 버튼 클릭 핸들러
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 색상 선택 핸들러
  const handleColorSelect = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setShowColorPicker(false);
    }
  };

  // 글꼴 변경 핸들러
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const font = e.target.value;
    if (editor) {
      editor.chain().focus().setFontFamily(font).run();
    }
  };

  // 텍스트 정렬 핸들러들
  const handleAlignLeft = () => {
    editor?.chain().focus().setTextAlign('left').run();
  };

  const handleAlignCenter = () => {
    editor?.chain().focus().setTextAlign('center').run();
  };

  const handleAlignRight = () => {
    editor?.chain().focus().setTextAlign('right').run();
  };

  if (!editor) {
    return (
      <div className={styles.menuBar}>
        <div className={styles.editorControls}>
          <span>에디터 로딩 중...</span>
        </div>
        <div className={styles.editorActions}>
          <button 
            className={styles.actionButton}
            onClick={handleLanguageChange}
          >
            {language === 'ko' ? '영어로 전환' : '한국어로 전환'}
          </button>
          <button 
            className={styles.saveButton} 
            disabled
          >
            저장
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.menuBar}>
      <div className={styles.editorControls}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? styles.isActive : ''}
          title="굵게"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? styles.isActive : ''}
          title="기울임"
        >
          <i>I</i>
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? styles.isActive : ''}
          title="단락"
        >
          P
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}
          title="제목 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}
          title="제목 2"
        >
          H2
        </button>
        <button
          onClick={handleImageButtonClick}
          title="이미지 추가"
          className={styles.imageButton}
        >
          이미지
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
      </div>
      <div className={styles.editorActions}>
        <button 
          className={styles.actionButton}
          onClick={handleLanguageChange}
        >
          {language === 'ko' ? '영어로 전환' : '한국어로 전환'}
        </button>
        <button 
          className={styles.saveButton} 
          onClick={onSave}
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
};

export default MenuBar; 