# TextShift Migration Guide: DigitalOcean to Hostinger KVM 2

This document provides step-by-step instructions for migrating the TextShift platform from DigitalOcean droplet to Hostinger KVM 2 VPS.

## Current Infrastructure (DigitalOcean)

- **Droplet IP:** 143.110.183.71
- **Specs:** 4GB RAM, 2 vCPUs, 80GB SSD ($24/month)
- **OS:** Ubuntu 22.04 LTS
- **Backend:** /opt/textshift/backend (FastAPI + Gunicorn)
- **Frontend:** /opt/textshift/frontend/dist (Vite build)
- **Database:** PostgreSQL 14
- **ML Models:** /opt/textshift/models (downloaded from iDrive e2)
- **Domain:** textshift.org (DNS managed via DigitalOcean)

## Target Infrastructure (Hostinger KVM 2)

- **Specs:** 8GB RAM, 2 vCPU cores, 100GB NVMe SSD
- **Price:** ~$10/month (promotional) or $16/month regular
- **Benefits:** More RAM for ML models, faster NVMe storage

## Pre-Migration Checklist

1. [ ] Backup current database
2. [ ] Export all environment variables from current .env file
3. [ ] Document current nginx/caddy configuration
4. [ ] Note all systemd service configurations
5. [ ] Verify Hostinger VPS is provisioned and accessible

## Migration Steps

### Step 1: Provision Hostinger KVM 2

1. Log into Hostinger control panel
2. Order KVM 2 VPS with Ubuntu 22.04 LTS
3. Note the new server IP address
4. Set up SSH key authentication

```bash
# Add your SSH key to Hostinger VPS
ssh-copy-id -i ~/.ssh/id_rsa root@NEW_HOSTINGER_IP
```

### Step 2: Install Required Software on Hostinger

```bash
# Connect to Hostinger VPS
ssh root@NEW_HOSTINGER_IP

# Update system
apt update && apt upgrade -y

# Install Python 3.12
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install python3.12 python3.12-venv python3.12-dev -y

# Install PostgreSQL 14
apt install postgresql postgresql-contrib -y

# Install Node.js 20 (for frontend if needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y

# Install Nginx
apt install nginx -y

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

# Install other dependencies
apt install git curl wget unzip -y
```

### Step 3: Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE USER textshift WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE textshift OWNER textshift;
GRANT ALL PRIVILEGES ON DATABASE textshift TO textshift;
\q
```

### Step 4: Backup and Transfer Database

On DigitalOcean droplet:
```bash
# Create database backup
pg_dump -U textshift -h localhost textshift > textshift_backup.sql

# Transfer to Hostinger
scp textshift_backup.sql root@NEW_HOSTINGER_IP:/tmp/
```

On Hostinger VPS:
```bash
# Restore database
sudo -u postgres psql textshift < /tmp/textshift_backup.sql
```

### Step 5: Create Application Directory Structure

```bash
# Create directories
mkdir -p /opt/textshift/backend
mkdir -p /opt/textshift/frontend/dist
mkdir -p /opt/textshift/models
mkdir -p /opt/textshift/logs
```

### Step 6: Transfer Backend Application

From your local machine or DigitalOcean:
```bash
# Transfer backend code
rsync -avz --exclude='venv' --exclude='__pycache__' --exclude='.env' \
  root@143.110.183.71:/opt/textshift/backend/ \
  root@NEW_HOSTINGER_IP:/opt/textshift/backend/
```

### Step 7: Set Up Python Virtual Environment

On Hostinger VPS:
```bash
cd /opt/textshift/backend

# Create virtual environment
python3.12 -m venv venv

# Activate and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn uvicorn
```

### Step 8: Create Environment File

Create `/opt/textshift/backend/.env` with the following variables:

```bash
# Database
DATABASE_URL=postgresql://textshift:YOUR_DB_PASSWORD@localhost:5432/textshift

# Security
SECRET_KEY=your-secure-secret-key-here

# Email (Mailgun)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=textshift.org

# Payment (PayPal)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret
PAYPAL_MODE=live

# HuggingFace
HF_TOKEN=your-huggingface-token

# iDrive e2 Storage
S3_ENDPOINT=https://s3.us-west-1.idrivee2.com
S3_BUCKET=crop-spray-uploads
S3_ACCESS_KEY=your-idrive-access-key
S3_SECRET_KEY=your-idrive-secret-key

# External APIs
FIRECRAWL_API_KEY=your-firecrawl-api-key
SERPER_API_KEY=your-serper-api-key
ORIGINALITY_API_KEY=your-originality-api-key

# ML Models
MODEL_PATH=/opt/textshift/models
```

**IMPORTANT:** Copy the actual API keys from the current DigitalOcean droplet's `.env` file:
```bash
# On DigitalOcean droplet, view current .env
cat /opt/textshift/backend/.env
```

Set proper permissions:
```bash
chmod 600 /opt/textshift/backend/.env
```

### Step 9: Create Systemd Service

Create `/etc/systemd/system/textshift-backend.service`:
```bash
cat > /etc/systemd/system/textshift-backend.service << 'EOF'
[Unit]
Description=TextShift FastAPI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/textshift/backend
Environment="PATH=/opt/textshift/backend/venv/bin"
EnvironmentFile=/opt/textshift/backend/.env
ExecStart=/opt/textshift/backend/venv/bin/gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 --timeout 300
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable textshift-backend
systemctl start textshift-backend
```

### Step 10: Transfer Frontend Build

```bash
# Transfer frontend build
rsync -avz root@143.110.183.71:/opt/textshift/frontend/dist/ \
  root@NEW_HOSTINGER_IP:/opt/textshift/frontend/dist/
```

### Step 11: Configure Nginx

Create `/etc/nginx/sites-available/textshift`:
```nginx
server {
    listen 80;
    server_name textshift.org www.textshift.org;

    # Frontend
    location / {
        root /opt/textshift/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/textshift /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Step 12: Set Up SSL Certificate

```bash
certbot --nginx -d textshift.org -d www.textshift.org
```

### Step 13: Update DNS Records

1. Log into your domain registrar (or DNS provider)
2. Update A records:
   - `textshift.org` -> NEW_HOSTINGER_IP
   - `www.textshift.org` -> NEW_HOSTINGER_IP
3. Wait for DNS propagation (up to 48 hours, usually faster)

### Step 14: Download ML Models

The ML models will be automatically downloaded from iDrive e2 on first use. To pre-download:

```bash
# Create models directory
mkdir -p /opt/textshift/models

# The backend will automatically download models from iDrive e2 when needed
# Models are stored in: s3://crop-spray-uploads/textshift-models/
```

### Step 15: Verify Installation

```bash
# Check backend status
systemctl status textshift-backend

# Check logs
journalctl -u textshift-backend -f

# Test API
curl http://localhost:8000/api/v1/health

# Test frontend
curl http://localhost/
```

### Step 16: Final Verification

1. Visit https://textshift.org
2. Test login functionality
3. Test AI Detection
4. Test Humanizer
5. Test Plagiarism Checker
6. Test Writing Tools (Grammar, Tone, Summarizer, etc.)
7. Test Admin Panel
8. Verify email notifications work

## Post-Migration Tasks

1. [ ] Monitor logs for errors: `journalctl -u textshift-backend -f`
2. [ ] Set up automated backups
3. [ ] Configure firewall (ufw)
4. [ ] Set up monitoring (optional)
5. [ ] Cancel DigitalOcean droplet after verification period

## Firewall Configuration

```bash
# Enable UFW
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

## Backup Script

Create `/opt/textshift/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/opt/textshift/backups

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U textshift textshift > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
```

Add to crontab:
```bash
crontab -e
# Add: 0 3 * * * /opt/textshift/backup.sh
```

## Rollback Plan

If migration fails:
1. DNS records can be reverted to DigitalOcean IP (143.110.183.71)
2. DigitalOcean droplet remains operational during migration
3. Only cancel DigitalOcean after 7+ days of successful Hostinger operation

## Support Contacts

- Hostinger Support: https://www.hostinger.com/contact
- TextShift Admin: harryroger798@gmail.com

---

**Document Version:** 1.0
**Last Updated:** February 2026
**Author:** Devin AI
