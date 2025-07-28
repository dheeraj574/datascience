#!/bin/bash

echo "🚀 Starting BookShop Application..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Install frontend dependencies if client/node_modules doesn't exist
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client
    npm install
    cd ..
fi

echo "🔧 Starting backend server on port 5000..."
node server.js &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🎨 Starting React frontend on port 3000..."
cd client
npm start &
FRONTEND_PID=$!

echo "✅ BookShop is starting up!"
echo ""
echo "🌐 Backend API: http://localhost:5000"
echo "🎨 Frontend App: http://localhost:3000"
echo ""
echo "📚 Demo Credentials:"
echo "   Email: john@example.com"
echo "   Password: password123"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Function to handle script termination
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to call cleanup function on script termination
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait