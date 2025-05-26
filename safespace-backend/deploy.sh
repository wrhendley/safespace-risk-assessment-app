echo "Changing to app directory..."
cd /home/ec2-user/myapp/safespace-backend

echo "Pulling latest changes..."
git pull origin develop # will chang this to 'main' once running for demo

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Setting Flask environment variables..."
export FLASK_APP="app:create_app()"
export FLASK_ENV=production

echo "Applying DB migrations..."
flask db upgrade

echo "Restarting service..."
sudo systemctl restart safespace-backend