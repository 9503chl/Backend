import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import mime from 'mime-types'; // 파일 확장자로 MIME 타입 추론

export async function GET(
  request: NextRequest,
  context: { params: { lang: string; filename: string } }
) {
  try {
    const { lang, filename } = context.params;

    // 보안: filename에 ../ 등을 사용하여 상위 디렉토리 접근 시도 방지
    if (filename.includes('..')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    const userUploadsDir = join(process.cwd(), 'user_uploads', lang);
    const filePath = join(userUploadsDir, filename);

    if (!existsSync(filePath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await readFile(filePath);
    const mimeType = mime.lookup(filename) || 'application/octet-stream';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`, // 브라우저에서 바로 보거나 다운로드 시 파일명 지정
      },
    });
  } catch (error) {
    console.error(`Error serving image ${context.params.filename}:`, error);
    return new NextResponse('Error serving image', { status: 500 });
  }
} 