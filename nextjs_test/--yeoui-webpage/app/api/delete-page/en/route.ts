import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // 영어 페이지 데이터 파일 경로
    const dataFilePath = join(process.cwd(), 'data', 'page-content-en.json');
    
    // 영어 페이지 이미지 디렉토리 경로
    const imageDir = join(process.cwd(), 'public', 'uploads', 'pages', 'en');
    const contentImageDir = join(process.cwd(), 'public', 'uploads', 'en');
    
    // 삭제 결과 저장
    const result = {
      dataDeleted: false,
      pageImagesDeleted: 0,
      contentImagesDeleted: 0,
      errors: [] as string[]
    };
    
    // 1. 페이지 데이터 파일 삭제 시도
    if (existsSync(dataFilePath)) {
      try {
        await unlink(dataFilePath);
        result.dataDeleted = true;
      } catch (error) {
        console.error('Error deleting English page data:', error);
        result.errors.push('페이지 데이터 삭제 중 오류가 발생했습니다.');
      }
    }
    
    // 2. 페이지 이미지 삭제 시도
    if (existsSync(imageDir)) {
      try {
        const files = await readdir(imageDir);
        const imageFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
        
        for (const file of imageFiles) {
          try {
            await unlink(join(imageDir, file));
            result.pageImagesDeleted++;
          } catch (error) {
            console.error(`Error deleting image ${file}:`, error);
            result.errors.push(`이미지 삭제 중 오류: ${file}`);
          }
        }
      } catch (error) {
        console.error('Error reading English page images directory:', error);
        result.errors.push('이미지 디렉토리 접근 중 오류가 발생했습니다.');
      }
    }
    
    // 3. 콘텐츠 내 이미지 삭제 시도
    if (existsSync(contentImageDir)) {
      try {
        const files = await readdir(contentImageDir);
        
        for (const file of files) {
          try {
            await unlink(join(contentImageDir, file));
            result.contentImagesDeleted++;
          } catch (error) {
            console.error(`Error deleting content image ${file}:`, error);
            result.errors.push(`콘텐츠 이미지 삭제 중 오류: ${file}`);
          }
        }
      } catch (error) {
        console.error('Error reading English content images directory:', error);
        result.errors.push('콘텐츠 이미지 디렉토리 접근 중 오류가 발생했습니다.');
      }
    }
    
    // 응답 생성
    const success = result.errors.length === 0;
    const message = success 
      ? `영어 페이지 데이터와 ${result.pageImagesDeleted}개의 페이지 이미지, ${result.contentImagesDeleted}개의 콘텐츠 이미지가 삭제되었습니다.`
      : `일부 항목이 삭제되었습니다: 데이터(${result.dataDeleted}), 페이지 이미지(${result.pageImagesDeleted}개), 콘텐츠 이미지(${result.contentImagesDeleted}개)`;
    
    return NextResponse.json({
      success,
      message,
      result,
      errors: result.errors
    }, { status: success ? 200 : 207 }); // 207: Multi-Status
    
  } catch (error) {
    console.error('Error deleting English page data and images:', error);
    return NextResponse.json({ 
      success: false, 
      message: '영어 페이지 데이터와 이미지를 삭제하는 중 오류가 발생했습니다.',
      error: (error as Error).message
    }, { status: 500 });
  }
} 