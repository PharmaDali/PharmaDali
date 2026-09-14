#!/bin/bash
# ==============================================================================
# PharmaDali Deployment Script (DigitalOcean Droplet / VPS)
# ==============================================================================
# This script pulls the latest code from git, rebuilds docker containers,
# runs database migrations, clears/warms caches, and prunes unused images.
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh [branch-name]   (default: current branch or dev-jems)
# ==============================================================================

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}        PharmaDali Automated Deployment             ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Determine target branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "dev-jems")
TARGET_BRANCH="${1:-$CURRENT_BRANCH}"

echo -e "${YELLOW}>>> Target Git Branch:${NC} ${TARGET_BRANCH}"

# 2. Check for required environment files
if [ ! -f .env ]; then
    echo -e "${RED}[ERROR] Root .env file not found!${NC}"
    echo "Please copy .env.example to .env and configure your domains and DB passwords."
    exit 1
fi

if [ ! -f backend/.env ]; then
    echo -e "${RED}[ERROR] backend/.env file not found!${NC}"
    echo "Please copy backend/.env.example to backend/.env and configure your Laravel settings."
    exit 1
fi

# 3. Pull latest code
echo -e "${YELLOW}>>> Fetching latest changes from origin/${TARGET_BRANCH}...${NC}"
git fetch origin "$TARGET_BRANCH"
git checkout "$TARGET_BRANCH"
git pull origin "$TARGET_BRANCH"

# 4. Build and start containers
echo -e "${YELLOW}>>> Building and starting Docker containers...${NC}"
docker compose up -d --build

# 5. Wait for backend app to be ready
echo -e "${YELLOW}>>> Waiting for backend-app container to stabilize...${NC}"
sleep 5

# 6. Execute Laravel maintenance & optimizations
echo -e "${YELLOW}>>> Running database migrations...${NC}"
docker compose exec -T backend-app php artisan migrate --force

echo -e "${YELLOW}>>> Ensuring public storage symlink exists...${NC}"
docker compose exec -T backend-app php artisan storage:link 2>/dev/null || true

echo -e "${YELLOW}>>> Refreshing Laravel optimizations and caches...${NC}"
docker compose exec -T backend-app php artisan optimize:clear
docker compose exec -T backend-app php artisan optimize

# 7. Clean up dangling/unused docker images (saves SSD space on 50GB plan)
echo -e "${YELLOW}>>> Pruning old Docker images...${NC}"
docker image prune -f

# 8. Show container status
echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}        Deployment Completed Successfully!          ${NC}"
echo -e "${GREEN}====================================================${NC}"
docker compose ps

