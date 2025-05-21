import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 이미지 업로드 API
export async function POST(request: NextRequest) {
  try {
    // FormData에서 이미지 추출
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const language = formData.get('language') as string || 'ko'; // 기본값: 한국어
    
    // 현재 요청 URL에서 apiKey를 가져옵니다.
    // 이 API(/api/upload-image)도 미들웨어에서 apiKey 검증을 받는다고 가정합니다.
    // 만약 그렇지 않다면, 클라이언트가 FormData에 apiKey를 함께 보내거나 다른 방식으로 전달해야 합니다.
    const receivedHashedApiKey = request.nextUrl.searchParams.get('apiKey');
    const apiKeyQueryParam = receivedHashedApiKey ? `?apiKey=${receivedHashedApiKey}` : '';
    
    if (!image) {
      return NextResponse.json({ success: false, message: '이미지를 찾을 수 없습니다.' }, { status: 400 });
    }
    
    // 현재 시간을 파일명에 포함 (고유성 보장)
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
    const originalName = image.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_'); // 확장자 제거 및 특수문자 제거
    const filename = `${originalName}_${timestamp}.png`;
    
    // 새로운 저장 경로: 프로젝트 루트/user_uploads/[lang]/
    const languageFolder = language === 'en' ? 'en' : 'ko';
    // process.cwd()는 프로젝트 루트를 가리킴
    const userUploadsBaseDir = join(process.cwd(), 'user_uploads'); 
    const uploadsDir = join(userUploadsBaseDir, languageFolder);
    
    // 기본 user_uploads 폴더 및 언어별 폴더 생성 (없으면)
    if (!existsSync(userUploadsBaseDir)) {
      await mkdir(userUploadsBaseDir, { recursive: true });
    }
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // 이미지 바이너리 데이터 획득
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 파일 저장
    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, buffer);
    
    // 클라이언트에서 이미지를 제공받을 새로운 API 경로에 apiKeyQueryParam 추가
    const url = `/api/serve-image/${languageFolder}/${filename}${apiKeyQueryParam}`;
    
    return NextResponse.json({ 
      success: true, 
      url,
      message: '이미지가 성공적으로 업로드되었고 기존 이미지가 정리되었습니다.'
    });
    
  } catch (error) {
    console.error('Image upload error (in app/api/upload-image/route.ts):', error);
    return NextResponse.json({ 
      success: false, 
      message: '이미지 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 