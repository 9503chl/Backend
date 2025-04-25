@echo off
echo Stopping and cleaning up web editor service...

REM Stop all containers
echo Stopping all containers...
docker-compose down

REM Remove all containers with 'my-app' or 'nextjs' in their name
echo Removing related containers...
FOR /F "tokens=*" %%i IN ('docker ps -a -q --filter "name=my-app" --filter "name=nextjs"') DO (
    docker rm -f %%i
)

REM Remove all images with 'my-app' or 'nextjs' in their name
echo Removing related images...
FOR /F "tokens=*" %%i IN ('docker images "my-app*" -q') DO (
    docker rmi -f %%i
)
FOR /F "tokens=*" %%i IN ('docker images "*nextjs*" -q') DO (
    docker rmi -f %%i
)
FOR /F "tokens=*" %%i IN ('docker images "*node*" -q') DO (
    docker rmi -f %%i
)

REM Remove all dangling images
echo Removing dangling images...
docker image prune -f

REM Remove unused volumes
echo Removing unused volumes...
docker volume prune -f

REM Remove unused networks
echo Removing unused networks...
docker network prune -f

REM Final cleanup
echo Performing final cleanup...
docker system prune -f

echo.
echo Cleanup completed. All related containers, images, and volumes have been removed.
echo.

pause 