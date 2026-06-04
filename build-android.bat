@echo off
setlocal
set DOCKER_BUILDKIT=1

set BUILD_TYPE=debug
if "%1"=="release" (
    set BUILD_TYPE=release
)

echo 🚀 Building Android %BUILD_TYPE% APK using Docker...
if not exist dist mkdir dist

docker build --build-arg BUILD_TYPE=%BUILD_TYPE% --output=dist/ -f Dockerfile.android .
echo.
if %errorlevel% neq 0 (
    echo ❌ Android build failed!
    exit /b %errorlevel%
)
echo 🎉 Android %BUILD_TYPE% APK built successfully!
echo 📂 Output file: dist\app-%BUILD_TYPE%.apk
endlocal
