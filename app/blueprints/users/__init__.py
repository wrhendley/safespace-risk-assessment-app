# Import Blueprint and instantiate
from flask import Blueprint
users_bp = Blueprint('users_bp', __name__)

# Import routes
from . import routes