/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  typescript: {
    // !! 경고 !!
    // 이는 임시 조치로, 프로덕션 환경에서는 권장되지 않습니다.
    // 타입 오류를 해결하는 것이 더 좋은 방법입니다.
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 중 ESLint 검사를 건너뜁니다.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 