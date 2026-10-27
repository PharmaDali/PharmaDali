#!/bin/bash
# ==============================================================================
# PharmaDali — 10-Second Instant Demo Reset Tool for Capstone Defense
# ==============================================================================
# This script wipes only the STAGING database and re-seeds clean demo data,
# rebuilds search index, purges cache, and displays ready-to-use login accounts.
#
# Production is 100% UNTOUCHED.
#
# Usage:
#   chmod +x reset-staging-demo.sh
#   ./reset-staging-demo.sh
# ==============================================================================

set -e

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.staging.yml"

echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}       PharmaDali Capstone Defense — Instant Demo Reset         ${NC}"
echo -e "${YELLOW}================================================================${NC}"

# Read domains dynamically from .env if present
ADMIN_URL="https://staging-admin.yourdomain.com"
API_URL="https://staging-api.yourdomain.com"
WS_URL="wss://staging-ws.yourdomain.com"

if [ -f .env ]; then
    ENV_ADMIN=$(grep -E '^ADMIN_DOMAIN=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$ENV_ADMIN" ]; then ADMIN_URL="https://${ENV_ADMIN}"; fi
    ENV_API=$(grep -E '^BACKEND_DOMAIN=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$ENV_API" ]; then API_URL="https://${ENV_API}"; fi
    ENV_WS=$(grep -E '^REVERB_DOMAIN=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$ENV_WS" ]; then WS_URL="wss://${ENV_WS}"; fi
fi

# 1. Fresh migrate and seed
echo -e "${BLUE}>>> [1/4] Fresh migrating staging database & seeding demo records...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan migrate:fresh --seed --class=DevelopmentSeeder --force

# 2. Re-index search engine (Meilisearch)
echo -e "${BLUE}>>> [2/4] Syncing & re-indexing products into Meilisearch...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan scout:sync-index-settings 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan scout:flush "App\Models\PharmacyProduct" 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan scout:import "App\Models\PharmacyProduct" 2>/dev/null || true

# 3. Clear caches and warm optimizations
echo -e "${BLUE}>>> [3/4] Purging Redis cache, clearing routes and warming app cache...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan optimize:clear
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app php artisan optimize

# 4. Storage permissions
echo -e "${BLUE}>>> [4/4] Verifying storage permissions...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T staging-backend-app sh -c "chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache && chmod -R 775 /var/www/storage /var/www/bootstrap/cache"

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}${BOLD}     STAGING DEMO RESET COMPLETE! READY FOR DEFENSE DEMO!      ${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "${CYAN}${BOLD}📋 Capstone Defense Demo Accounts Cheat Sheet:${NC}"
echo -e "----------------------------------------------------------------"
echo -e " 👑 ${BOLD}Super Admin:${NC}     superadmin@gmail.com     /  superadminpassword"
echo -e " 🏥 ${BOLD}Pharmacy Admin:${NC}  branchadmin@gmail.com    /  password1234"
echo -e " 💊 ${BOLD}Pharmacist:${NC}      pharmacist@gmail.com     /  password1234"
echo -e " 🛒 ${BOLD}Customer:${NC}        customer@gmail.com       /  password1234"
echo -e "----------------------------------------------------------------"
echo -e " 🌐 Admin Portal URL:  ${BOLD}${ADMIN_URL}${NC}"
echo -e " ⚡ Backend API URL:   ${BOLD}${API_URL}${NC}"
echo -e " 🔌 WebSockets URL:    ${BOLD}${WS_URL}${NC}"
echo -e "================================================================\n"
