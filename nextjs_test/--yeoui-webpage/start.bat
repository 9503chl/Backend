@echo off
echo Starting web editor service...

REM Create Docker network (if not exists)
docker network ls | findstr my_custom_network > nul
if %errorlevel% neq 0 (
    echo Creating custom network...
    docker network create --subnet=192.168.2.0/24 --gateway=192.168.2.1 my_custom_network
)

REM Create directories if they don't exist
if not exist data (
    echo Creating data directory...
    mkdir data
)

if not exist public\uploads (
    echo Creating uploads directories...
    mkdir public\uploads
    mkdir public\uploads\ko
    mkdir public\uploads\en
    mkdir public\uploads\pages
    mkdir public\uploads\pages\ko
    mkdir public\uploads\pages\en
)

REM Build and run Docker container
echo Building and starting Docker container...
docker-compose up -d --build

echo.
echo Web editor has been successfully started!
echo Access it via browser at http://192.168.2.196 or http://localhost
echo.

pause 