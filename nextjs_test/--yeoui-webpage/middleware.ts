import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  
  // Unity API paths
  '/api/latest-page-image/ko',
  '/api/latest-page-image/en',
  '/api/latest-page-image',
  '/api/delete-page/ko',
  '/api/delete-page/en',
  '/api/delete-page'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static resources
  if (pathname.includes('/_next') || pathname.includes('/public/')) {
    return NextResponse.next();
  }

  // Check authentication for protected paths and root
  if (pathname === '/' || PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    const authToken = request.cookies.get('auth_token')?.value;
    const isLoggedIn = request.cookies.get('logged_in')?.value === 'true';
    
    if (!authToken || !isLoggedIn) {
      const isApiRoute = pathname.startsWith('/api/');
      
      if (isApiRoute) {
        const apiKey = request.headers.get('x-api-key');
        
        if (!apiKey || apiKey !== process.env.EDITOR_PASSWORD) {
          return NextResponse.json(
            { success: false, message: 'API 키가 필요합니다.' },
            { status: 401 }
          );
        }
      }
      
      // 로그인 페이지로 리디렉션
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 