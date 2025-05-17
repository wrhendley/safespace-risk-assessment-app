from flask import Blueprint, request, jsonify, g
from app.blueprints.simulations import simulations_bp
from app.blueprints.simulations.schemas import loan_schema, investment_schema, asset_schema
from app.utils.util import auth_required
from app.models import User, db, InvestmentRiskAssessment, Asset, LoanRiskAssessment
from marshmallow import ValidationError
from sqlalchemy import select
from datetime import datetime

@simulations_bp.route("/investments", methods=["POST"], strict_slashes=False)
@auth_required
def save_portfolio_simulation():
    data = request.get_json()
    ticker_data = data.pop("ticker_data", [])
    
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data["user_id"] = user.id
    
    try:
        validated_data = investment_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_investment_risk_assessment = InvestmentRiskAssessment(**validated_data)
    db.session.add(new_investment_risk_assessment)
    db.session.flush()
    
    assets = []
    for ticker in ticker_data:
        ticker["investment_risk_assessment_id"] = new_investment_risk_assessment.id
        try:
            asset_data = asset_schema.load(ticker)
            asset = Asset(**asset_data)
            assets.append(asset)
        except ValidationError as err:
            return jsonify({"ticker": err.messages}), 400
    
    new_investment_risk_assessment.assets = assets
    
    db.session.commit()
    
    return jsonify(investment_schema.dump(new_investment_risk_assessment)), 201

@simulations_bp.route("/loans", methods=["POST"], strict_slashes=False)
@auth_required
def save_loan_simulation():
    data = loan_schema.load(request.get_json())
    
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    new_loan_risk_assessment = LoanRiskAssessment(**data)
    new_loan_risk_assessment.users.append(user)
    
    db.session.add(new_loan_risk_assessment)
    db.session.commit()
    
    return jsonify(loan_schema.dump(new_loan_risk_assessment)), 201
