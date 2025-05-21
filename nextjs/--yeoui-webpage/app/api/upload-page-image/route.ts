import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import sharp from 'sharp';

// 페이지 이미지 저장 API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const language = formData.get('language') as string || 'ko';
    const width = request.nextUrl.searchParams.get('width') || formData.get('width') as string;
    const transparent = request.nextUrl.searchParams.get('transparent') || formData.get('transparent') as string;

    if (!image) {
      return NextResponse.json({ success: false, message: '이미지를 찾을 수 없습니다.' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let processedBuffer: any = buffer;
    if (width || transparent === 'true') {
      let sharpImage = sharp(buffer).withMetadata(); // 색상 프로필 보존
      if (width) {
        const widthValue = parseInt(width);
        if (!isNaN(widthValue) && widthValue > 0) {
          console.log(`[SERVER_IMAGE_UPLOAD] Resizing image to width: ${widthValue}, height: auto (maintaining aspect ratio)`);
          sharpImage = sharpImage
            .resize({
              width: widthValue,
              height: undefined,    // sharp에게 높이를 자동으로 계산하도록 지시 (비율 유지)
              fit: 'contain',       // 원본 비율을 유지하면서 지정된 너비/높이 안에 맞춤 (여기서는 너비 기준)
              background: { r: 0, g: 0, b: 0, alpha: 0 } // 남는 공간(생긴다면) 투명 처리
            })
            .png({ quality: 100, compressionLevel: 9 }); // PNG로 변환, 압축 레벨 조정 가능
        }
      } else if (transparent === 'true' && !width) { // 너비 조정 없이 투명도 처리(PNG 변환)만 필요한 경우
        console.log("[SERVER_IMAGE_UPLOAD] Ensuring image is PNG for transparency (no resize).");
        sharpImage = sharpImage.png({ quality: 100, compressionLevel: 9 });
      }
      // width가 있고 transparent도 true인 경우, resize 후 png로 변환되므로 별도 처리는 이미 위에서 커버됨
      // width 없이 transparent만 true인 경우만 위 else if 에서 처리
      
      // sharpImage가 실제로 변경된 경우에만 toBuffer() 호출
      // (width가 유효했거나, width 없이 transparent만 true였던 경우)
      if (sharpImage !== sharp(buffer).withMetadata()) { // 이 비교는 정확하지 않음, 조건부 실행 필요
         // 위 조건문은 항상 true가 될 수 있으므로, width나 transparent 조건으로 다시 확인
         if (width || (transparent === 'true' && !width) ){
            processedBuffer = await sharpImage.toBuffer();
            console.log("[SERVER_IMAGE_UPLOAD] Image processing with Sharp completed.");
         } else {
            console.log("[SERVER_IMAGE_UPLOAD] No Sharp processing needed (no width, transparent not explicitly true alone).");
         }
      } else {
        // 이 경우는 거의 발생하지 않지만, 로깅 추가
        console.log("[SERVER_IMAGE_LOGIC] Sharp image object was not modified, original buffer used.");
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
    const filename = `page_${timestamp}.png`;
    const urls: { [key: string]: string } = {};

    // 지정한 언어 폴더에만 저장
    const lang = language;
    const uploadsDir = join(process.cwd(), 'data', 'uploads', 'pages', lang);
    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

    // 기존 파일 모두 삭제
    const files = await readdir(uploadsDir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        try {
          await unlink(join(uploadsDir, file));
        } catch (e) {
          console.error('기존 파일 삭제 실패:', file, e);
        }
      }
    }

    // 새 파일 저장
    const filePath = join(uploadsDir, filename);
    await writeFile(filePath, processedBuffer);
    urls[lang] = `/api/page-image/${lang}`;

    return NextResponse.json({
      success: true,
      urls,
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