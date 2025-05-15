from flask import Blueprint, request, jsonify, g
# from app.blueprints.simulations.services import simulate_portfolio_logic, assess_loan_risk_logic
from app.blueprints.simulations import simulations_bp
from app.blueprints.simulations.schemas import loan_schema, portfolio_schema
from app.utils.util import auth_required
from app.models import User, db
from marshmallow import ValidationError
from sqlalchemy import select

# @simulations_bp.route("/assess-loan-risk", methods=["GET"])
# def assess_loan_risk():
#     try:
#         data = loan_schema.load(request.get_json())
#     except ValidationError as err:
#         return jsonify(err.messages), 400
#     result, status = assess_loan_risk_logic(data)
#     return jsonify(result), status

# @simulations_bp.route("/simulate-portfolio", methods=["GET"])
# def simulate_portfolio():
#     try:
#         data = portfolio_schema.load(request.get_json())
#     except ValidationError as err:
#         return jsonify(err.messages), 400
#     result, status = simulate_portfolio_logic(data)
#     return jsonify(result), status

@simulations_bp.route("/simulate-portfolio", methods=["POST"], strict_slashes=False)
# @auth_required
def save_portfolio_simulation(data):
    data = request.get_json()
    print("Received data:", data)
    
    account = g.account
    query = select(User).where(User.account_id == account.id)
    user = db.session.execute(query).scalars().first()
    
    try:
        data = portfolio_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 400
    # result, status = simulate_portfolio_logic(data)
    return jsonify(data), 200