#!/bin/bash
export DOCKER_BUILDKIT=1

BUILD_TYPE="debug"
if [ "$1" == "release" ]; then
    BUILD_TYPE="release"
fi

echo "🚀 Building Android $BUILD_TYPE APK using Docker..."
mkdir -p dist

docker build --build-arg BUILD_TYPE=$BUILD_TYPE --output=dist/ -f Dockerfile.android .

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Android $BUILD_TYPE APK built successfully!"
    echo "📂 Output file: dist/app-$BUILD_TYPE.apk"
else
    echo ""
    echo "❌ Android build failed!"
    exit 1
fi
