import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 콘텐츠 파일 경로 (루트 디렉토리 기준)
const KO_CONTENT_PATH = join(process.cwd(), 'page-content.json');
const EN_CONTENT_PATH = join(process.cwd(), 'page-content-en.json');
const USER_UPLOADS_BASE_DIR = join(process.cwd(), 'user_uploads');

// 이미지 URL에서 파일명과 언어를 추출하는 정규식
// 예: /api/serve-image/ko/image_name.png?apiKey=...  => ko, image_name.png
const IMG_URL_REGEX = /\/api\/serve-image\/(ko|en)\/([^?"]+)\.png/g;

async function getInUseImageFiles(): Promise<Set<string>> {
  const inUseImages = new Set<string>();
  const contentFilePaths = [KO_CONTENT_PATH, EN_CONTENT_PATH];

  for (const filePath of contentFilePaths) {
    if (existsSync(filePath)) {
      try {
        const fileContent = await readFile(filePath, 'utf-8');
        // 가정: 파일 내용은 JSON이고, content 필드에 HTML 문자열이 있음
        // 실제 구조에 따라 JSON.parse(fileContent).content 등으로 수정 필요
        // 지금은 파일 전체를 HTML 문자열로 간주 (단순화를 위해)
        // 실제로는 JSON.parse(fileContent).somePropertyContainingHtml 와 같이 접근해야 할 수 있습니다.
        const jsonData = JSON.parse(fileContent);
        const htmlContent = jsonData.content || ''; // content 필드가 있다고 가정

        let match;
        while ((match = IMG_URL_REGEX.exec(htmlContent)) !== null) {
          const lang = match[1]; // ko 또는 en
          const filename = match[2] + '.png'; // 정규식에서 .png 제외하고 캡처했으므로 추가
          inUseImages.add(join(lang, filename)); // "ko/image_name.png" 형태로 저장
        }
      } catch (error) {
        console.warn(`Error reading or parsing content file ${filePath}:`, error);
        // 파일 읽기/파싱 오류가 있어도 계속 진행
      }
    } else {
      console.warn(`Content file not found: ${filePath}`);
    }
  }
  return inUseImages;
}

async function getActualImageFiles(): Promise<Map<string, string[]>> {
  const actualImagesByLang = new Map<string, string[]>(); // { "ko": ["img1.png", "img2.png"], "en": [...] }
  const languageFolders = ['ko', 'en'];

  for (const lang of languageFolders) {
    const langDir = join(USER_UPLOADS_BASE_DIR, lang);
    if (existsSync(langDir)) {
      try {
        const files = await readdir(langDir);
        actualImagesByLang.set(lang, files.filter(file => file.endsWith('.png')));
      } catch (error) {
        console.warn(`Error reading directory ${langDir}:`, error);
        actualImagesByLang.set(lang, []);
      }
    } else {
      actualImagesByLang.set(lang, []);
      console.warn(`User uploads directory not found for language: ${langDir}`);
    }
  }
  return actualImagesByLang;
}

export async function POST(request: NextRequest) {
  try {
    const inUseImages = await getInUseImageFiles();
    const actualImagesByLang = await getActualImageFiles();

    const deletedFiles: string[] = [];
    const errors: { file: string; error: string }[] = [];

    for (const [lang, filesInDir] of actualImagesByLang) {
      for (const filename of filesInDir) {
        const imageIdentifier = join(lang, filename); // "ko/image_name.png"
        if (!inUseImages.has(imageIdentifier)) {
          try {
            const filePathToDelete = join(USER_UPLOADS_BASE_DIR, lang, filename);
            await unlink(filePathToDelete);
            deletedFiles.push(imageIdentifier);
            console.log(`Deleted unused image: ${filePathToDelete}`);
          } catch (error: any) {
            console.error(`Error deleting file ${imageIdentifier}:`, error);
            errors.push({ file: imageIdentifier, error: error.message });
          }
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cleanup process completed with some errors.',
        deletedCount: deletedFiles.length,
        deletedFiles,
        errors,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Image cleanup completed successfully.',
      deletedCount: deletedFiles.length,
      deletedFiles,
    });

  } catch (error: any) {
    console.error('Error during image cleanup process:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred during image cleanup.',
      error: error.message,
    }, { status: 500 });
  }
} 