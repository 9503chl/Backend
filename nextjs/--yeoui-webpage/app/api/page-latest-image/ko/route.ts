import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';

// 미들웨어가 이미 API 키 인증을 처리하므로 API 내부에서는 추가 검증 필요 없음
export async function GET(request: NextRequest) {
  try {
    const imageDir = join(process.cwd(), 'public', 'uploads', 'pages', 'ko');
    
    if (!existsSync(imageDir)) {
      return NextResponse.json({ 
        image: { url: '' }
      }, { status: 404 });
    }
    
    const files = await readdir(imageDir);
    const imageFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
    
    if (imageFiles.length === 0) {
      return NextResponse.json({ 
        image: { url: '' }
      }, { status: 404 });
    }
    
    const fileStats = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = join(imageDir, file);
        const fileStat = await stat(filePath);
        return {
          name: file,
          path: `/uploads/pages/ko/${file}`,
          modified: fileStat.mtime.getTime()
        };
      })
    );
    
    const latestFile = fileStats.sort((a, b) => b.modified - a.modified)[0];
    
    return NextResponse.json({
      image: {
        url: `${request.headers.get("host") ? "http://" + request.headers.get("host") : "http://localhost:3000"}${latestFile.path}`
      }
    });
    
  } catch (error) {
    console.error('Error fetching latest Korean page image:', error);
    return NextResponse.json({ 
      image: { url: '' }
    }, { status: 500 });
  }
} 