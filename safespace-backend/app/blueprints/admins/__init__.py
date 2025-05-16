# Import Blueprint and instantiate
from flask import Blueprint
admins_bp = Blueprint('admins_bp', __name__)

# Import routes
from . import routes