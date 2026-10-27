#!/bin/bash
# ==============================================================================
# PharmaDali — Staging Database Initializer (One-Time Setup)
# ==============================================================================
# This script connects to the running production MySQL container and creates
# the isolated 'pharmadali_staging' database and dedicated staging user.
#
# Usage:
#   chmod +x setup-staging-db.sh
#   ./setup-staging-db.sh
# ==============================================================================

set -e

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}====================================================${NC}"
echo -e "${YELLOW}     PharmaDali Staging Database Initialization     ${NC}"
echo -e "${YELLOW}====================================================${NC}"

# Find running MySQL container
MYSQL_CONTAINER=$(docker ps --filter "name=db" --format "{{.Names}}" | head -n 1)

if [ -z "$MYSQL_CONTAINER" ]; then
    echo -e "${RED}[ERROR] No running MySQL container found!${NC}"
    echo "Make sure your production Docker containers are running (docker compose ps)."
    exit 1
fi

echo -e "Found MySQL container: ${GREEN}${MYSQL_CONTAINER}${NC}"

# Read MySQL root password from /var/www/pharmadali/.env if present, otherwise prompt
if [ -f /var/www/pharmadali/.env ]; then
    DB_ROOT_PASSWORD=$(grep -E '^DB_ROOT_PASSWORD=' /var/www/pharmadali/.env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
fi

if [ -z "$DB_ROOT_PASSWORD" ]; then
    read -sp "Enter MySQL Root Password: " DB_ROOT_PASSWORD
    echo ""
fi

# Staging credentials
STAGING_DB="pharmadali_staging"
STAGING_USER="pharmadali_staging"
STAGING_PASS="StagingStrongPassword2026!"

# Check if staging .env exists to extract custom staging password
if [ -f .env ]; then
    CUSTOM_PASS=$(grep -E '^DB_PASSWORD=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$CUSTOM_PASS" ]; then
        STAGING_PASS="$CUSTOM_PASS"
    fi
    CUSTOM_USER=$(grep -E '^DB_USERNAME=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$CUSTOM_USER" ]; then
        STAGING_USER="$CUSTOM_USER"
    fi
fi

echo -e "Creating staging database: ${GREEN}${STAGING_DB}${NC}..."
echo -e "Creating staging user:     ${GREEN}${STAGING_USER}${NC}..."

docker exec -i "$MYSQL_CONTAINER" mysql -u root -p"$DB_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS \`${STAGING_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${STAGING_USER}'@'%' IDENTIFIED BY '${STAGING_PASS}';
ALTER USER '${STAGING_USER}'@'%' IDENTIFIED BY '${STAGING_PASS}';
GRANT ALL PRIVILEGES ON \`${STAGING_DB}\`.* TO '${STAGING_USER}'@'%';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} Staging database and user initialized successfully! ${NC}"
echo -e "${GREEN} Database: ${STAGING_DB}${NC}"
echo -e "${GREEN} Username: ${STAGING_USER}${NC}"
echo -e "${GREEN}====================================================${NC}"

