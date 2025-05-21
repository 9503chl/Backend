@echo off
echo Docker Compose 중지 중...
docker-compose down --rmi all --volumes
echo Docker Compose가 중지되었고 모든 이미지와 볼륨이 삭제되었습니다.
pause 