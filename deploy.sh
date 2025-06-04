#!/bin/bash

echo "🚀 VegPro Deployment Script"
echo "=========================="

# Navigate to app directory
cd /app

# Pull latest changes from GitHub
echo "📥 Pulling latest changes..."
git pull origin main

# Update backend dependencies if requirements.txt changed
if git diff HEAD@{1} --name-only | grep -q "backend/requirements.txt"; then
    echo "📦 Updating backend dependencies..."
    cd /app/backend
    sudo -u vegpro python3 -m pip install --user -r requirements.txt
    cd /app
fi

# Update frontend dependencies if package.json changed
if git diff HEAD@{1} --name-only | grep -q "frontend/package.json"; then
    echo "📦 Updating frontend dependencies..."
    cd /app/frontend
    sudo -u vegpro yarn install
    cd /app
fi

# Set proper ownership
echo "🔧 Setting permissions..."
sudo chown -R vegpro:vegpro /app

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart vegpro-backend
sudo systemctl restart vegpro-frontend

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
sudo systemctl is-active vegpro-backend vegpro-frontend

# Get external IP
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application URL: http://$EXTERNAL_IP"
echo "🔗 Backend API: http://$EXTERNAL_IP:8001"
echo ""
