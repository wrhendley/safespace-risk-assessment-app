from flask import Blueprint, request, jsonify, g
from app.blueprints.simulations import simulations_bp
from app.blueprints.simulations.schemas import loan_schema, investment_schema
from app.utils.util import auth_required
from app.models import User, db
from marshmallow import ValidationError
from sqlalchemy import select

@simulations_bp.route("/investments", methods=["POST"], strict_slashes=False)
@auth_required
def save_portfolio_simulation():
    data = request.get_json()
    print("Received data:", data)
    
    account = g.account
    query = select(User).where(User.account_id == account.id)
    user = db.session.execute(query).scalars().first()
    
    try:
        data = investment_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify(err.messages), 400
    return jsonify(data), 200