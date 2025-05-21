import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const LOGO_DIR = join(process.cwd(), 'data', 'logo');
const LOGO_PATH = join(LOGO_DIR, 'logo.png');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    if (!image) {
      console.error('로고 이미지를 찾을 수 없습니다.');
      return NextResponse.json({ success: false, message: '로고 이미지를 찾을 수 없습니다.' }, { status: 400 });
    }
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
    const filename = `logo_${timestamp}.png`;
    const uploadsDir = join(process.cwd(), 'data', 'logo');
    try {
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
        console.log('폴더 생성:', uploadsDir);
      }
    } catch (e) {
      console.error('폴더 생성 실패:', uploadsDir, e);
      return NextResponse.json({ success: false, message: '폴더 생성 실패', error: String(e) }, { status: 500 });
    }
    // 기존 파일 모두 삭제
    try {
      const files = await readdir(uploadsDir);
      for (const file of files) {
        if (file.endsWith('.png')) {
          try {
            await unlink(join(uploadsDir, file));
            console.log('기존 로고 파일 삭제:', file);
          } catch (e) {
            console.error('기존 로고 파일 삭제 실패:', file, e);
          }
        }
      }
    } catch (e) {
      console.error('기존 파일 삭제 중 오류:', e);
    }
    // 새 파일 저장
    const filePath = join(uploadsDir, filename);
    try {
      await writeFile(filePath, buffer);
      console.log('로고 파일 저장:', filePath);
    } catch (e) {
      console.error('로고 파일 저장 실패:', filePath, e);
      return NextResponse.json({ success: false, message: '로고 파일 저장 실패', error: String(e) }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      url: `/api/logo`,
      message: '로고 이미지가 성공적으로 저장되었습니다.'
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({
      success: false,
      message: '로고 이미지 저장 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 