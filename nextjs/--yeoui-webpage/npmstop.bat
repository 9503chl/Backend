@echo off
chcp 65001 > nul
echo Next.js 서버 프로세스 종료 시도 중...

REM Windows에서 node로 실행된 next 서버 프로세스 종료
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F

echo 종료 완료 (3000번 포트 기준)
pause
