#!/bin/bash
echo "Starting AI Stock Market Simulator & Research Platform..."

# Start Backend
echo "Starting FastAPI backend on port 8000..."
source backend/venv/bin/activate
uvicorn backend.app.main:app --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Vite React frontend on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
