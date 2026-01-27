#!/bin/bash

# Barracuda Marketing - Full Clean Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Barracuda Marketing - Full Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Variables
REPO_URL="https://github.com/dev-nayanray/BarracudaMareting.git"
APP_DIR="/var/www/barracuda-marketing"
PORT=3000

echo -e "${GREEN}[1/9] Stopping old PM2 app...${NC}"
pm2 delete barracuda-app || true
pm2 kill || true
pkill -f node || true

echo -e "${GREEN}[2/9] Removing old files...${NC}"
rm -rf $APP_DIR

echo -e "${GREEN}[3/9] Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}[4/9] Installing Node.js 20.x if not installed...${NC}"
if ! command -v node > /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo -e "${GREEN}[5/9] Installing Nginx and PM2...${NC}"
apt install -y nginx
npm install -g pm2

echo -e "${GREEN}[6/9] Cloning repo...${NC}"
git clone $REPO_URL $APP_DIR
cd $APP_DIR

echo -e "${GREEN}[7/9] Installing dependencies and building...${NC}"
npm install
npm run build

echo -e "${GREEN}[8/9] Starting app with PM2...${NC}"
pm2 start npm --name "barracuda-app" -- run start
pm2 save
pm2 startup

echo -e "${GREEN}[9/9] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/barracuda << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/barracuda /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${YELLOW}Useful PM2 commands:${NC}"
echo -e "  pm2 status          - Check app status"
echo -e "  pm2 logs            - View logs"
echo -e "  pm2 restart barracuda-app - Restart app"
