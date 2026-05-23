#!/usr/bin/env bash
# deploy.sh — Market Intelligence one-command setup
# Usage: bash deploy.sh

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

echo ""
echo -e "${BOLD}◉ Market Intelligence — Deploy${NC}"
echo -e "${DIM}────────────────────────────────────────${NC}"

# ── Check Docker is running ──────────────────────────────────────────────
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}✗ Docker is not running. Start Docker Desktop and try again.${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Docker is running"

# ── Prompt for API keys if .env doesn't exist ────────────────────────────
if [ ! -f .env ]; then
  echo ""
  echo -e "${BOLD}API Keys${NC}"

  read -rp "  Anthropic API key (required): " ANTHROPIC_KEY
  if [ -z "$ANTHROPIC_KEY" ]; then
    echo -e "${RED}✗ Anthropic API key is required.${NC}"
    exit 1
  fi

  read -rp "  Ahrefs API key (optional, press Enter to skip): " AHREFS_KEY

  cat > .env <<EOF
ANTHROPIC_API_KEY=${ANTHROPIC_KEY}
AHREFS_API_KEY=${AHREFS_KEY}
EOF
  echo -e "${GREEN}✓${NC} .env created"
else
  echo -e "${GREEN}✓${NC} .env already exists"
fi

# ── Ensure public/ folder exists ─────────────────────────────────────────
if [ ! -d public ]; then
  mkdir public
  echo -e "${GREEN}✓${NC} Created public/"
fi

if [ ! -f public/index.html ]; then
  echo -e "${RED}✗ public/index.html not found.${NC}"
  echo -e "  Place index.html inside the public/ folder and re-run."
  exit 1
fi
echo -e "${GREEN}✓${NC} public/index.html found"

# ── Build and start ──────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Building and starting container...${NC}"
docker compose up --build -d

# ── Wait for server to be ready ──────────────────────────────────────────
echo -ne "  Waiting for server"
for i in {1..20}; do
  if curl -sf http://localhost:3000/api/status >/dev/null 2>&1; then
    echo ""
    break
  fi
  echo -n "."
  sleep 1
done

# ── Done ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}✓ Running at http://localhost:3000${NC}"

# Show which services are active
STATUS=$(curl -sf http://localhost:3000/api/status 2>/dev/null || echo '{}')
ANTHROPIC=$(echo "$STATUS" | grep -o '"anthropic":true' || true)
AHREFS=$(echo "$STATUS"    | grep -o '"ahrefs":true'    || true)

echo ""
echo -e "  Claude  : ${ANTHROPIC:+${GREEN}✓ configured${NC}}${ANTHROPIC:-${RED}✗ missing key${NC}}"
echo -e "  Ahrefs  : ${AHREFS:+${GREEN}✓ configured${NC}}${AHREFS:-${DIM}○ not configured${NC}}"
echo ""
echo -e "${DIM}Logs:    docker compose logs -f"
echo -e "Stop:    docker compose down"
echo -e "Rebuild: docker compose up --build -d${NC}"
echo ""
