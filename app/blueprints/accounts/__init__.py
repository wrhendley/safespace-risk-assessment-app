# Import Blueprint and instantiate
from flask import Blueprint
accounts_bp = Blueprint('accounts_bp', __name__)

# Import routes
from . import routes