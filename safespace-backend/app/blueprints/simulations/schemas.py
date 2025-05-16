from marshmallow import Schema, fields, validates_schema, ValidationError
from app.models import InvestmentRiskAssessment
from app.extensions import ma

class LoanRiskAssessmentSchema(ma.SQLAlchemyAutoSchema):
    loan_amount = fields.Float(required=True)
    loan_term = fields.Integer(required=True)
    interest_rate = fields.Float(required=True)
    credit_score = fields.Integer(required=True)
    annual_income = fields.Float(required=True)
    monthly_debt = fields.Float(required=True)

    @validates_schema
    def validate_positive_numbers(self, data, **kwargs):
        for key, value in data.items():
            if value < 0:
                raise ValidationError(f"{key} must be a non-negative number.")

loan_schema = LoanRiskAssessmentSchema()
loans_schema = LoanRiskAssessmentSchema(many=True)

class InvestmentSimulationSchema(ma.SQLAlchemyAutoSchema):
    user_id = fields.Int(required=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)
    risk_score = fields.Float(required=True)
    risk_level = fields.Str(required=True)
    return_percent = fields.Float(required=True)
    initial_investment = fields.Float(required=True)
    final_value = fields.Float(required=True)
    portfolio_volatility = fields.Float(required=True)
    portfolio_sharpe_ratio = fields.Float(required=True)
    
    class Meta:
        model = InvestmentRiskAssessment
        include_fk = True

investment_schema = InvestmentSimulationSchema()
investments_schema = InvestmentSimulationSchema(many=True)