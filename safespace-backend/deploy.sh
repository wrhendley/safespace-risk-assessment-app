#!/bin/bash
set -e

echo "Changing to app directory..."
cd /home/ec2-user/myapp/safespace-backend

echo "Marking repo as safe for Git..."
git config --global --add safe.directory /home/ec2-user/myapp

echo "Pulling latest changes..."
git pull origin develop  # change to 'main' when ready

echo "Activating virtual environment..."
source venv/bin/activate

echo "Upgrading pip..."
python3 -m pip install --upgrade pip

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Checking Python/Flask versions..."
which python3
python3 --version
which flask || echo "Flask not found!"
flask --version || echo "Flask command failed!"

echo "Setting Flask environment variables..."
export FLASK_APP="app:create_app()"
export FLASK_ENV=production

echo "Applying DB migrations..."
flask db upgrade

echo "Restarting service..."
sudo systemctl restart safespace-backend
