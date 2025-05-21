import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { join } from 'path';
import { readdir, stat, readFile } from 'fs/promises';
import { existsSync } from 'fs';

const LOGO_DIR = path.join(process.cwd(), 'data', 'logo');
const LOGO_PATH = path.join(LOGO_DIR, 'logo.png');
const STYLES_PATH = path.join(LOGO_DIR, 'styles.json');

// 로고 이미지 삭제
export async function POST() {
  try {
    if (fs.existsSync(LOGO_PATH)) {
      fs.unlinkSync(LOGO_PATH);
    }
    if (fs.existsSync(STYLES_PATH)) {
      fs.unlinkSync(STYLES_PATH);
    }
    return NextResponse.json({ message: '로고가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('로고 삭제 중 오류:', error);
    return NextResponse.json({ error: '로고 삭제에 실패했습니다.' }, { status: 500 });
  }
}

// 로고 이미지 저장/업데이트
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const styles = formData.get('styles') as string;
    
    if (!file) {
      return NextResponse.json({ error: '이미지 파일이 필요합니다.' }, { status: 400 });
    }

    // 디렉토리가 없으면 생성
    if (!fs.existsSync(LOGO_DIR)) {
      fs.mkdirSync(LOGO_DIR, { recursive: true });
    }

    // 기존 파일이 있으면 삭제
    if (fs.existsSync(LOGO_PATH)) {
      fs.unlinkSync(LOGO_PATH);
    }

    // 파일을 버퍼로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 파일 저장
    fs.writeFileSync(LOGO_PATH, buffer);

    // 스타일 정보 저장
    if (styles) {
      fs.writeFileSync(STYLES_PATH, styles);
    }

    return NextResponse.json({ message: '로고가 성공적으로 저장되었습니다.' });
  } catch (error) {
    console.error('로고 저장 중 오류:', error);
    return NextResponse.json({ error: '로고 저장에 실패했습니다.' }, { status: 500 });
  }
}

// 로고 이미지 조회
export async function GET(request: NextRequest) {
  try {
    // 클라이언트가 /api/logo?apiKey=... 로 보낸 apiKey를 추출
    const receivedHashedApiKey = request.nextUrl.searchParams.get('apiKey');

    // 이 API는 미들웨어에서 이미 인증되었으므로, 여기서는 apiKey를 다음 URL에 전달하는 역할만 합니다.
    // 만약 apiKey가 없다면 (미들웨어를 통과했지만 어떤 이유로든 없는 경우), 빈 문자열로 처리하거나 에러 처리할 수 있습니다.
    // 여기서는 다음 요청도 인증을 거치도록 하기 위해 apiKey를 전달합니다.
    const apiKeyQueryParam = receivedHashedApiKey ? `?apiKey=${receivedHashedApiKey}` : '';

    const imageDir = join(process.cwd(), 'data', 'logo');
    if (!existsSync(imageDir)) {
      return NextResponse.json({ image: { url: '' } }, { status: 404 });
    }
    const files = await readdir(imageDir);
    const imageFiles = files.filter(file => file.endsWith('.png'));
    if (imageFiles.length === 0) {
      return NextResponse.json({ image: { url: '' } }, { status: 404 });
    }
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `http://${host}`;
    return NextResponse.json({
      image: {
        url: `${baseUrl}/api/logo/image${apiKeyQueryParam}`
      }
    });
  } catch (error) {
    console.error('Error in /api/logo GET:', error);
    return NextResponse.json({ image: { url: '' }, error: 'Internal server error' }, { status: 500 });
  }
} 