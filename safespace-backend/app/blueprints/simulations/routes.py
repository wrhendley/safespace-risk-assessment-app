from flask import request, jsonify, g
from app.blueprints.simulations import simulations_bp
from app.blueprints.simulations.schemas import investment_schema_no_assets, investment_schema, investments_schema, loan_schema, loans_schema, asset_schema
from app.utils.util import auth_required
from app.extensions import limiter
from app.models import User, db, InvestmentRiskAssessment, Asset, LoanRiskAssessment
from marshmallow import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import joinedload

@simulations_bp.route("/investments", methods=["POST"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def save_portfolio_simulation():
    data = request.get_json()
    ticker_data = data.pop("ticker_data", [])
    
    account = g.account
    print(account)
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalars().first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if "users" not in data:
        data["users"] = []
    if user.id not in data["users"]:
        data["users"].append(user.id)
    
    try:
        validated_data = investment_schema_no_assets.load(data, session=db.session)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_investment_risk_assessment = InvestmentRiskAssessment(**validated_data)
    try:
        db.session.add(new_investment_risk_assessment)
        db.session.flush()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create investment risk assessment: {str(e)}"}), 400
    
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
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to save investment risk assessment: {str(e)}"}), 400
    
    return jsonify(investment_schema.dump(new_investment_risk_assessment)), 201

@simulations_bp.route("/investments", methods=["GET"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def get_portfolio_simulations():
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    print(user.id)
    
    investment_risk_assessments = db.session.execute(
        select(InvestmentRiskAssessment)
        .where(InvestmentRiskAssessment.users.any(id=user.id))
    ).scalars().all()
    
    if not investment_risk_assessments:
        return jsonify({"message": "No investment simulations found"}), 404
    return jsonify(investments_schema.dump(investment_risk_assessments)), 200

@simulations_bp.route("/investments/<int:investment_id>", methods=["GET"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def get_portfolio_simulation(investment_id):
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    investment_risk_assessment = db.session.execute(
        select(InvestmentRiskAssessment)
        .where(InvestmentRiskAssessment.id == investment_id)
    ).scalar_one_or_none()
    
    if not investment_risk_assessment:
        return jsonify({"error": "Investment simulation not found"}), 404
    if user.id not in [user.id for user in investment_risk_assessment.users]:
        return jsonify({"error": "User not authorized to access this simulation"}), 403
    
    return jsonify(investment_schema.dump(investment_risk_assessment)), 200

@simulations_bp.route("/investments/<int:investment_id>", methods=["DELETE"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def delete_portfolio_simulation(investment_id):
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    investment_risk_assessment = db.session.execute(
        select(InvestmentRiskAssessment)
        .where(InvestmentRiskAssessment.id == investment_id)
    ).scalar_one_or_none()
    
    if not investment_risk_assessment:
        return jsonify({"error": "Investment simulation not found"}), 404
    if user.id not in [user.id for user in investment_risk_assessment.users]:
        return jsonify({"error": "User not authorized to access this simulation"}), 403
    
    try:
        db.session.delete(investment_risk_assessment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete investment simulation: {str(e)}"}), 400
    
    return jsonify({"message": "Investment simulation deleted successfully"}), 200

@simulations_bp.route("/investments/<int:investment_id>", methods=["PUT"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def update_portfolio_simulation(investment_id):
    data = request.get_json()
    ticker_data = data.pop("ticker_data", [])

    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()

    if not user:
        return jsonify({"error": "User not found"}), 404

    investment_risk_assessment = db.session.execute(
        select(InvestmentRiskAssessment).where(
            InvestmentRiskAssessment.id == investment_id
        )
    ).scalar_one_or_none()

    if not investment_risk_assessment:
        return jsonify({"error": "Investment simulation not found"}), 404

    if user not in investment_risk_assessment.users:
        return jsonify({"error": "User not authorized to access this simulation"}), 403

    try:
        validated_data = investment_schema.load(data, session=db.session)
    except ValidationError as err:
        return jsonify(err.messages), 400

    # Update main assessment fields
    for key, value in validated_data.items():
        setattr(investment_risk_assessment, key, value)

    # Map existing and incoming assets by ticker
    existing_assets = {asset.ticker: asset for asset in investment_risk_assessment.assets}
    incoming_assets = {ticker["ticker"]: ticker for ticker in ticker_data}

    # Delete removed assets
    for ticker in set(existing_assets.keys()) - set(incoming_assets.keys()):
        db.session.delete(existing_assets[ticker])

    # Update existing or create new assets
    for ticker, ticker_info in incoming_assets.items():
        ticker_info["investment_risk_assessment_id"] = investment_risk_assessment.id
        try:
            asset_data = asset_schema.load(ticker_info)
        except ValidationError as err:
            return jsonify({"ticker": err.messages}), 400

        if ticker in existing_assets:
            # Update existing asset
            for key, value in asset_data.items():
                setattr(existing_assets[ticker], key, value)
        else:
            # Create new asset
            new_asset = Asset(**asset_data)
            db.session.add(new_asset)
            investment_risk_assessment.assets.append(new_asset)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update investment simulation: {str(e)}"}), 400
    
    db.session.refresh(investment_risk_assessment)
    return jsonify(investment_schema.dump(investment_risk_assessment)), 200

@simulations_bp.route("/loans", methods=["POST"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def save_loan_simulation():
    try:
        data = loan_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    new_loan_risk_assessment = LoanRiskAssessment(**data)
    new_loan_risk_assessment.users.append(user)
    
    try:
        db.session.add(new_loan_risk_assessment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create loan risk assessment: {str(e)}"}), 400
    
    return jsonify(loan_schema.dump(new_loan_risk_assessment)), 201

@simulations_bp.route("/loans", methods=["GET"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def get_loan_simulations():
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    loan_risk_assessments = db.session.execute(
        select(LoanRiskAssessment)
        .where(LoanRiskAssessment.users.any(id=user.id))
    ).scalars().all()
    
    if not loan_risk_assessments:
        return jsonify({"message": "No loan simulations found"}), 404
    return jsonify(loans_schema.dump(loan_risk_assessments)), 200

@simulations_bp.route("/loans/<int:loan_id>", methods=["GET"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def get_loan_simulation(loan_id):
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    loan_risk_assessment = db.session.execute(
        select(LoanRiskAssessment)
        .where(LoanRiskAssessment.id == loan_id)
    ).scalar_one_or_none()
    
    if not loan_risk_assessment:
        return jsonify({"error": "Loan simulation not found"}), 404
    if user.id not in [user.id for user in loan_risk_assessment.users]:
        return jsonify({"error": "User not authorized to access this simulation"}), 403
    
    return jsonify(loan_schema.dump(loan_risk_assessment)), 200

@simulations_bp.route("/loans/<int:loan_id>", methods=["DELETE"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def delete_loan_simulation(loan_id):
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    loan_risk_assessment = db.session.execute(
        select(LoanRiskAssessment)
        .where(LoanRiskAssessment.id == loan_id)
    ).scalar_one_or_none()
    
    if not loan_risk_assessment:
        return jsonify({"error": "Loan simulation not found"}), 404
    if user.id not in [user.id for user in loan_risk_assessment.users]:
        return jsonify({"error": "User not authorized to access this simulation"}), 403
    
    try:
        db.session.delete(loan_risk_assessment)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete loan simulation: {str(e)}"}), 400
    
    return jsonify({"message": "Loan simulation deleted successfully"}), 200

@simulations_bp.route("/loans/<int:loan_id>", methods=["PUT"], strict_slashes=False)
@auth_required
@limiter.limit("1 per 10 seconds")
def update_loan_simulation(loan_id):
    data = request.get_json()
    try:
        validated_data = loan_schema.load(data, session=db.session)
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    account = g.account
    user = db.session.execute(
        select(User).where(User.account_id == account.id)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    loan_risk_assessment = db.session.execute(
        select(LoanRiskAssessment)
        .where(LoanRiskAssessment.id == loan_id)
    ).scalar_one_or_none()
    
    if not loan_risk_assessment:
        return jsonify({"error": "Loan simulation not found"}), 404
    if user.id not in [user.id for user in loan_risk_assessment.users]:
        return jsonify({"error": "User not authorized to access this simulation"}), 403
    
    for key, value in validated_data.items():
        setattr(loan_risk_assessment, key, value)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update loan simulation: {str(e)}"}), 400
    
    return jsonify(loan_schema.dump(loan_risk_assessment)), 200