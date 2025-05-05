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

@risk_assessments_bp.route('/', methods=['PUT'], strict_slashes=False)
@limiter.limit("5 per minute")
@auth_required
def update_risk_assessment():
    account = g.account
    user = User.query.filter_by(account_id=account.id).first()
    
    try:
        risk_assessment_data = risk_assessment_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    risk_assessment = RiskAssessment.query.filter_by(id=risk_assessment_data.get('id')).first()
    if not risk_assessment:
        return jsonify({"message": "Risk assessment not found"}), 404
    
    try:
        for key, value in risk_assessment_data.items():
            setattr(risk_assessment, key, value)
        
        db.session.commit()
        
        return risk_assessment_schema.jsonify(risk_assessment), 200
    
    except Exception as e:
        return jsonify({"message": f'There was an error: {str(e)}'}), 400