@echo off
chcp 65001 > nul
echo [1] 의존성 설치 중...
call npm install

echo [2] 빌드 중...
call npm run build

echo [3] 프로덕션 서버 실행 중...
rem "npm run start"를 새 창에서 최소화된 상태로 실행
start "NextAppServer" /min npm run start

echo.
echo "npm run start"가 별도의 최소화된 창에서 실행되었습니다.
echo 이 창은 5초 후 자동으로 닫힙니다.
timeout /t 5 /nobreak > nul