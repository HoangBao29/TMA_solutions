#!/bin/bash

# TKFilm - Startup Script

echo "🎬 Starting TKFilm Application..."
echo ""

# Ensure we are in the script's directory
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

# Load environment variables from .env if present so backend has keys
if [ -f ".env" ]; then
    echo "⚙️  Loading .env file"
    set -o allexport
    # shellcheck disable=SC1091
    source .env
    set +o allexport
fi


# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

echo "✅ Python3: $(python3 --version)"
echo "✅ Node.js: $(node --version)"
echo ""

# Check if models exist
if [ ! -f "service_AI/users_embeddings_attention_autoencoder_64_0.5.pt" ]; then
    echo "⚠️  User embeddings model not found!"
    echo "   Run: cd service_AI && python train_user_attention_autoencoder.py"
fi

if [ ! -f "service_AI/movies_embeddings_attention_autoencoder_64_0.5.pt" ]; then
    echo "⚠️  Movie embeddings model not found!"
    echo "   Run: cd service_AI && python train_movie_attention_autoencoder.py"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd service_AI || { echo "❌ Failed to enter service_AI directory"; exit 1; }

# Check if virtual environment exists, if not use system Python
if [ -d ".venv" ]; then
    echo "   Using existing virtual environment"
    source .venv/bin/activate
    pip install -r requirements.txt -q
else
    echo "   Installing to system Python"
    pip3 install -r requirements.txt -q
fi

cd ..

# Install Node dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "📡 Network Configuration:"
echo "   - Android Emulator: http://10.0.2.2:5000"
echo "   - iOS Simulator: http://localhost:5000"
echo "   - Real Device: http://$LOCAL_IP:5000"
echo ""
echo "💡 Update API_BASE_URL in src/services/api.ts if needed"
echo ""

# Start Flask backend
echo "🚀 Starting Flask Backend..."
cd service_AI || { echo "❌ Failed to enter service_AI directory"; exit 1; }

# Use virtual environment if it exists
LOGFILE="../flask_backend.log"
if [ -d ".venv" ]; then
    source .venv/bin/activate
    python app.py > "$LOGFILE" 2>&1 &
else
    python3 app.py > "$LOGFILE" 2>&1 &
fi

FLASK_PID=$!
cd ..

echo "⏳ Waiting for backend to start (health-check)..."
# Wait up to 30 seconds for the /health endpoint
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "✅ Backend is running!"
        break
    fi
    sleep 1
    WAITED=$((WAITED+1))
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo "❌ Backend failed to start within ${MAX_WAIT}s"
    echo "--- Flask logs (last 200 lines) ---"
    tail -n 200 flask_backend.log || true
    kill $FLASK_PID || true
    exit 1
fi

echo ""
echo "🎉 Backend is ready!"
echo "📱 Now run one of the following in a new terminal:"
echo "   - npm run android    (for Android)"
echo "   - npm run ios        (for iOS)"
echo ""
echo "Press Ctrl+C to stop the backend"
echo ""

# Wait for user to stop
wait $FLASK_PID
