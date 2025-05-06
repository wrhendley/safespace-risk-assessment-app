from flask import Blueprint, request, jsonify
from app.blueprints.simulations.services import simulate_portfolio_logic, assess_loan_risk_logic
from app.blueprints.simulations import simulation_bp
import pandas as pd

# Load data once when the blueprint is imported
datafile = pd.read_csv("dummy_stock_prediction_data_50yrs_extended.csv")
datafile['date'] = pd.to_datetime(datafile['date'])

@simulation_bp.route("/simulate_portfolio", methods=["POST"])
def simulate_portfolio():
    data = request.get_json()
    result, status = simulate_portfolio_logic(data, datafile)
    return jsonify(result), status

@simulation_bp.route("/assess_loan_risk", methods=["POST"])
def assess_loan_risk():
    data = request.get_json()
    result, status = assess_loan_risk_logic(data)
    return jsonify(result), status