from flask import Blueprint, request, jsonify
from app.blueprints.simulations.services import simulate_portfolio_logic, assess_loan_risk_logic
from app.blueprints.simulations import simulations_bp
from app.blueprints.simulations.schemas import loan_schema, portfolio_schema
from marshmallow import ValidationError
import pandas as pd

# Load data once when the blueprint is imported
datafile = pd.read_csv("dummy_stock_prediction_data_50yrs_extended.csv")
datafile['date'] = pd.to_datetime(datafile['date'])

@simulations_bp.route("/assess-loan-risk", methods=["POST"])
def assess_loan_risk():
    try:
        data = loan_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 400
    result, status = assess_loan_risk_logic(data)
    return jsonify(result), status

@simulations_bp.route("/simulate-portfolio", methods=["POST"])
def simulate_portfolio():
    try:
        data = portfolio_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 400
    result, status = simulate_portfolio_logic(data, datafile)
    return jsonify(result), status