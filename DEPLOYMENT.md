# Zealthy EMR EC2 Deployment Guide

## Prerequisites
- AWS Account with EC2 access
- Your AWS credentials (Access Key ID and Secret Access Key)
- Basic knowledge of EC2 and SSH

## Step 1: Launch EC2 Instance

### Instance Configuration
- **Instance Type**: t3.medium (sufficient for 5 users)
- **AMI**: Ubuntu 22.04 LTS
- **Storage**: 20GB GP3
- **Security Group**: Create new with these rules:
  - SSH (22) - Your IP only
  - HTTP (80) - Anywhere (0.0.0.0/0)
  - HTTPS (443) - Anywhere (0.0.0.0/0) - Optional for SSL later
  - Custom TCP (5001) - Anywhere (0.0.0.0/0) - Backend API

### Key Pair
- Create or use existing key pair
- Download the .pem file
- Set permissions: `chmod 400 your-key.pem`

## Step 2: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 3: Upload Your Project

### Option A: Using SCP (from your local machine)
```bash
# Upload the entire project
scp -i your-key.pem -r /Users/neelkamalrana/Desktop/Zealthy/zealthy-emr ubuntu@your-ec2-public-ip:/home/ubuntu/
```

### Option B: Using Git (if you have a repository)
```bash
# On EC2 instance
cd /home/ubuntu
git clone your-repository-url zealthy-emr
```

## Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cd /home/ubuntu/zealthy-emr
cp env.production.example backend/.env
```

2. Edit the environment file:
```bash
nano backend/.env
```

3. Update these values:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `JWT_SECRET`: Generate a secure random string
- `REACT_APP_API_URL`: Replace with your EC2 public IP

## Step 5: Run Deployment Script

```bash
cd /home/ubuntu/zealthy-emr
chmod +x deploy.sh
./deploy.sh
```

## Step 6: Verify Deployment

1. Check if services are running:
```bash
pm2 status
```

2. Check nginx status:
```bash
sudo systemctl status nginx
```

3. Test the application:
- Open browser and go to: `http://your-ec2-public-ip`
- Test health endpoint: `http://your-ec2-public-ip/health`

## Step 7: Making Updates

When you make changes to your code:

1. Upload new code to EC2
2. Run the update script:
```bash
cd /home/ubuntu/zealthy-emr
chmod +x update.sh
./update.sh
```

## Monitoring and Management

### PM2 Commands
```bash
pm2 status          # Check application status
pm2 logs            # View logs
pm2 restart all     # Restart all applications
pm2 stop all        # Stop all applications
pm2 start all       # Start all applications
```

### Nginx Commands
```bash
sudo systemctl status nginx    # Check nginx status
sudo systemctl restart nginx   # Restart nginx
sudo nginx -t                  # Test nginx configuration
```

### Log Files
- Backend logs: `/home/ubuntu/logs/backend-*.log`
- Frontend logs: `/home/ubuntu/logs/frontend-*.log`
- Nginx logs: `/var/log/nginx/`

## Security Considerations

1. **Firewall**: Only open necessary ports
2. **SSH**: Use key-based authentication only
3. **Updates**: Regularly update system packages
4. **Monitoring**: Set up CloudWatch alarms for CPU/memory usage

## Troubleshooting

### Application won't start
```bash
pm2 logs zealthy-backend
pm2 logs zealthy-frontend
```

### Nginx issues
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues
- Check AWS credentials in `.env` file
- Verify DynamoDB tables exist in the correct region
- Check AWS IAM permissions

## Cost Optimization

- **Instance**: t3.medium costs ~$30/month
- **Storage**: 20GB EBS costs ~$2/month
- **Data Transfer**: Minimal for 5 users
- **Total**: ~$32-35/month

## Next Steps (Optional)

1. **SSL Certificate**: Use Let's Encrypt for HTTPS
2. **Domain Name**: Point a domain to your EC2 IP
3. **Auto-scaling**: Set up auto-scaling groups
4. **Monitoring**: Add CloudWatch monitoring
5. **Backup**: Set up automated backups

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables are set correctly
4. Ensure AWS credentials have DynamoDB permissions
