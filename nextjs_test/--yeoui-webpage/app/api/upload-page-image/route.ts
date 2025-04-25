import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import sharp from 'sharp'; // sharp 패키지 추가 필요

// 페이지 이미지 저장 API
export async function POST(request: NextRequest) {
  try {
    // FormData에서 이미지 추출
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const language = formData.get('language') as string || 'ko'; // 기본값: 한국어
    
    // URL 파라미터 가져오기
    const width = request.nextUrl.searchParams.get('width') || formData.get('width') as string;
    const transparent = request.nextUrl.searchParams.get('transparent') || formData.get('transparent') as string;
    
    if (!image) {
      return NextResponse.json({ success: false, message: '이미지를 찾을 수 없습니다.' }, { status: 400 });
    }
    
    // 현재 시간을 파일명에 포함 (고유성 보장)
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
    const filename = `page_${timestamp}.png`;
    
    // 언어별 저장 경로 설정
    const languageFolder = language === 'en' ? 'en' : 'ko';
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'pages', languageFolder);
    
    // 폴더가 없으면 생성
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    
    // 이미지 바이너리 데이터 획득
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 이미지 처리 (너비 및 투명도 조정)
    let processedBuffer = buffer;
    
    // sharp 라이브러리를 사용하여 이미지 처리
    if (width || transparent === 'true') {
      let sharpImage = sharp(buffer);
      
      // 투명 배경 유지 설정
      if (transparent === 'true') {
        sharpImage = sharpImage.png({ quality: 100 });
      }
      
      // 너비 조정 (요청된 경우)
      if (width) {
        const widthValue = parseInt(width);
        if (!isNaN(widthValue) && widthValue > 0) {
          sharpImage = sharpImage.resize({
            width: widthValue,
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 } // 투명 배경
          });
        }
      }
      
      // 처리된 이미지 버퍼 가져오기
      processedBuffer = await sharpImage.toBuffer();
    }
    
    // 파일 저장
    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, processedBuffer);
    
    // 클라이언트에서 접근 가능한 URL 생성
    const url = `/uploads/pages/${languageFolder}/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url,
      width: width || 'original',
      transparent: transparent === 'true',
      message: '페이지 이미지가 성공적으로 저장되었습니다.'
    });
    
  } catch (error) {
    console.error('Page image upload error:', error);
    return NextResponse.json({ 
      success: false, 
      message: '페이지 이미지 저장 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 