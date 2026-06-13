#!/bin/bash

# AtomAssist - Complete Setup Script
# This script automates the entire setup process

echo "════════════════════════════════════════════════════════"
echo "  🚀 AtomAssist Setup Script"
echo "════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"

# Step 1: Install Backend Dependencies
echo ""
echo -e "${YELLOW}Step 1: Installing Backend Dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Backend installation failed${NC}"
    exit 1
fi

# Step 2: Build Backend
echo ""
echo -e "${YELLOW}Step 2: Building Backend TypeScript...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi

# Step 3: Install Frontend Dependencies
echo ""
echo -e "${YELLOW}Step 3: Installing Frontend Dependencies...${NC}"
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Frontend installation failed${NC}"
    exit 1
fi

# Step 4: Build Frontend
echo ""
echo -e "${YELLOW}Step 4: Building Frontend...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "1. Deploy database schema and seed data to Supabase"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:5173"
echo ""
