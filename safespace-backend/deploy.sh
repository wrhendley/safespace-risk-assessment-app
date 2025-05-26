#!/bin/bash
set -e

echo "Changing to app directory..."
cd /home/ec2-user/myapp/safespace-backend

echo "Marking repo as safe for Git..."
git config --global --add safe.directory "$(pwd)"
git config --global --get-all safe.directory

echo "Pulling latest changes..."
git pull origin develop  # change to 'main' when ready

# Deleting old venv, if any
if [ -d "venv" ]; then
    echo "Removing old virtual environment..."
    rm -rf venv
fi

echo "Creating virtual environment..."
python3.10 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Upgrading pip..."
python3.10 -m pip install --upgrade pip

echo "Installing dependencies..."
pip install --upgrade -r requirements.txt

echo "Verifying pip install context..."
which python
which pip
pip list

echo "Checking Python/Flask versions..."
which python3.10
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
