#!/bin/bash
# ==============================================================================
# PharmaDali Staging Deployment Script (Single VPS Multi-Tenant)
# ==============================================================================
# This script pulls the latest staging code, rebuilds staging docker containers,
# runs staging database migrations, updates search index, and warms caches.
#
# Usage:
#   chmod +x deploy-staging.sh
#   ./deploy-staging.sh [branch-name]   (default: current branch or dev-jems)
# ==============================================================================

set -e

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.staging.yml"

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}     PharmaDali Staging Automated Deployment        ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Determine target branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "dev-jems")
TARGET_BRANCH="${1:-$CURRENT_BRANCH}"

echo -e "${YELLOW}>>> Target Git Branch:${NC} ${TARGET_BRANCH}"

# 2. Check for required environment files
if [ ! -f .env ]; then
    echo -e "${RED}[ERROR] Root .env file not found!${NC}"
    echo "Please copy .env.staging.example to .env and configure your staging domains."
    exit 1
fi

if [ ! -f backend/.env ]; then
    echo -e "${RED}[ERROR] backend/.env file not found!${NC}"
    echo "Please copy backend/.env.staging.example to backend/.env and configure your Laravel staging settings."
    exit 1
fi

# 3. Pull latest code
echo -e "${YELLOW}>>> Fetching latest changes from origin/${TARGET_BRANCH}...${NC}"
git fetch origin "$TARGET_BRANCH"
git checkout "$TARGET_BRANCH"
git pull origin "$TARGET_BRANCH"

# 4. Build and start staging containers
echo -e "${YELLOW}>>> Building and starting Staging Docker containers...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --build

# 5. Wait for staging backend app to stabilize
echo -e "${YELLOW}>>> Waiting for staging-backend-app container to stabilize...${NC}"
sleep 5

# 6. Execute Laravel maintenance & optimizations
echo -e "${YELLOW}>>> Running database migrations on staging database...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan migrate --force

echo -e "${YELLOW}>>> Ensuring public storage symlink exists...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan storage:link 2>/dev/null || true

echo -e "${YELLOW}>>> Migrating sensitive files from public to private storage...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan storage:migrate-private-files 2>/dev/null || true

echo -e "${YELLOW}>>> Clearing cached optimizations and configurations...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan optimize:clear

echo -e "${YELLOW}>>> Syncing search index settings (Meilisearch staging prefix)...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan scout:sync-index-settings 2>/dev/null || true

echo -e "${YELLOW}>>> Importing products into search index (Meilisearch)...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan scout:import "App\Models\PharmacyProduct" 2>/dev/null || true

echo -e "${YELLOW}>>> Refreshing Laravel optimizations and caches...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan optimize

echo -e "${YELLOW}>>> Ensuring correct storage and cache permissions...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app sh -c "mkdir -p /var/www/storage/app/private /var/www/storage/framework/cache/data /var/www/storage/framework/sessions /var/www/storage/framework/views /var/www/storage/logs && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache && chmod -R 775 /var/www/storage /var/www/bootstrap/cache"

# 7. Clean up dangling/unused docker images (saves SSD space on 50GB plan)
echo -e "${YELLOW}>>> Pruning old Docker images...${NC}"
docker image prune -f

# 8. Show container status
echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}    Staging Deployment Completed Successfully!      ${NC}"
echo -e "${GREEN}====================================================${NC}"
docker compose -f "$COMPOSE_FILE" ps

