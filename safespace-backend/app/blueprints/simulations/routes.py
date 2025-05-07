from flask import request, jsonify, g
from app.utils.util import auth_required
from app.blueprints.simulations.services import simulate_portfolio_logic, assess_loan_risk_logic
from app.blueprints.simulations import simulations_bp
from app.blueprints.simulations.schemas import loan_schema, loan_input_schema, portfolio_schema
from marshmallow import ValidationError
from app.models import User, LoanRiskAssessment, db
import pandas as pd

# Load data once when the blueprint is imported
datafile = pd.read_csv("safespace-backend\dummy_stock_prediction_data_50yrs_extended.csv")
datafile['date'] = pd.to_datetime(datafile['date'])

@simulations_bp.route("/assess-loan-risk", methods=["POST"])
@auth_required
def assess_loan_risk():
    account = g.account
    user = User.query.filter_by(account_id=account.id).first()
    try:
        data = loan_input_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400
    result, status = assess_loan_risk_logic(data)
    print(result)
    result = LoanRiskAssessment(**result) # Convert to SQLAlchemy model
    user.loan_risk_assessments.append(result)
    db.session.add(result)
    db.session.commit()
    return loan_schema.jsonify(result), status

@simulations_bp.route("/simulate-portfolio", methods=["POST"])
@auth_required
def simulate_portfolio():
    account = g.account
    user = User.query.filter_by(account_id=account.id).first()
    try:
        data = portfolio_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400
    result, status = simulate_portfolio_logic(data, datafile)
    return jsonify(result), status