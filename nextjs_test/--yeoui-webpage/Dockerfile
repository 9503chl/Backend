FROM node:18-alpine

WORKDIR /app

# 종속성 파일 복사
COPY package*.json ./

# 종속성 설치
RUN npm install

# 애플리케이션 소스 복사
COPY . .

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=80

# Next.js 앱 빌드
RUN npm run build

# standalone 서버와 public 파일 복사
RUN cp -r .next/standalone/* ./
RUN cp -r .next/static .next/standalone/.next/
RUN cp -r public .next/standalone/

# 80 포트 노출
EXPOSE 80

# standalone 서버 시작
CMD ["node", "server.js"] 