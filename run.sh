#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}   AI Stock Market Simulator & Research Platform      ${NC}"
echo -e "${CYAN}======================================================${NC}"

# Root directory of project
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Check Python3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed or not in PATH.${NC}"
    exit 1
fi

# Check Node & npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: Node.js / npm is not installed or not in PATH.${NC}"
    exit 1
fi

# Free lingering processes on ports 8000 and 5173 if any
free_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Freeing occupied port $port (PIDs: $pids)...${NC}"
        kill -9 $pids 2>/dev/null || true
    fi
}

echo -e "\n${BLUE}[1/5] Ensuring ports 8000 and 5173 are free...${NC}"
free_port 8000
free_port 5173

# 1. Setup Backend Environment
echo -e "\n${BLUE}[2/5] Checking Python backend environment...${NC}"
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment in backend/venv...${NC}"
    python3 -m venv backend/venv
    backend/venv/bin/pip install --upgrade pip
    backend/venv/bin/pip install -r backend/requirements.txt
fi

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating default backend/.env from .env.example...${NC}"
    cp backend/.env.example backend/.env
fi

# 2. Setup Frontend Environment
echo -e "\n${BLUE}[3/5] Checking Node frontend environment...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend npm dependencies...${NC}"
    (cd frontend && npm install)
fi

# 3. Trap exit signals to kill child background processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers gracefully...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}Servers stopped. Goodbye!${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 4. Launch Backend
echo -e "\n${BLUE}[4/5] Launching FastAPI Backend on http://localhost:8000 ...${NC}"
source backend/venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait briefly to ensure backend starts
sleep 2

# 5. Launch Frontend
echo -e "\n${BLUE}[5/5] Launching Vite React Frontend on http://localhost:5173 ...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host &
FRONTEND_PID=$!

cd "$PROJECT_ROOT"

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   Application is now running!                       ${NC}"
echo -e "${GREEN}   • Frontend UI:    ${CYAN}http://localhost:5173${GREEN}        ${NC}"
echo -e "${GREEN}   • Backend API:   ${CYAN}http://localhost:8000${GREEN}        ${NC}"
echo -e "${GREEN}   • API Swagger:   ${CYAN}http://localhost:8000/docs${GREEN}   ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "${YELLOW}Press [CTRL + C] anytime to stop all servers.${NC}\n"

# Wait for processes
wait
