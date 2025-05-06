# Import Blueprint and instantiate
from flask import Blueprint
simulation_bp = Blueprint('simulations_bp', __name__)

# Import routes
from . import routes