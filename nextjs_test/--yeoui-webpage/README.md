# 웹 에디터 서비스

인터랙티브한 웹 에디터 서비스로, 텍스트와 이미지를 편집하고 결과를 이미지로 저장할 수 있습니다.

## 설치 및 실행

### 환경 변수 설정

1. `.env.example` 파일을 `.env`로 복사하여 사용합니다.
2. 다음 환경 변수를 설정합니다:

```
# 웹 에디터 인증
EDITOR_PASSWORD=your_secure_password  # 관리자 로그인 비밀번호
JWT_SECRET=your_jwt_secret_key        # JWT 토큰 암호화 키

# API 인증 키 (유니티 접근용)
UNITY_API_KEY=your_api_key            # 유니티에서 API 접근 시 사용할 키
```

### Docker로 실행

1. `start.bat` 파일을 실행하여 서비스를 시작합니다.
2. 브라우저에서 `http://192.168.2.196` 또는 `http://localhost`로 접속합니다.
3. 종료하려면 `stop.bat` 파일을 실행합니다.

## API 사용 방법

### 웹 에디터 접근

- URL: `/`
- 인증: 웹 로그인 (비밀번호)
- 설명: 페이지 콘텐츠 편집 및 이미지 생성

### 최신 이미지 가져오기 (유니티용)

- 한국어 페이지: `/api/latest-page-image/ko?api_key=your_api_key`
- 영어 페이지: `/api/latest-page-image/en?api_key=your_api_key`
- 인증: API 키 (URL 파라미터 또는 `x-api-key` 헤더)
- 응답 예시:
  ```json
  {
    "success": true,
    "image": {
      "url": "/uploads/pages/ko/page_2023-07-15T12_45_32.123Z.png",
      "filename": "page_2023-07-15T12_45_32.123Z.png",
      "timestamp": "2023-07-15T12:45:32.123Z"
    },
    "auth": {
      "verified": true
    }
  }
  ```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
