#!/bin/bash

# Quick update script for Zealthy EMR
# Run this after uploading new code to EC2

set -e

echo "🔄 Updating Zealthy EMR application..."

cd /home/ubuntu/zealthy-emr

# Update backend
echo "🔨 Building backend..."
cd backend
npm install --production
npm run build

# Update frontend
echo "🔨 Building frontend..."
cd ../frontend
npm install
npm run build

# Restart applications
echo "🚀 Restarting applications..."
pm2 restart all

echo "✅ Update completed!"
echo "📊 Application status:"
pm2 status
