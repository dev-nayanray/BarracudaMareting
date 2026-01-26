#!/bin/bash

# Barracuda Marketing App - Automated Deployment Script
# Run this script on your Ubuntu server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Barracuda Marketing App Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Get GitHub repo URL from user
echo ""
echo -e "${YELLOW}Enter your GitHub repository URL:${NC}"
echo -e "${YELLOW}(e.g., https://github.com/dev-nayanray/BarracudaMareting.git)${NC}"
read -p "URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}Repository URL is required${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[1/8] Updating system...${NC}"
apt update && apt upgrade -y

echo ""
echo -e "${GREEN}[2/8] Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version

echo ""
echo -e "${GREEN}[3/8] Installing nginx and PM2...${NC}"
apt install nginx -y
npm install -g pm2

echo ""
echo -e "${GREEN}[4/8] Cleaning up old deployment...${NC}"
pm2 kill 2>/dev/null || true
pkill -f node 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true
rm -rf /var/www/barracuda* 2>/dev/null || true
rm -rf ~/barracuda* 2>/dev/null || true

echo ""
echo -e "${GREEN}[5/8] Cloning repository...${NC}"
cd /var/www
git clone "$REPO_URL" barracuda-marketing
cd barracuda-marketing

echo ""
echo -e "${GREEN}[6/8] Installing dependencies and building...${NC}"
npm install

echo ""
echo -e "${GREEN}[7/8] Starting application with PM2...${NC}"
pm2 start npm --name "barracuda-app" -- run start
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}[8/8] Configuring nginx...${NC}"
cat > /etc/nginx/sites-available/barracuda << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/barracuda /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo ""
echo -e "${GREEN}[+] Setting up firewall...${NC}"
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}pm2 status${NC}          - Check app status"
echo -e "  ${YELLOW}pm2 logs${NC}           - View logs"
echo -e "  ${YELLOW}pm2 restart barracuda-app${NC} - Restart app"
echo -e "  ${YELLOW}curl http://localhost:3000${NC} - Test locally"
echo -e "  ${YELLOW}curl http://$(hostname -I | awk '{print $1}')${NC} - Test via IP"
echo ""

