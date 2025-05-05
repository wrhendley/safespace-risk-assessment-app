from flask import request, jsonify, g
from app.utils.util import auth_required, admin_required
from app.blueprints.risk_assessments import risk_assessments_bp
from app.blueprints.risk_assessments.schemas import risk_assessment_schema, risk_assessments_schema
from app.extensions import limiter
from marshmallow import ValidationError
from app.models import Account, User, RiskAssessment, db
from sqlalchemy import select

@risk_assessments_bp.route('/', methods=['POST'], strict_slashes=False)
@limiter.limit("5 per minute")
@auth_required
def create_risk_assessment():
    account = g.account
    user = User.query.filter_by(account_id=account.id).first()
    
    try:
        risk_assessment_data = risk_assessment_schema.load(request.json)

    except ValidationError as e:
        return jsonify(e.messages), 400
    
    new_risk_assessment = RiskAssessment(**risk_assessment_data)
    if user:
        new_risk_assessment.users.append(user)
        db.session.add(new_risk_assessment)
        db.session.commit()
    
    return risk_assessment_schema.jsonify(new_risk_assessment), 201