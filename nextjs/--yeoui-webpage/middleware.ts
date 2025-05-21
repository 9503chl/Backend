import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Node.js crypto 모듈 대신 Web Crypto API를 사용합니다.
// import crypto from 'crypto'; // 이 줄은 제거하거나 주석 처리합니다.

// 서버에 안전하게 저장되거나 환경 변수 등으로 관리되어야 하는 원본 API 키
const SERVER_ORIGINAL_API_KEY = process.env.API_KEY || "jux6229!"; // Unity에서 사용한 것과 동일한 원본 키

// SHA256 해시 함수 (Web Crypto API 사용)
async function computeSha256Hash(rawData: string): Promise<string> { // 비동기 함수로 변경, Promise<string> 반환
  const encoder = new TextEncoder();
  const data = encoder.encode(rawData);
  // Edge Runtime에서는 crypto.subtle을 직접 사용할 수 있습니다.
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // 버퍼를 바이트 배열로 변환
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // 16진수 문자열로 변환
  return hashHex;
}

// API 키 인증이 필요한 Unity API 경로 목록
const UNITY_API_PATHS = [
  '/api/latest-page-image/ko',
  '/api/latest-page-image/en',
  '/api/logo',
  '/api/logo/image',
  '/api/serve-image',
  '/api/cleanup-images',
  '/api/upload-image' // 이미지 업로드 API 경로 추가
];

// Protected API paths
const PROTECTED_PATHS = [
  '/api/page-content',
  '/api/page-content-en',
  '/api/upload-image',
  '/api/upload-page-image',
  '/api/delete-page',
];

// Public paths
const PUBLIC_PATHS = [
  '/api/auth',
  '/login',
  '/_next',
  '/favicon.ico',
  '/uploads',
  '/uploads/pages',
  '/uploads/pages/ko',
  '/uploads/pages/en',
  // Unity API paths
  '/api/latest-page-image/ko',
  '/api/latest-page-image/en',
  '/api/latest-page-image',
  '/api/delete-page/ko',
  '/api/delete-page/en',
  '/api/delete-page'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // --- 추가된 부분: /uploads 경로는 최우선으로 통과 ---
  if (pathname.startsWith('/uploads/')) {
    return NextResponse.next();
  }
  // --- 추가된 부분 끝 ---

  // Unity API 경로 및 특정 메소드에 대한 요청인지 확인
  if (
    UNITY_API_PATHS.some(path => pathname.startsWith(path)) &&
    (method === 'GET' || method === 'PUT' || method === 'POST') // POST 요청도 인증하도록 추가
  ) {
    const receivedHashedApiKey = request.nextUrl.searchParams.get('apiKey');

    if (!receivedHashedApiKey) {
      return new NextResponse(
        JSON.stringify({ error: "API key is missing" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const expectedHashedApiKeyOnServer = await computeSha256Hash(SERVER_ORIGINAL_API_KEY);

    if (receivedHashedApiKey !== expectedHashedApiKeyOnServer) {
      console.warn(`[Middleware] API Key authentication failed for path: ${pathname}, method: ${method}. Received: ${receivedHashedApiKey}`);
      return new NextResponse(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log(`[Middleware] API Key authentication successful for path: ${pathname}, method: ${method}`);
  }

  // 다른 모든 요청은 그대로 통과 (또는 여기에 다른 PUBLIC_PATHS, PROTECTED_PATHS 로직 추가 가능)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 