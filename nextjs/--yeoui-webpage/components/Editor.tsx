'use client';

import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImageOfficial from '@tiptap/extension-image'; // 공식 이미지 확장
import OriginalTextStyle from '@tiptap/extension-text-style'; // 원본 이름 변경
import { Mark } from '@tiptap/core'; // Mark 가져오기
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import html2canvas from 'html2canvas'; // html2canvas import 추가
import './EditorStyles.css';

// 지원되는 언어 타입
type Language = 'ko' | 'en';

// 사용 가능한 글꼴 목록
const availableFonts = [
    { label: 'Noto Sans KR', value: 'Noto Sans KR' }, // 추가한 한글 폰트를 기본으로 설정
    { label: '기본', value: '' }, // 기본 글꼴 (테마 또는 브라우저 기본값)
    { label: 'Inter', value: 'Inter' },
    { label: 'Comic Sans', value: 'Comic Sans MS' }, // CSS 이름과 일치
    { label: 'Roboto Mono', value: 'Roboto Mono' },
];

// TextStyle을 확장하여 fontSize 속성 추가
const TextStyleWithFontSize = OriginalTextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(), // 기존 속성들 (예: color) 유지
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          // 이미 style 속성이 있는 경우, 기존 스타일과 병합해야 할 수 있음
          // 여기서는 단순화를 위해 fontSize만 있는 새 style 객체를 반환하거나,
          // 기존 attributes.style이 있다면 거기에 fontSize를 추가/덮어쓰는 로직 필요
          // Tiptap은 보통 renderHTML에서 반환된 객체의 각 키를 HTML 속성으로 변환함
          // 따라서 { style: `font-size: ${attributes.fontSize}` } 가 적절
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
});

// TiptapImageOfficial을 확장하여 사용자 정의 속성 추가
const CustomImageExtension = TiptapImageOfficial.extend({
  addAttributes() {
    return {
      ...this.parent?.(), // 기존 속성들 (src, alt, title 등) 유지
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      // marginLeft, marginRight는 숫자 값을 저장
      marginLeft: {
        default: null,
        parseHTML: element => {
          const value = element.style.marginLeft;
          return value ? parseInt(value, 10) : null;
        },
        renderHTML: attributes => ({}), // 이 속성 자체는 HTML을 직접 렌더링하지 않음
      },
      marginRight: {
        default: null,
        parseHTML: element => {
          const value = element.style.marginRight;
          return value ? parseInt(value, 10) : null;
        },
        renderHTML: attributes => ({}), // 이 속성 자체는 HTML을 직접 렌더링하지 않음
      },
      // 이 style 속성이 실제 HTML style 속성을 담당
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (attributes.style) {
            return { style: attributes.style };
          }
          return {};
        },
      },
    };
  },
});

// 클라이언트 측에서 사용할 SHA256 해시 함수
async function computeSha256HashClientSide(rawData: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// --- MenuBar (텍스트 서식 + 이미지 추가) ---
const MenuBar: React.FC<{ editor: any; onSaveImage: () => void; onSaveContent: () => void; isSaving: boolean; language: Language }> = ({ editor, onSaveImage, onSaveContent, isSaving, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempFontSize, setTempFontSize] = useState<string>(''); // 텍스트 크기 임시 상태 추가

  const handleAddImageClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && editor) {
      const file = event.target.files[0];
      console.log('[Editor.tsx] handleFileChange: File selected:', file.name);
      try {
        const clientSideHashedApiKey = localStorage.getItem('hashedApiKey'); // localStorage에서 API 키 가져오기
        if (!clientSideHashedApiKey) {
          console.error('[Editor.tsx] Hashed API key not found in localStorage.');
          alert('API 키를 찾을 수 없습니다. 페이지를 새로고침하거나 다시 로그인해주세요.');
          return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('language', language); // language 추가

        // API 호출 시 URL에 apiKey 쿼리 파라미터 추가
        const response = await fetch(`/api/upload-image?apiKey=${clientSideHashedApiKey}`, { 
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Image upload failed: ${response.status} ${errorText}`);
        }
        const result = await response.json(); 
        if (result.url) {
          console.log('[Editor.tsx] Image uploaded, URL:', result.url);
          editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
        } else {
          console.error('[Editor.tsx] Image upload failed: No URL in response', result);
          alert('이미지 업로드에 실패했습니다: 서버 응답에 URL이 없습니다.');
        }
      } catch (error) {
        console.error('[Editor.tsx] Image upload error:', error);
        alert(`이미지 업로드 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (event.target) {
      event.target.value = '';
    }
  }, [editor, language]); // language 의존성 추가

  const setColor = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (editor && event.target.value) editor.chain().focus().setMark('textStyle', { color: event.target.value }).run();
  }, [editor]);

  const setFontFamily = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const font = event.target.value;
    if (editor) {
        if (font) editor.chain().focus().setFontFamily(font).run();
        else editor.chain().focus().unsetFontFamily().run();
    }
  }, [editor]);

  // setFontSize 콜백: 임시 상태값을 에디터에 적용
  const applyTempFontSize = useCallback(() => {
    if (editor) {
      const value = tempFontSize;
      const size = parseInt(value, 10);
      if (!isNaN(size) && size > 0) {
        editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
      } else if (value === '') { // 입력값이 비워지면 기본으로
        editor.chain().focus().setMark('textStyle', { fontSize: null }).run();
      }
      // 적용 후 에디터 포커스 유지를 위해, 혹은 선택 유지를 위해 추가 작업이 필요할 수 있음
      // editor.commands.focus(); // 필요시 포커스 재설정
    }
  }, [editor, tempFontSize]);

  // 현재 텍스트 크기 가져오기 (숫자 부분만) - 이 함수는 외부 상태에 의존하지 않도록 유지
  const getCurrentEditorFontSize = useCallback(() => {
    if (!editor) return '';
    const fontSizeAttr = editor.getAttributes('textStyle').fontSize;
    if (fontSizeAttr && typeof fontSizeAttr === 'string') {
      const match = fontSizeAttr.match(/^(\d+)/);
      return match ? match[1] : '';
    }
    return '';
  }, [editor]); // editor가 바뀔 때마다 이 함수도 새로 정의됨

  // 에디터 선택 변경 시 tempFontSize 업데이트
  useEffect(() => {
    if (editor) {
      const updateTempSize = () => {
        setTempFontSize(getCurrentEditorFontSize());
      };
      editor.on('selectionUpdate', updateTempSize);
      editor.on('focus', updateTempSize); // 포커스 시에도 업데이트
      setTempFontSize(getCurrentEditorFontSize()); // 초기 마운트 및 editor 변경 시

      return () => {
        editor.off('selectionUpdate', updateTempSize);
        editor.off('focus', updateTempSize);
      };
    }
  }, [editor, getCurrentEditorFontSize]); // getCurrentEditorFontSize를 의존성에 추가

  // Hooks 호출 이후에 editor 객체의 유효성을 검사하고 렌더링을 결정합니다.
  if (!editor) {
    return null;
  }

  // editor가 유효할 때만 실행되는 로직
  const currentFont = availableFonts.find(font => editor.isActive('textStyle', { fontFamily: font.value }))?.value || '';
  // const currentNumericFontSize = getCurrentEditorFontSize(); // 이제 tempFontSize 사용

  return (
    <div className="menu-bar">
      <h1 className="section-title">글꼴 편집</h1>
      <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
      <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}>Paragraph</button>
       <select value={currentFont} onChange={setFontFamily} className="font-select" title="글꼴">
          {availableFonts.map(font => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
        <label htmlFor="fontSizeInput" style={{ color: '#ccc', marginRight: '0.3rem', marginLeft: '0.5rem' }}>글씨 크기:</label>
        <input 
          type="number"
          id="fontSizeInput"
          value={tempFontSize} // 임시 상태와 바인딩
          onChange={(e) => setTempFontSize(e.target.value)} // 임시 상태만 업데이트
          placeholder="기본"
          style={{ width: '50px', marginRight: '0.1rem', padding: '0.2rem 0.4rem', backgroundColor: '#555', color: 'white', border: '1px solid #777', borderRadius: '4px' }}
        />
        <span style={{ color: '#ccc', marginRight: '0.2rem' }}>px</span>
        <button onClick={applyTempFontSize} style={{ padding: '0.2rem 0.5rem', marginLeft: '0.2rem', backgroundColor: '#666', color: 'white', border: '1px solid #888', borderRadius: '4px' }}>적용</button>
       <input type="color" value={editor.getAttributes('textStyle').color || '#000000'} onChange={setColor} data-testid="setColor" title="글자 색상" className="color-input" />
       <button onClick={handleAddImageClick}>Add Image</button>
       <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
    </div>
  );
};

// --- ImageToolbar (이미지 선택 시 나타나는 툴바) ---
const ImageToolbar = ({ editor, styles, handleInputChange, applyStyles, isDisabled }: { editor: any; styles: any; handleInputChange: any; applyStyles: any; isDisabled: boolean }) => {
    if (!editor) return null;

    // verticalAlignOptions 배열 다시 추가
    const verticalAlignOptions = [
        { label: '중간', value: 'middle' },
        { label: '위쪽', value: 'top' },
        { label: '아래쪽', value: 'bottom' },
        { label: '텍스트-위', value: 'text-top' },
        { label: '텍스트-아래', value: 'text-bottom' },
        { label: '기준선', value: 'baseline' },
    ];

    return (
        <div className={`image-toolbar ${isDisabled ? 'disabled' : ''}`}>
            <h1 className="section-title">이미지 편집</h1>
            <div className="control-item">
                <label htmlFor="imgWidth">너비:</label>
                <input 
                    type="number" 
                    id="imgWidth"
                    value={styles.width || ''} 
                    onChange={(e) => handleInputChange('width', e.target.value)} 
                    disabled={isDisabled}
                    placeholder="auto"
                />
                <span>px</span>
            </div>
            <div className="control-item">
                <label htmlFor="imgHeight">높이:</label>
                <input 
                    type="number" 
                    id="imgHeight"
                    value={styles.height || ''} 
                    onChange={(e) => handleInputChange('height', e.target.value)} 
                    disabled={isDisabled}
                    placeholder="auto"
                />
                <span>px</span>
            </div>
            <div className="control-item">
                <label htmlFor="imgMarginLeft">좌측 바깥 여백:</label>
                <input 
                    type="number" 
                    id="imgMarginLeft"
                    value={styles.marginLeft || ''}
                    onChange={(e) => handleInputChange('marginLeft', e.target.value)} 
                    disabled={isDisabled}
                    placeholder="0"
                />
                <span>px</span>
            </div>
            <div className="control-item">
                <label htmlFor="imgMarginRight">우측 바깥 여백:</label>
                <input 
                    type="number" 
                    id="imgMarginRight"
                    value={styles.marginRight || ''}
                    onChange={(e) => handleInputChange('marginRight', e.target.value)} 
                    disabled={isDisabled}
                    placeholder="0"
                />
                <span>px</span>
            </div>
            {/* 수직 정렬 UI 다시 추가 */}
            <div className="control-item">
                <label htmlFor="imgVerticalAlign">수직 정렬:</label>
                <select 
                    id="imgVerticalAlign"
                    value={styles.verticalAlign || 'middle'} // styles.verticalAlign 사용
                    onChange={(e) => handleInputChange('verticalAlign', e.target.value)} 
                    disabled={isDisabled}
                    className="font-select" // 기존 스타일 재활용
                    title="이미지 수직 정렬"
                >
                    {verticalAlignOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <button onClick={applyStyles} disabled={isDisabled}>스타일 적용</button>
            <button 
                onClick={() => {
                    editor.chain().focus().updateAttributes('image', { 
                        width: null, 
                        height: null, 
                        marginLeft: null,
                        marginRight: null,
                        style: 'vertical-align: middle;', // 초기화 시 vertical-align: middle 적용
                    }).run();
                    handleInputChange('width', '');
                    handleInputChange('height', '');
                    handleInputChange('marginLeft', '');
                    handleInputChange('marginRight', '');
                    handleInputChange('verticalAlign', 'middle'); // styles.verticalAlign 상태도 middle로 초기화
                }} 
                disabled={isDisabled}
                title="이미지 크기 및 바깥 여백을 초기화합니다"
            >
                모든 스타일 초기화
            </button>
        </div>
    );
}

// Helper function to parse style string and apply new styles
// 이 함수는 이제 CustomImageExtension의 renderHTML 로직과 중복될 수 있으므로 주의
const parseAndApplyStyles = (existingStyle = '', newStyles: Record<string, string | number | null>): string => {
    console.log('[parseAndApplyStyles] Input:', { existingStyle, newStyles });
    const styleObj: Record<string, string> = {};
    (existingStyle || '').split(';').forEach(style => {
        const [key, value] = style.split(':');
        if (key && value && key.trim() !== '' && value.trim() !== '') {
            styleObj[key.trim()] = value.trim();
        }
    });

    for (const [key, value] of Object.entries(newStyles)) {
        if (value !== null && value !== undefined && String(value).trim() !== '') {
             // width, height는 이제 직접 속성이므로 style 객체에서 제거 (CustomImageExtension이 처리)
            if (key === 'width' || key === 'height') {
                delete styleObj[key]; 
                continue;
            }
            // paddingLeft, paddingRight도 직접 속성이므로 style 객체에서 제거
            if (key === 'paddingLeft' || key === 'paddingRight') {
                delete styleObj[key];
                continue;
            }
            styleObj[key] = String(value).endsWith('px') ? String(value) : `${value}px`;
        } else {
            delete styleObj[key];
        }
    }
    const result = Object.entries(styleObj).map(([k, v]) => `${k}: ${v}`).join('; ');
    console.log('[parseAndApplyStyles] Output for remaining styles:', result);
    return result; // 이 함수는 이제 패딩 외의 스타일만 처리하게 될 수 있음
};

const getStyleValue = (styleString = '', propName: string): string | null => {
    console.log('[getStyleValue] Input:', { styleString, propName });
    if (!styleString) return null;
    // paddingLeft, paddingRight는 이제 직접 속성으로 읽어오므로, 이 함수는 그 외 스타일에만 사용될 수 있음
    if (propName === 'padding-left' || propName === 'padding-right') {
        console.warn(`[getStyleValue] Attempting to get ${propName} via style string, but it should be a direct attribute now.`);
        return null; // 또는 attributes에서 직접 읽도록 유도
    }
    const propNamePattern = propName.replace(/([A-Z])/g, "-$1").toLowerCase();
    const regex = new RegExp(`${propNamePattern}\s*:\s*([^;]+)`);
    const match = styleString.match(regex);
    const result = match ? match[1].trim().replace(/px$/, '') : null;
    console.log('[getStyleValue] Output:', result);
    return result;
};

// temporarilyApplyStyles 함수는 현재 테스트에서는 직접 사용되지 않음 (주석 처리 또는 유지)
const temporarilyApplyStyles = (element: HTMLElement, temporaryCssTextOverwrite: string): (() => void) => {
  const originalCssText = element.style.cssText; 
  element.style.cssText = temporaryCssTextOverwrite;
  return () => { element.style.cssText = originalCssText; };
};

// --- 메인 에디터 컴포넌트 ---
export default function Editor({ initialContent = null, language = 'ko' }: { initialContent?: any, language?: Language }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageIsSelected, setImageIsSelected] = useState(false);
  const editorContentRef = useRef<HTMLDivElement>(null);

  // styles 상태에 width, height를 string 또는 null로 저장 (placeholder를 위해)
  const [styles, setStyles] = useState<{
    width: string | null;
    height: string | null;
    marginLeft: string | null;
    marginRight: string | null;
    verticalAlign: string | null;
  }>({ width: null, height: null, marginLeft: null, marginRight: null, verticalAlign: 'middle' });

  // API 키를 localStorage에 설정하는 useEffect 추가
  useEffect(() => {
    const ORIGINAL_API_KEY = "jux6229!"; // 중요: 이 키는 middleware.ts의 SERVER_ORIGINAL_API_KEY와 동일해야 합니다.

    const initializeApiKey = async () => {
      try {
        const existingHashedKey = localStorage.getItem('hashedApiKey');
        if (!existingHashedKey) {
          console.log('[Editor.tsx] Hashed API key not found in localStorage. Computing and setting...');
          const hashedKey = await computeSha256HashClientSide(ORIGINAL_API_KEY);
          localStorage.setItem('hashedApiKey', hashedKey);
          console.log('[Editor.tsx] Hashed API key has been set in localStorage:', hashedKey);
        } else {
          // 선택 사항: 기존 키가 서버에서 기대하는 키와 일치하는지 확인할 수도 있습니다.
          // 지금은 단순히 존재 여부만 확인합니다.
          console.log('[Editor.tsx] Hashed API key already exists in localStorage.');
        }
      } catch (error) {
        console.error('[Editor.tsx] Error initializing API key in localStorage:', error);
      }
    };

    initializeApiKey();
  }, []); // 빈 배열은 컴포넌트 마운트 시 1회만 실행

  const editor = useEditor({
    extensions: [
        StarterKit.configure({
          bulletList: { keepMarks: true, keepAttributes: true },
          orderedList: { keepMarks: true, keepAttributes: true },
          history: { depth: 200, newGroupDelay: 500 }, 
          heading: { levels: [1, 2, 3, 4] },
          listItem: false, // StarterKit의 listItem 비활성화
        }),
        TextStyleWithFontSize, // 커스텀 TextStyleWithFontSize 사용
        Color.configure({ types: [TextStyleWithFontSize.name, ListItem.name] }), // Color 확장도 새 이름 사용
        ListItem, // 우리가 명시적으로 ListItem 추가
        TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
        Underline,
        Link.configure({
          openOnClick: true,
          autolink: true,
          linkOnPaste: true,
          validate: (href: string) => /^https?:\/\//.test(href),
        }),
        CustomImageExtension.configure({
          inline: true,
          allowBase64: true,
          HTMLAttributes: {
            class: 'tiptap-image',
          },
        }),
        FontFamily.configure({}),
    ],
    editorProps: { attributes: { class: 'm-5 focus:outline-none' } },
    immediatelyRender: false, 
    onCreate: ({ editor }) => {
      console.log('[Editor onCreate] Editor instance created. Lang:', language, editor);
      if (!editor) {
        console.error('[Editor onCreate] FATAL: Editor instance is NULL!');
        return;
      }
      editor.commands.setFontFamily('Noto Sans KR');
    },
    onSelectionUpdate: ({ editor }) => {
        console.log('[onSelectionUpdate] Called.');
        if (!editor) {
            console.error('[onSelectionUpdate] Editor is null or undefined here!');
            return;
        }
        const isActive = editor.isActive('image');
        console.log('[onSelectionUpdate] editor.isActive("image") result:', isActive);
        setImageIsSelected(isActive);
        console.log('[onSelectionUpdate] setImageIsSelected to:', isActive);

        if (isActive) {
            const attrs = editor.getAttributes('image');
            console.log('[onSelectionUpdate] Active image attrs (CustomImage - Margin & VAlign):', attrs);
            let currentVerticalAlign = 'middle'; // 기본값
            if (attrs.style && typeof attrs.style === 'string') {
                const match = attrs.style.match(/vertical-align:\s*([^;]+);?/);
                if (match && match[1]) {
                    currentVerticalAlign = match[1].trim();
                }
            }
            setStyles({
                width: attrs.width !== undefined && attrs.width !== null ? String(attrs.width) : null,
                height: attrs.height !== undefined && attrs.height !== null ? String(attrs.height) : null,
                marginLeft: attrs.marginLeft !== undefined && attrs.marginLeft !== null ? String(attrs.marginLeft) : null,
                marginRight: attrs.marginRight !== undefined && attrs.marginRight !== null ? String(attrs.marginRight) : null,
                verticalAlign: currentVerticalAlign,
            });
        } else {
            console.log('[onSelectionUpdate] Image not active, resetting styles state.');
            setStyles({ width: null, height: null, marginLeft: null, marginRight: null, verticalAlign: 'middle' });
        }
    },
  });

  useEffect(() => {
    console.log('[useEffect initialContent] Props changed:', { editor: !!editor, initialContent: !!initialContent });
    if (editor && initialContent) {
      console.log('[useEffect initialContent] Setting content to editor.');
      editor.commands.setContent(initialContent, false);
    }
  }, [editor, initialContent]);

  const handleInputChange = (attr: 'width' | 'height' | 'marginLeft' | 'marginRight' | 'verticalAlign', value: string) => { 
    console.log('[handleInputChange] attr:', attr, 'value:', value);
    setStyles(prev => {
        const newState = { ...prev, [attr]: value === '' ? null : value };
        console.log('[handleInputChange] newStyles state (Margin & VAlign):', newState);
        return newState;
    }); 
  };

  const applyStyles = () => {
    console.log('[applyStyles] Clicked. Current styles state (VAlign reverted to ImageToolbar):', styles);
    if (!editor || !editor.isActive('image')) {
        console.warn('[applyStyles] Editor not ready or image not selected.');
        return;
    }
    
    const newWidth = styles.width ? parseInt(styles.width, 10) : null;
    const newHeight = styles.height ? parseInt(styles.height, 10) : null;
    const newMarginLeft = styles.marginLeft ? parseInt(styles.marginLeft, 10) : null;
    const newMarginRight = styles.marginRight ? parseInt(styles.marginRight, 10) : null;
    const newVerticalAlign = styles.verticalAlign || 'middle'; // styles 상태에서 가져옴

    console.log('[applyStyles] Parsed values (VAlign reverted to ImageToolbar):', { newWidth, newHeight, newMarginLeft, newMarginRight, newVerticalAlign });

    if ((newWidth !== null && isNaN(newWidth)) || 
        (newHeight !== null && isNaN(newHeight)) ||
        (newMarginLeft !== null && isNaN(newMarginLeft)) ||
        (newMarginRight !== null && isNaN(newMarginRight)) ) {
        alert("입력 값은 숫자여야 합니다.");
        console.error('[applyStyles] Invalid number input.');
        return;
    }
    
    let styleString = `vertical-align: ${newVerticalAlign};`;
    if (newMarginLeft !== null) {
      styleString += ` margin-left: ${newMarginLeft}px;`;
    }
    if (newMarginRight !== null) {
      styleString += ` margin-right: ${newMarginRight}px;`;
    }
    styleString = styleString.trim().replace(/;$/, '');

    const updatePayload: Record<string, any> = {
        width: newWidth,
        height: newHeight,
        style: styleString.trim() || `vertical-align: ${newVerticalAlign};`, // 비어도 최소한 vertical-align은 적용
        marginLeft: newMarginLeft,
        marginRight: newMarginRight,
    };

    console.log('[applyStyles] 최종 updateAttributes payload (VAlign reverted to ImageToolbar):', updatePayload);
    
    const { from } = editor.state.selection;
    editor.chain().focus().updateAttributes('image', updatePayload).run();
    console.log('[applyStyles] updateAttributes run. Refetching and logging new attrs...');

    if (editor.state.doc.nodeAt(from) && editor.state.doc.nodeAt(from)?.type.name === 'image') {
        console.log('[applyStyles] Attempting to re-select image node at:', from);
        editor.commands.setNodeSelection(from);
        editor.commands.focus();
        console.log('[applyStyles] After re-selection attempt, isActive("image") (VAlign 유지):', editor.isActive('image'));
        const updatedAttrs = editor.getAttributes('image');
        console.log('[applyStyles] Image attrs AFTER re-selection attempt (VAlign 유지):', updatedAttrs);
    } else {
        console.warn('[applyStyles] Could not re-select image node, selection might be lost.');
        editor.commands.focus();
    }
  };
  
  const handleSubmit = async () => { 
    if (!editor) return; 
    setIsSaving(true); 
    setError(null); 
    try {
      // 페이지 데이터 저장 (이미지 처리 방식 변경 필요할 수 있음)
      const jsonContent = editor.getJSON();
      console.log("[handleSubmit] Saving content (Official Image Ext.):", jsonContent);
      // const processedContent = await processBase64Images(jsonContent); // processBase64Images는 커스텀 확장에 맞춰져 있었음
      const endpoint = language === 'ko' ? '/api/page-content' : '/api/page-content-en';
      const response = await fetch(endpoint, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ editorContent: jsonContent }), // 일단 가공 없이 저장 시도
      }); 
      if (!response.ok) { 
        const errorData = await response.json(); 
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`); 
      }
      
      // 페이지 이미지 저장 (savePageAsImage는 그대로 사용 가능할 수 있음)
      await savePageAsImage();
      alert('페이지와 이미지가 성공적으로 저장되었습니다!'); 
      router.refresh(); 
    } catch (err: any) { 
      console.error("Failed to save data (Official Image Ext.):", err); 
      setError(`저장에 실패했습니다: ${err.message}`); 
    } finally { 
      setIsSaving(false); 
    } 
  };
  
  // savePageData는 위 handleSubmit에 통합됨, 또는 jsonContent만 처리하도록 단순화
  // processBase64Images는 공식 확장을 사용하므로, Base64가 어떻게 저장되는지 확인 후 조정 필요. 지금은 사용 안 함.
  // dataURLtoBlob는 유지
  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    if (arr.length < 2) return new Blob();
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) { u8arr[n] = bstr.charCodeAt(n); }
    return new Blob([u8arr], { type: mime });
  };

  // savePageAsImage 함수는 일단 그대로 유지 (DOM 기반이므로 확장과 무관할 수 있음)
  const savePageAsImage = async () => {
    if (!editorContentRef.current) return;
    const targetElement = editorContentRef.current;
    const restoreFunctions: (() => void)[] = [];
    try {
      restoreFunctions.push(temporarilyApplyStyles(targetElement, targetElement.style.cssText + ';background-color: transparent !important; overflow: visible !important;'));
      const childElements = targetElement.querySelectorAll('*');
      childElements.forEach(el => {
          if (el instanceof HTMLElement && el !== targetElement) {
              const originalChildCss = el.style.cssText;
              restoreFunctions.push(temporarilyApplyStyles(el, originalChildCss + (originalChildCss.endsWith(';') || originalChildCss === '' ? '' : ';') + 'background-color: transparent !important; overflow: visible !important;'));
          }
      });
      await new Promise(resolve => setTimeout(resolve, 250)); 
      const cssCalculatedWidth = targetElement.offsetWidth;
      const calculatedScrollHeight = targetElement.scrollHeight;
      const capturedCanvas = await html2canvas(targetElement, { scale: window.devicePixelRatio || 1, backgroundColor: null, logging: true, useCORS: true, allowTaint: true, width: cssCalculatedWidth, height: calculatedScrollHeight, windowWidth: cssCalculatedWidth, windowHeight: calculatedScrollHeight, x: 0, y: 0, scrollX: 0, scrollY: 0 });
      if (capturedCanvas.width === 0 || capturedCanvas.height === 0) throw new Error("html2canvas captured a zero-dimension image.");
      const targetWidth = 2000;
      let aspectRatio = capturedCanvas.height / capturedCanvas.width; if (capturedCanvas.width <= 0) aspectRatio = 1.5; 
      const targetHeight = Math.round(aspectRatio * targetWidth);
      const resizedCanvas = document.createElement('canvas'); resizedCanvas.width = targetWidth; resizedCanvas.height = targetHeight;
      const ctx = resizedCanvas.getContext('2d'); if (!ctx) throw new Error('Failed to get 2D context for resizing');
      ctx.drawImage(capturedCanvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
      const imageData = resizedCanvas.toDataURL('image/png');
      const blob = await (await fetch(imageData)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'page-screenshot.png');
      formData.append('language', language);
      formData.append('width', resizedCanvas.width.toString());
      const response = await fetch('/api/upload-page-image', { method: 'POST', body: formData });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Image saving failed after resize'); }
      return response;
    } catch (error) { console.error("[SAVE_IMAGE_FINAL] CRITICAL ERROR in savePageAsImage:", error); throw new Error('페이지 이미지 저장 중 심각한 오류 발생. 개발자 콘솔을 확인해주세요.');
    } finally { restoreFunctions.slice().reverse().forEach(restore => restore()); }
  };

  return (
    <div className="editor-container">
      {error && <p className="error-message">{error}</p>}
      <MenuBar editor={editor} onSaveImage={savePageAsImage} onSaveContent={handleSubmit} isSaving={isSaving} language={language} />
      <ImageToolbar editor={editor} styles={styles} handleInputChange={handleInputChange} applyStyles={applyStyles} isDisabled={!imageIsSelected} />
      <div ref={editorContentRef} className="screenshot-capture-area">
        <EditorContent editor={editor} className="editor-content" />
      </div>
      <button onClick={handleSubmit} disabled={isSaving || !editor} className="save-button">
        {isSaving ? '저장 중...' : `${language === 'ko' ? '한국어' : '영어'} 페이지 저장/변경`}
      </button>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'bottom-start' }}
          shouldShow={({ editor, view, state, from, to }) => {
            const { selection } = state;
            const node = view.domAtPos(selection.from).node;
            if (node instanceof HTMLElement && node.tagName === 'IMG') return true;
            if (node.parentElement instanceof HTMLElement && node.parentElement.tagName === 'IMG') return true;
            return editor.isActive('image');
          }}
        >
          <div className="bubble-menu">
            <span>이미지 선택됨 (편집은 위 툴바 사용)</span>
          </div>
        </BubbleMenu>
      )}
    </div>
  );
}