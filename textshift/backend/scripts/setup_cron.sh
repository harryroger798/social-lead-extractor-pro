#!/bin/bash
# Setup cron job for TextShift weekly training
# Run this script once on the droplet to configure automatic training

set -e

echo "Setting up TextShift weekly training cron job..."

# Create log directory
sudo mkdir -p /var/log/textshift
sudo chown $USER:$USER /var/log/textshift

# Create the cron entry
CRON_ENTRY="0 3 * * 0 /opt/textshift/backend/venv/bin/python /opt/textshift/backend/scripts/weekly_training.py >> /var/log/textshift/training.log 2>&1"

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "weekly_training.py"; then
    echo "Cron job already exists. Updating..."
    # Remove old entry and add new one
    (crontab -l 2>/dev/null | grep -v "weekly_training.py"; echo "$CRON_ENTRY") | crontab -
else
    echo "Adding new cron job..."
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

echo "Cron job configured:"
echo "  Schedule: Every Sunday at 3:00 AM UTC"
echo "  Script: /opt/textshift/backend/scripts/weekly_training.py"
echo "  Log: /var/log/textshift/training.log"
echo ""
echo "Current crontab:"
crontab -l

echo ""
echo "Setup complete! The training will run automatically every Sunday at 3 AM UTC."
echo ""
echo "To manually trigger training, run:"
echo "  /opt/textshift/backend/venv/bin/python /opt/textshift/backend/scripts/weekly_training.py"
echo ""
echo "To force training (even with insufficient samples):"
echo "  /opt/textshift/backend/venv/bin/python /opt/textshift/backend/scripts/weekly_training.py --force"
