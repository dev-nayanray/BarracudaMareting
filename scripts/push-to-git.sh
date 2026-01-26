#!/bin/bash

# Git Push Script for Barracuda Marketing App
# Run this on your local machine (Windows PowerShell or Git Bash)

echo "========================================"
echo "  Git Push - Barracuda Marketing App"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "[!] Git not initialized. Initializing now..."
    git init
fi

# Ask for remote URL if not set
if ! git remote get-url origin 2>/dev/null; then
    echo "Enter your GitHub repository URL:"
    echo "(e.g., https://github.com/username/barracuda-marketing.git)"
    read -p "URL: " REMOTE_URL
    
    if [ -n "$REMOTE_URL" ]; then
        git remote add origin "$REMOTE_URL"
        echo "[+] Remote origin added"
    else
        echo "[!] No remote URL provided"
        exit 1
    fi
fi

echo ""
echo "[1/4] Staging all files..."
git add .

echo ""
echo "[2/4] Enter commit message:"
read -p "Message: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

git commit -m "$COMMIT_MSG"

echo ""
echo "[3/4] Pushing to main branch..."
git push -u origin main

echo ""
echo "========================================"
echo "[+] Push complete!"
echo "========================================"

