from flask import Blueprint, request, jsonify
from app.blueprints.simulations.services import simulate_portfolio_logic, assess_loan_risk_logic
from app.blueprints.simulations import simulations_bp
from app.blueprints.simulations.schemas import loan_schema, portfolio_schema
from marshmallow import ValidationError

@simulations_bp.route("/assess-loan-risk", methods=["GET"])
def assess_loan_risk():
    try:
        data = loan_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 400
    result, status = assess_loan_risk_logic(data)
    return jsonify(result), status

@simulations_bp.route("/simulate-portfolio", methods=["GET"])
def simulate_portfolio():
    try:
        data = portfolio_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 400
    result, status = simulate_portfolio_logic(data)
    return jsonify(result), status