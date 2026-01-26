# Deployment Guide for Barracuda Marketing App

## Part 1: Git Setup & Push (Local Machine)

### 1.1 Initialize Git and Push to Repository

```bash
# Navigate to project directory
cd c:/Users/USER/Desktop/BarracudaMareting

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Commit changes with descriptive message
git commit -m "Fix TypeScript build error - renamed FormData interface to ContactFormData to avoid browser type conflict"

# Add your remote repository (replace with your actual GitHub/GitLab URL)
git remote add origin https://github.com/yourusername/barracuda-marketing.git

# Push to GitHub
git push -u origin main
```

### 1.2 If Git repository already exists
```bash
cd c:/Users/USER/Desktop/BarracudaMareting
git add .
git commit -m "Fix TypeScript build error"
git push origin main
```

---

## Part 2: Server Deployment Commands

### 2.1 Connect to Server
```bash
ssh root@146.190.123.242
```

### 2.2 Check Existing Services
```bash
# Check existing Node.js processes
ps aux | grep node

# Check PM2 processes
pm2 list

# Check nginx status
nginx -t
systemctl status nginx

# Check if anything is running on port 3000
netstat -tulpn | grep :3000

# Check MongoDB status
systemctl status mongod
```

### 2.3 Clean Up Existing Deployment
```bash
# Kill any existing Node processes
pkill -f node

# Kill PM2
pm2 kill

# Stop nginx temporarily
systemctl stop nginx

# Remove old deployment
rm -rf /var/www/barracuda*
rm -rf ~/barracuda*
```

### 2.4 Update Server and Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify Node.js version
node --version

# Install nginx
apt install nginx -y

# Install PM2 globally
npm install -g pm2
```

### 2.5 Deploy the Application
```bash
# Navigate to www directory
cd /var/www

# Clone the repository (replace URL with your actual repo)
git clone https://github.com/yourusername/barracuda-marketing.git barracuda-marketing
cd barracuda-marketing

# Install dependencies
npm install

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "barracuda-app" -- run start

# Save PM2 config and setup startup
pm2 save
pm2 startup

# Verify PM2 is running
pm2 list
```

### 2.6 Configure Nginx
```bash
# Create nginx config
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

# Enable the site
ln -s /etc/nginx/sites-available/barracuda /etc/nginx/sites-enabled/

# Test and restart nginx
nginx -t
systemctl restart nginx
```

### 2.7 Set Up Firewall
```bash
# Allow SSH, HTTP, HTTPS
ufw allow 22
ufw allow 80
ufw allow 443

# Enable firewall
ufw --force enable

# Verify firewall
ufw status
```

### 2.8 Verify Deployment
```bash
# Check PM2 status
pm2 list

# Test locally
curl -I http://localhost:3000

# Test via nginx
curl -I http://146.190.123.242

# Check logs
pm2 logs barracuda-app --lines 50
```

---

## Part 3: MongoDB Setup (if needed)
```bash
# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
systemctl status mongod
```

---

## Useful Commands

### Restart App
```bash
pm2 restart barracuda-app
```

### View Logs
```bash
pm2 logs barracuda-app
```

### Stop App
```bash
pm2 stop barracuda-app
```

### Update App (after git push)
```bash
cd /var/www/barracuda-marketing
git pull origin main
npm install
npm run build
pm2 restart barracuda-app
```

### Check Disk Space
```bash
df -h
```

### Check Memory
```bash
free -m
```

---

## Environment Variables
Make sure to set these environment variables on the server:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `NEXT_PUBLIC_API_ENDPOINT` - API endpoint URL

Create `.env.local` file in `/var/www/barracuda-marketing/` with your values.

