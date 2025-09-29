#!/bin/bash

# Zealthy EMR EC2 Deployment Script
# Run this script on your EC2 instance

set -e  # Exit on any error

echo "🚀 Starting Zealthy EMR deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install serve for frontend
echo "📦 Installing serve..."
sudo npm install -g serve

# Install nginx
echo "📦 Installing nginx..."
sudo apt install -y nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /home/ubuntu/zealthy-emr
sudo chown ubuntu:ubuntu /home/ubuntu/zealthy-emr

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p /home/ubuntu/logs

# Clone or copy your project (you'll need to upload your code)
echo "📁 Setting up project structure..."
cd /home/ubuntu/zealthy-emr

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Build backend
echo "🔨 Building backend..."
npm run build

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Copy configuration files
echo "📋 Setting up configuration files..."
cd /home/ubuntu/zealthy-emr
cp ecosystem.config.js /home/ubuntu/
cp nginx.conf /etc/nginx/sites-available/zealthy-emr

# Enable nginx site
echo "🌐 Configuring nginx..."
sudo ln -sf /etc/nginx/sites-available/zealthy-emr /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start applications with PM2
echo "🚀 Starting applications..."
pm2 start /home/ubuntu/ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment completed!"
echo "🌐 Your application should be accessible at: http://$(curl -s ifconfig.me)"
echo "❤️  Health check: http://$(curl -s ifconfig.me)/health"
echo ""
echo "📊 To monitor your applications:"
echo "   pm2 status"
echo "   pm2 logs"
echo "   pm2 restart all"
echo ""
echo "🔧 To update your application:"
echo "   1. Upload new code to /home/ubuntu/zealthy-emr"
echo "   2. Run: cd /home/ubuntu/zealthy-emr/backend && npm run build"
echo "   3. Run: cd /home/ubuntu/zealthy-emr/frontend && npm run build"
echo "   4. Run: pm2 restart all"
