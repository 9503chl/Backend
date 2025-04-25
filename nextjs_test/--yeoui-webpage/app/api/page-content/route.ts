import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { JSONContent } from '@tiptap/react'; // Tiptap JSON 타입 임포트

// 데이터 파일 경로 통일
const dataDir = join(process.cwd(), 'data');
const dataFilePath = join(dataDir, 'page-content.json');

// 파일에 저장될 데이터 구조 정의
interface PageData {
  editorContent: JSONContent; // Tiptap JSON 콘텐츠 저장
  updatedAt?: string; // 업데이트 시간 추가
}

// 파일에서 데이터 읽기
async function readPageData(): Promise<PageData | null> {
  try {
    // 파일과 디렉토리 존재 확인
    if (!existsSync(dataFilePath)) {
      console.log(`Data file not found: ${dataFilePath}`);
      return null;
    }
    
    // 파일 읽기
    const data = await readFile(dataFilePath, 'utf-8');
    if (!data) return null;
    
    // 데이터 파싱
    const parsedData = JSON.parse(data);
    
    // editorContent 필드 유효성 검사
    if (parsedData && typeof parsedData.editorContent === 'object' && parsedData.editorContent !== null) {
      return parsedData;
    }
    
    console.warn("Invalid data format in page content file");
    return null;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log("No data file exists yet");
      return null;
    }
    console.error("Error reading page data file:", error);
    throw error;
  }
}

// GET 핸들러: 저장된 editorContent 반환
export async function GET(request: NextRequest) {
  try {
    // 데이터 파일에서 읽기
    const data = await readPageData();
    
    if (!data) {
      return NextResponse.json({ message: 'No content found' }, { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      });
    }
    
    // 저장된 editorContent 객체 반환
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }); // { editorContent: { ... } } 형태로 반환
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ message: 'Failed to retrieve page content' }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  }
}

// 이미지 URL 추출 유틸리티 함수
function extractImageUrls(content: any): string[] {
  const urls: string[] = [];
  
  const processNode = (node: any) => {
    // 이미지 노드 확인
    if (node.type === 'image' && node.attrs && node.attrs.src) {
      // 서버에 저장된 업로드 이미지만 추출 (외부 URL은 제외)
      if (node.attrs.src.startsWith('/uploads/')) {
        urls.push(node.attrs.src);
      }
    }
    
    // 자식 노드 재귀 처리
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(processNode);
    }
  };
  
  // 콘텐츠가 있을 경우 처리
  if (content?.content && Array.isArray(content.content)) {
    content.content.forEach(processNode);
  }
  
  return urls;
}

// 이미지 파일 삭제 함수
async function deleteUnusedImages(oldUrls: string[], newUrls: string[]) {
  // 더 이상 사용되지 않는 이미지 URL 찾기
  const unusedUrls = oldUrls.filter(url => !newUrls.includes(url));
  
  // 파일 삭제 작업
  const deletePromises = unusedUrls.map(async (url) => {
    try {
      // URL에서 파일 경로 추출
      const filePath = join(process.cwd(), 'public', url);
      
      // 파일 존재 여부 확인
      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log(`Deleted unused image: ${url}`);
      }
    } catch (error) {
      console.error(`Failed to delete image ${url}:`, error);
    }
  });
  
  // 모든 삭제 작업 완료 대기
  await Promise.all(deletePromises);
  
  return unusedUrls.length;
}

// POST 핸들러: editorContent 데이터 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { editorContent } = body;
    
    if (!editorContent) {
      return NextResponse.json({ 
        success: false, 
        message: '페이지 내용이 없습니다.' 
      }, { status: 400 });
    }
    
    // 데이터 디렉토리 존재 확인 및 생성
    if (!existsSync(dataDir)) {
      try {
        await mkdir(dataDir, { recursive: true });
        console.log(`Created data directory: ${dataDir}`);
      } catch (error) {
        console.error('Error creating data directory:', error);
        throw new Error('데이터 디렉토리를 생성할 수 없습니다.');
      }
    }
    
    // 이전 콘텐츠에서 이미지 URL 추출
    let oldImageUrls: string[] = [];
    try {
      if (existsSync(dataFilePath)) {
        const fileData = await readFile(dataFilePath, 'utf8');
        const oldContent = JSON.parse(fileData);
        oldImageUrls = extractImageUrls(oldContent.editorContent);
      }
    } catch (error) {
      console.error('Error reading previous content:', error);
      // 이전 파일 읽기 실패는 치명적 오류로 처리하지 않음
    }
    
    // 새 콘텐츠에서 이미지 URL 추출
    const newImageUrls = extractImageUrls(editorContent);
    
    // 더 이상 사용되지 않는 이미지 삭제
    const deletedCount = await deleteUnusedImages(oldImageUrls, newImageUrls);
    
    // 데이터 디렉토리 확인
    const dataContent = { editorContent, updatedAt: new Date().toISOString() };
    
    // 파일 저장
    await writeFile(dataFilePath, JSON.stringify(dataContent, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: `페이지 콘텐츠가 저장되었습니다. ${deletedCount}개의 미사용 이미지가 정리되었습니다.`
    });
    
  } catch (error) {
    console.error('Error saving page content:', error);
    return NextResponse.json({ 
      success: false, 
      message: `페이지 저장 중 오류가 발생했습니다: ${(error as Error).message || '알 수 없는 오류'}` 
    }, { status: 500 });
  }
} 