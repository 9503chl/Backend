# 빌드 스테이지
FROM node:18-alpine AS builder
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

# 소스 코드 복사l
COPY . .

# TypeScript 설정 파일 확인
COPY tsconfig.json ./
COPY next.config.js ./

# 빌드 실행
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

# 실행 스테이지
FROM node:18-alpine AS runner
WORKDIR /app

# 프로덕션 종속성만 설치
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --only=production

# 빌드 결과물 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# 환경 변수 설정
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 포트 설정
EXPOSE 3000

# 실행
CMD ["npm", "start"]