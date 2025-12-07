#!/bin/bash
# MagicBrush (魔刷) Development Startup Script
# This script starts both frontend and backend services and checks their health

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
BACKEND_PORT=12398
FRONTEND_PORT=5173
BACKEND_HEALTH_URL="http://localhost:${BACKEND_PORT}/api/health"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAX_RETRIES=30
RETRY_INTERVAL=2

# GCP Config
export GOOGLE_APPLICATION_CREDENTIALS="${PROJECT_ROOT}/gcp-key.json"
export GOOGLE_CLOUD_PROJECT="redinkimage"

# Print colored message
print_msg() {
    local color=$1
    local msg=$2
    echo -e "${color}${msg}${NC}"
}

# Check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_msg "$RED" "Error: $1 is not installed"
        return 1
    fi
    return 0
}

# Check backend health
check_backend_health() {
    local retries=0
    print_msg "$BLUE" "Checking backend health..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s "$BACKEND_HEALTH_URL" | grep -q '"success": true'; then
            print_msg "$GREEN" "✅ Backend is healthy!"
            return 0
        fi
        retries=$((retries + 1))
        print_msg "$YELLOW" "  Waiting for backend... ($retries/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    done
    
    print_msg "$RED" "❌ Backend health check failed after $MAX_RETRIES attempts"
    return 1
}

# Check frontend health
check_frontend_health() {
    local retries=0
    print_msg "$BLUE" "Checking frontend health..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
            print_msg "$GREEN" "✅ Frontend is healthy!"
            return 0
        fi
        retries=$((retries + 1))
        print_msg "$YELLOW" "  Waiting for frontend... ($retries/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    done
    
    print_msg "$RED" "❌ Frontend health check failed after $MAX_RETRIES attempts"
    return 1
}

# Cleanup function
cleanup() {
    print_msg "$YELLOW" "\n🛑 Stopping services..."
    
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
        print_msg "$GREEN" "  Backend stopped (PID: $BACKEND_PID)"
    fi
    
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
        print_msg "$GREEN" "  Frontend stopped (PID: $FRONTEND_PID)"
    fi
    
    print_msg "$GREEN" "✅ All services stopped"
    exit 0
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --backend-only    Start only the backend service"
    echo "  --frontend-only   Start only the frontend service"
    echo "  --check-only      Only check health of running services"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Start both services"
    echo "  $0 --backend-only     # Start only backend"
    echo "  $0 --check-only       # Check if services are running"
}

# Parse arguments
BACKEND_ONLY=false
FRONTEND_ONLY=false
CHECK_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_msg "$RED" "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Main
print_msg "$BLUE" "╔═══════════════════════════════════════════════════╗"
print_msg "$BLUE" "║     🎨 MagicBrush (魔刷) AI图文生成器 启动脚本       ║"
print_msg "$BLUE" "╚═══════════════════════════════════════════════════╝"
echo ""

cd "$PROJECT_ROOT"

# Check only mode
if [ "$CHECK_ONLY" = true ]; then
    print_msg "$BLUE" "📋 Checking service health..."
    echo ""
    
    backend_ok=false
    frontend_ok=false
    
    if curl -s "$BACKEND_HEALTH_URL" | grep -q '"success"' 2>/dev/null; then
        print_msg "$GREEN" "✅ Backend is running on port $BACKEND_PORT"
        backend_ok=true
    else
        print_msg "$RED" "❌ Backend is not running"
    fi
    
    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        print_msg "$GREEN" "✅ Frontend is running on port $FRONTEND_PORT"
        frontend_ok=true
    else
        print_msg "$RED" "❌ Frontend is not running"
    fi
    
    echo ""
    if [ "$backend_ok" = true ] && [ "$frontend_ok" = true ]; then
        print_msg "$GREEN" "🎉 All services are healthy!"
        exit 0
    else
        print_msg "$YELLOW" "⚠️  Some services are not running"
        exit 1
    fi
fi

# Check required commands
print_msg "$BLUE" "📋 Checking prerequisites..."

if [ "$BACKEND_ONLY" = false ] || [ "$FRONTEND_ONLY" = false ]; then
    check_command "uv" || { print_msg "$RED" "Please install uv: curl -LsSf https://astral.sh/uv/install.sh | sh"; exit 1; }
fi

if [ "$BACKEND_ONLY" = false ] || [ "$FRONTEND_ONLY" = true ]; then
    check_command "npm" || { print_msg "$RED" "Please install Node.js and npm"; exit 1; }
fi

check_command "curl" || { print_msg "$RED" "Please install curl"; exit 1; }

print_msg "$GREEN" "✅ All prerequisites met"
echo ""

# Start backend
if [ "$FRONTEND_ONLY" = false ]; then
    print_msg "$BLUE" "🚀 Starting backend server..."
    
    # Install dependencies if needed
    if [ ! -d ".venv" ]; then
        print_msg "$YELLOW" "  Installing Python dependencies..."
        uv sync
    fi
    
    # Start backend in background
    uv run python -m backend.app > /tmp/magicbrush_backend.log 2>&1 &
    BACKEND_PID=$!
    print_msg "$GREEN" "  Backend started (PID: $BACKEND_PID)"
    
    # Check backend health
    check_backend_health || {
        print_msg "$RED" "Backend failed to start. Check logs: /tmp/magicbrush_backend.log"
        cat /tmp/magicbrush_backend.log | tail -20
        exit 1
    }
    echo ""
fi

# Start frontend
if [ "$BACKEND_ONLY" = false ]; then
    print_msg "$BLUE" "🚀 Starting frontend dev server..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_msg "$YELLOW" "  Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend in background
    npm run dev > /tmp/magicbrush_frontend.log 2>&1 &
    FRONTEND_PID=$!
    print_msg "$GREEN" "  Frontend started (PID: $FRONTEND_PID)"
    
    cd "$PROJECT_ROOT"
    
    # Check frontend health
    check_frontend_health || {
        print_msg "$RED" "Frontend failed to start. Check logs: /tmp/magicbrush_frontend.log"
        cat /tmp/magicbrush_frontend.log | tail -20
        exit 1
    }
    echo ""
fi

# Print summary
print_msg "$GREEN" "╔═══════════════════════════════════════════════════╗"
print_msg "$GREEN" "║          🎉 All services started successfully!    ║"
print_msg "$GREEN" "╚═══════════════════════════════════════════════════╝"
echo ""

if [ "$FRONTEND_ONLY" = false ]; then
    print_msg "$BLUE" "  📡 Backend API:  http://localhost:$BACKEND_PORT"
    print_msg "$BLUE" "     Health:       $BACKEND_HEALTH_URL"
fi

if [ "$BACKEND_ONLY" = false ]; then
    print_msg "$BLUE" "  🖥️  Frontend:     $FRONTEND_URL"
fi

echo ""
print_msg "$YELLOW" "Press Ctrl+C to stop all services"
echo ""

# Keep script running
while true; do
    sleep 1
done
