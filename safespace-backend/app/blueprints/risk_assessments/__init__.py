# Import Blueprint and instantiate
from flask import Blueprint
risk_assessments_bp = Blueprint('risk_assessments_bp', __name__)

# Import routes
from . import routes