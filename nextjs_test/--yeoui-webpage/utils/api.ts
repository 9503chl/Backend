// 지원되는 언어 타입
type Language = 'ko' | 'en';

// API 응답 데이터 타입 정의
interface PageData {
  editorContent: any; // Tiptap JSON 콘텐츠
}

/**
 * 페이지 콘텐츠를 가져오는 함수
 * @param language 언어 설정 (ko 또는 en)
 * @returns 페이지 데이터 또는 null
 */
export async function fetchPageContent(language: Language): Promise<PageData | null> {
  try {
    // 언어별 API 엔드포인트 설정
    const endpoint = language === 'en' ? 'page-content-en' : 'page-content';
    const apiUrl = `/api/${endpoint}`;
    
    console.log(`API 요청: ${apiUrl}`);
    const res = await fetch(apiUrl, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`API 오류: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data || !data.editorContent) {
      console.warn('유효한 에디터 콘텐츠가 없습니다');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('콘텐츠 가져오기 오류:', error);
    throw error;
  }
}

/**
 * 페이지 콘텐츠를 저장하는 함수
 * @param editorContent Tiptap 에디터 콘텐츠
 * @param language 언어 설정 (ko 또는 en)
 * @returns API 응답 결과
 */
export async function savePageContent(editorContent: any, language: Language): Promise<any> {
  try {
    // 언어별 API 엔드포인트 설정
    const endpoint = language === 'en' ? 'page-content-en' : 'page-content';
    const apiUrl = `/api/${endpoint}`;
    
    console.log(`저장 API 요청: ${apiUrl}`);
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ editorContent })
    });

    if (!res.ok) {
      throw new Error(`API 오류: ${res.status} ${res.statusText}`);
    }

    const result = await res.json();
    return result;
  } catch (error) {
    console.error('콘텐츠 저장 오류:', error);
    throw error;
  }
} 