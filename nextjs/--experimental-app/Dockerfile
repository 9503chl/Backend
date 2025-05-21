FROM node:18

WORKDIR /app

# package.json과 package-lock.json을 먼저 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# 빌드 및 실행 명령어
RUN npm run build
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
CMD ["npm", "start"]