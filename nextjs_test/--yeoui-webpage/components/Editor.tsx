'use client';

import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CustomImage } from '@/utils/tiptapExtensions';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import html2canvas from 'html2canvas';
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

// --- MenuBar (텍스트 서식 + 이미지 추가) ---
const MenuBar = ({ editor }: { editor: any }) => {
  // Base64로 이미지 처리 (서버 즉시 업로드 대신)
  const addImage = useCallback(() => {
    const input = document.createElement('input'); 
    input.type = 'file'; 
    input.accept = 'image/*';
    
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]; 
      if (!file) return;
      
      // 파일을 Base64로 인코딩
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        const base64String = event.target.result as string;
        // data-src-type="base64"를 추가하여 Base64 이미지 표시
        editor.chain().focus().setImage({ 
          src: base64String,
          'data-src-type': 'base64',
          'data-original-name': file.name
        }).run();
      };
      reader.readAsDataURL(file);
    }; 
    
    input.click();
  }, [editor]);

  // 색상 적용 콜백 수정
  const setColor = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (color) { // 유효한 색상 값이 있을 때만 실행
        // setColor 대신 setMark('textStyle', { color: ... }) 사용
        editor.chain().focus().setMark('textStyle', { color }).run();
    } else {
        // 색상 제거 (선택적) - 여기서는 빈 값일 때 아무것도 안 하도록 처리
    }
  }, [editor]);

  // 글꼴 변경 콜백
  const setFontFamily = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const font = event.target.value;
    if (font) {
      editor.chain().focus().setFontFamily(font).run();
    } else {
      // 기본 글꼴로 설정 (FontFamily 제거)
      editor.chain().focus().unsetFontFamily().run();
    }
  }, [editor]);

  if (!editor) return null;

  // 현재 선택된 글꼴 가져오기
  const currentFont = availableFonts.find(font => editor.isActive('textStyle', { fontFamily: font.value }))?.value || '';

  return (
    <div className="menu-bar">
      <h1 className="section-title">글꼴 편집</h1>
      {/* 텍스트 포맷 버튼 */}
      <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
      <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}>Paragraph</button>
       {/* 글꼴 선택 드롭다운 */}
       <select
          value={currentFont}
          onChange={setFontFamily}
          className="font-select" // 스타일링 클래스
          title="글꼴"
        >
          {availableFonts.map(font => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
       {/* 색상 선택 */}
       <input
           type="color"
           value={editor.getAttributes('textStyle').color || '#000000'} 
           onChange={setColor}
           data-testid="setColor"
           title="글자 색상"
           className="color-input"
       />
       {/* 이미지 추가 버튼 */}
       <button onClick={addImage}>Add Image</button>
    </div>
  );
};

// --- ImageToolbar (이미지 선택 시 나타나는 툴바) ---
const ImageToolbar = ({ editor, styles, handleInputChange, applyStyles, isDisabled }: { editor: any; styles: any; handleInputChange: any; applyStyles: any; isDisabled: boolean }) => {
    return (
        <div className={`image-toolbar ${isDisabled ? 'disabled' : ''}`}>
            <h1 className="section-title">이미지 편집</h1>
            {/* 너비 입력 */}
            <div className="control-item">
                <label htmlFor="imgWidth">너비:</label>
                <input id="imgWidth" type="number" value={styles.width} onChange={(e) => handleInputChange('width', e.target.value)} placeholder="자동" min="0" disabled={isDisabled} />
                <span className={isDisabled ? 'disabled-text' : ''}>px</span>
            </div>
             {/* 높이 입력 */}
             <div className="control-item">
                <label htmlFor="imgHeight">높이:</label>
                <input id="imgHeight" type="number" value={styles.height} onChange={(e) => handleInputChange('height', e.target.value)} placeholder="자동" min="0" disabled={isDisabled} />
                <span className={isDisabled ? 'disabled-text' : ''}>px</span>
            </div>
             {/* 왼쪽 간격 입력 */}
             <div className="control-item">
                <label htmlFor="imgMarginLeft">왼쪽여백</label>
                <input id="imgMarginLeft" type="number" value={styles.marginLeft} onChange={(e) => handleInputChange('marginLeft', e.target.value)} placeholder="0" min="0" disabled={isDisabled}/>
                <span className={isDisabled ? 'disabled-text' : ''}>px</span>
            </div>
             {/* 오른쪽 간격 입력 */}
             <div className="control-item">
                <label htmlFor="imgMarginRight">오른쪽 여백</label>
                <input id="imgMarginRight" type="number" value={styles.marginRight} onChange={(e) => handleInputChange('marginRight', e.target.value)} placeholder="0" min="0" disabled={isDisabled}/>
                <span className={isDisabled ? 'disabled-text' : ''}>px</span>
            </div>
             {/* 적용 버튼 */}
             <button onClick={applyStyles} className="apply-style-button" disabled={isDisabled}>
                 스타일 적용
             </button>
          </div>
    );
}

// --- 메인 에디터 컴포넌트 ---
export default function Editor({ initialContent = null, language = 'ko' }: { initialContent?: any, language?: Language }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageIsSelected, setImageIsSelected] = useState(false); // 이미지 선택 상태 추가
  const editorContentRef = useRef<HTMLDivElement>(null); // 에디터 컨텐츠에 대한 ref

  // 이미지 스타일 상태 (변경 없음)
  const [styles, setStyles] = useState<{ width: number | string; height: number | string; marginLeft: number | string; marginRight: number | string }>({
      width: '', height: '', marginLeft: '', marginRight: '',
  });

  const editor = useEditor({
    extensions: [
        StarterKit,
        CustomImage.configure({ HTMLAttributes: { class: 'tiptap-image' }, inline: false }),
        TextStyle,
        Color,
        FontFamily.configure({
             // types: ['textStyle'], // Color와 함께 사용시 필요
        }),
     ],
    content: initialContent || '<p>여기에 내용을 입력하세요...</p>',
    editorProps: { attributes: { class: 'm-5 focus:outline-none' } },
    // 에디터 초기화 시 기본 폰트 설정
    onCreate: ({ editor }) => {
      editor.commands.setFontFamily('Noto Sans KR');
    },
    // 선택 영역 변경 시 스타일 상태 및 이미지 선택 상태 업데이트
    onSelectionUpdate: ({ editor }) => {
        const isActive = editor.isActive('image');
        setImageIsSelected(isActive); // 이미지 선택 상태 업데이트
        if (isActive) {
            const attrs = editor.getAttributes('image');
            setStyles({
                width: attrs.width || '', height: attrs.height || '',
                marginLeft: attrs.marginLeft || '', marginRight: attrs.marginRight || '',
            });
        }
    },
  });

  // 핸들러 및 적용 함수 (변경 없음)
  const handleInputChange = (attr: 'width' | 'height' | 'marginLeft' | 'marginRight', value: string) => { setStyles(prev => ({ ...prev, [attr]: value })); };
  const applyStyles = () => {
      if (!editor) return;
      // attrsToUpdate 객체 초기화 시 타입을 더 유연하게 정의
      const attrsToUpdate: { width?: number | null; height?: number | null; marginLeft?: number | null; marginRight?: number | null } = {};

      const widthVal = parseInt(styles.width as string, 10);
      attrsToUpdate.width = !isNaN(widthVal) && widthVal > 0 ? widthVal : null;
      const heightVal = parseInt(styles.height as string, 10);
      attrsToUpdate.height = !isNaN(heightVal) && heightVal > 0 ? heightVal : null;
      const marginLeftVal = parseInt(styles.marginLeft as string, 10);
      attrsToUpdate.marginLeft = !isNaN(marginLeftVal) && marginLeftVal >= 0 ? marginLeftVal : null;
      const marginRightVal = parseInt(styles.marginRight as string, 10);
      attrsToUpdate.marginRight = !isNaN(marginRightVal) && marginRightVal >= 0 ? marginRightVal : null;

      console.log("Applying styles:", attrsToUpdate);
      editor.chain().focus().updateAttributes('image', attrsToUpdate).run();
  };

  // 페이지 저장/변경 처리
  const handleSubmit = async () => { 
    if (!editor) return; 
    
    setIsSaving(true); 
    setError(null); 
    
    try {
      // 페이지 데이터 저장
      await savePageData();
      
      // 페이지 이미지 저장
      await savePageAsImage();
      
      alert('페이지와 이미지가 성공적으로 저장되었습니다!'); 
      router.refresh(); 
    } catch (err: any) { 
      console.error("Failed to save data:", err); 
      setError(`저장에 실패했습니다: ${err.message}`); 
    } finally { 
      setIsSaving(false); 
    } 
  };
  
  // 페이지 데이터 저장 함수
  const savePageData = async () => {
    // 에디터의 현재 콘텐츠 가져오기
    const jsonContent = editor!.getJSON();
    
    // Base64 이미지 처리 및 저장
    const processedContent = await processBase64Images(jsonContent);
    
    // 처리된 콘텐츠 저장 (언어별로 다른 API 엔드포인트)
    const endpoint = language === 'ko' ? '/api/page-content' : '/api/page-content-en';
    
    const response = await fetch(endpoint, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ editorContent: processedContent }), 
    }); 
    
    if (!response.ok) { 
      const errorData = await response.json(); 
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`); 
    }
    
    return response;
  };
  
  // 페이지를 이미지로 저장하는 함수
  const savePageAsImage = async () => {
    if (!editorContentRef.current) return;
    
    try {
      // HTML2Canvas 옵션 설정
      const options = {
        scale: 2, // 해상도 배율 (높여서 더 선명하게)
        backgroundColor: null, // 투명 배경 (null로 설정)
        allowTaint: true, // 교차 출처 이미지 허용
        useCORS: true, // CORS 사용
        logging: false, // 로깅 비활성화
        width: 2000, // 요구사항대로 2000px 너비 설정
      };
      
      // HTML 요소를 캔버스로 변환
      const canvas = await html2canvas(editorContentRef.current, options);
      
      // 캔버스를 이미지 데이터로 변환 (PNG로 유지 - 투명도 지원)
      const imageData = canvas.toDataURL('image/png');
      
      // 이미지 데이터를 Blob으로 변환
      const blob = await (await fetch(imageData)).blob();
      
      // FormData 생성 및 이미지 추가
      const formData = new FormData();
      formData.append('image', blob, 'page-screenshot.png');
      formData.append('language', language); // 언어 정보 추가
      formData.append('width', '2000'); // 너비 파라미터 추가
      formData.append('transparent', 'true'); // 투명 배경 파라미터 추가
      
      // 서버에 이미지 업로드 (언어별 저장)
      const response = await fetch('/api/upload-page-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '이미지 저장 실패');
      }
      
      return response;
    } catch (error) {
      console.error('Failed to save page as image:', error);
      throw new Error('페이지 이미지 저장에 실패했습니다');
    }
  };

  // Base64 이미지 처리 함수 - 언어에 따라 다른 폴더에 저장
  const processBase64Images = async (content: any) => {
    // ProseMirror 문서 구조를 깊은 복사
    const processedContent = JSON.parse(JSON.stringify(content));
    
    // 비동기 처리를 위한 Promise 배열
    const uploadPromises: Promise<void>[] = [];
    
    // 노드 순회 및 이미지 처리 함수
    const processNode = (node: any) => {
      // 이미지 노드 확인
      if (node.type === 'image' && node.attrs && node.attrs.src) {
        // Base64 이미지 확인
        if (node.attrs['data-src-type'] === 'base64') {
          const promise = (async () => {
            try {
              // Base64 이미지 서버에 업로드
              const blob = dataURLtoBlob(node.attrs.src);
              const formData = new FormData();
              formData.append('image', blob, node.attrs['data-original-name'] || 'image.png');
              formData.append('language', language); // 언어 정보 추가
              
              const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
              });
              
              const result = await response.json();
              if (response.ok && result.success && result.url) {
                // 원본 속성 유지하면서 src만 실제 URL로 변경
                node.attrs.src = result.url;
                // 임시 속성 제거
                delete node.attrs['data-src-type'];
                delete node.attrs['data-original-name'];
              } else {
                throw new Error(result.message || '이미지 업로드 실패');
              }
            } catch (error) {
              console.error('Image upload failed:', error);
              // 업로드 실패 시 기본 에러 이미지나 원본 유지 가능
            }
          })();
          
          uploadPromises.push(promise);
        }
      }
      
      // 자식 노드 재귀 처리
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(processNode);
      }
    };
    
    // 최상위 노드부터 처리 시작
    if (processedContent.content && Array.isArray(processedContent.content)) {
      processedContent.content.forEach(processNode);
    }
    
    // 모든 이미지 업로드 완료 대기
    await Promise.all(uploadPromises);
    
    return processedContent;
  };
  
  // Base64 문자열을 Blob으로 변환하는 유틸리티 함수
  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    if (arr.length < 2) return new Blob();
    
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };

  // 컴포넌트 렌더링
  return (
    <div className="editor-container">
      {error && <p className="error-message">{error}</p>}
      {/* MenuBar에는 더 이상 스타일 관련 props 전달 안 함 */}
      <MenuBar editor={editor} />

       {/* ImageToolbar를 감싸는 조건 제거 -> 항상 렌더링 */}
       {/* {imageIsSelected && ( */}
           <ImageToolbar
               editor={editor}
               styles={styles}
               handleInputChange={handleInputChange}
               applyStyles={applyStyles}
               isDisabled={!imageIsSelected} // 비활성화 상태는 이미지 선택 여부에 따라 전달
           />
       {/* )} */}

      <div ref={editorContentRef}>
        <EditorContent editor={editor} className="editor-content" />
      </div>
      <button onClick={handleSubmit} disabled={isSaving || !editor} className="save-button">
        {isSaving ? '저장 중...' : `${language === 'ko' ? '한국어' : '영어'} 페이지 저장/변경`}
      </button>
    </div>
  );
}