from flask import request, jsonify, g
from app.utils.util import auth_required, admin_required
from app.blueprints.risk_assessments import risk_assessments_bp
from app.blueprints.risk_assessments.schemas import risk_assessment_schema, risk_assessments_schema
from app.extensions import limiter
from marshmallow import ValidationError
from app.models import Account, User, InvestmentRiskAssessment, db
from sqlalchemy import select

DEFAULT_PAGE = 1
DEFAULT_PER_PAGE = 10
MAX_PER_PAGE = 100

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
    
    new_risk_assessment = InvestmentRiskAssessment(**risk_assessment_data)
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
    
    risk_assessment = InvestmentRiskAssessment.query.filter_by(id=risk_assessment_data.get('id')).first()
    if not risk_assessment:
        return jsonify({"message": "Risk assessment not found"}), 404
    
    try:
        for key, value in risk_assessment_data.items():
            setattr(risk_assessment, key, value)
        
        db.session.commit()
        
        return risk_assessment_schema.jsonify(risk_assessment), 200
    
    except Exception as e:
        return jsonify({"message": f'There was an error: {str(e)}'}), 400

@risk_assessments_bp.route('/', methods=['GET'], strict_slashes=False)
@limiter.limit("5 per minute")
@auth_required
def get_risk_assessments():
    account = g.account
    user = User.query.filter_by(account_id=account.id).first()
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    try:
        page = request.args.get('page', DEFAULT_PAGE, type=int)
        per_page = min(request.args.get('per_page', DEFAULT_PER_PAGE, type=int), 100)
        if page < 1 or per_page < 1:
            return jsonify({"message": "Invalid page or per_page parameter"}), 400
        
        risk_assessments = select(InvestmentRiskAssessment).filter(InvestmentRiskAssessment.users.any(id=user.id)).order_by(InvestmentRiskAssessment.assessment_date.desc())
        risk_assessments = db.paginate(risk_assessments, page=page, per_page=per_page).items
        if not risk_assessments:
            return jsonify({"message": "No risk assessments found"}), 404
        
        return risk_assessments_schema.jsonify(risk_assessments), 200
    
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    except Exception as e:
        return jsonify({"message": f'There was an error: {str(e)}'}), 400

@risk_assessments_bp.route('/', methods=['DELETE'], strict_slashes=False)
@limiter.limit("5 per minute")
@auth_required
def delete_risk_assessment():
    account = g.account
    user = User.query.filter_by(account_id=account.id).first()
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    try:
        risk_assessment = InvestmentRiskAssessment.query.filter_by(id=request.json.get('id')).first()
        if not risk_assessment:
            return jsonify({"message": "Risk assessment not found"}), 404
        
        db.session.delete(risk_assessment)
        db.session.commit()
        
        return jsonify({"message": "Risk assessment deleted successfully"}), 200
    
    except ValidationError as e:
        return jsonify(e.messages), 400
    
    except Exception as e:
        return jsonify({"message": f'There was an error: {str(e)}'}), 400

