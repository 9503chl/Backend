import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readdir, stat, readFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const imageDir = join(process.cwd(), 'data', 'logo');
    if (!existsSync(imageDir)) {
      return new NextResponse('Not Found', { status: 404 });
    }
    const files = await readdir(imageDir);
    const imageFiles = files.filter(file => file.endsWith('.png'));
    if (imageFiles.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }
    // 최신 파일 찾기
    const fileStats = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = join(imageDir, file);
        const fileStat = await stat(filePath);
        return {
          name: file,
          path: filePath,
          modified: fileStat.mtime.getTime()
        };
      })
    );
    const latestFile = fileStats.sort((a, b) => b.modified - a.modified)[0];
    const imageBuffer = await readFile(latestFile.path);
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="${latestFile.name}"`,
      },
    });
  } catch (error) {
    return new NextResponse('Error', { status: 500 });
  }
} 