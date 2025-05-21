import { NextRequest, NextResponse } from 'next/server';

// 미들웨어가 이미 API 키 인증을 처리하므로 API 내부에서는 추가 검증 필요 없음
export async function GET(request: NextRequest) {
  const host = request.headers.get("host") || 'localhost:3000';
  const baseUrl = `http://${host}`;
  return NextResponse.json({
    image: {
      url: `${baseUrl}/api/page-image/ko`
    }
  });
} 