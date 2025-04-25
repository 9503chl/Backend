import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// 이미지 업로드 API
export async function POST(request: NextRequest) {
  try {
    // FormData에서 이미지 추출
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const language = formData.get('language') as string || 'ko'; // 기본값: 한국어
    
    if (!image) {
      return NextResponse.json({ success: false, message: '이미지를 찾을 수 없습니다.' }, { status: 400 });
    }
    
    // 현재 시간을 파일명에 포함 (고유성 보장)
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
    const originalName = image.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_'); // 확장자 제거 및 특수문자 제거
    const filename = `${originalName}_${timestamp}.png`;
    
    // 언어별 저장 경로 설정
    const languageFolder = language === 'en' ? 'en' : 'ko';
    const uploadsDir = join(process.cwd(), 'public', 'uploads', languageFolder);
    
    // 폴더가 없으면 생성
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    
    // 이미지 바이너리 데이터 획득
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 파일 저장
    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, buffer);
    
    // 클라이언트에서 접근 가능한 URL 생성
    const url = `/uploads/${languageFolder}/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url,
      message: '이미지가 성공적으로 업로드되었습니다.'
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ 
      success: false, 
      message: '이미지 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 