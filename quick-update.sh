#!/bin/bash
# Quick update without full deployment

cd /app

# Pull changes
git pull origin main

# Restart services
sudo systemctl restart vegpro-backend vegpro-frontend

echo "✅ Quick update complete!"
