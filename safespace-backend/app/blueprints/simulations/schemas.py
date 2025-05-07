from app.models import LoanRiskAssessment
from app.extensions import ma
from marshmallow import fields, validates_schema, ValidationError, Schema

class LoanRiskAssessmentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = LoanRiskAssessment  # Basing schema on LoanRiskAssessment Table Model

    model = LoanRiskAssessment
    loan_amount = fields.Float(required=True)
    loan_term = fields.Integer(required=True)
    interest_rate = fields.Float(required=True)
    credit_score = fields.Integer(required=True)
    annual_income = fields.Float(required=True)
    monthly_debt = fields.Float(required=True)
    debt_to_income_ratio = fields.Float(required=True)
    loan_risk = fields.String(required=True)
    comments = fields.String(required=False)
    updated_at = fields.DateTime(required=True)

    @validates_schema
    def validate_positive_numbers(self, data, **kwargs):
        for key, value in data.items():
            if isinstance(value, (int, float)) and value < 0:
                raise ValidationError(f"{key} must be a non-negative number.")

loan_input_schema = LoanRiskAssessmentSchema(only=["loan_amount", "loan_term", "interest_rate", "credit_score", "annual_income", "monthly_debt"])
loan_schema = LoanRiskAssessmentSchema()
loans_schema = LoanRiskAssessmentSchema(many=True)

class PortfolioSimulationSchema(Schema):
    amount = fields.Float(required=True)
    tickers = fields.List(fields.String(), required=True)
    allocations = fields.Dict(keys=fields.String(), values=fields.Float(), required=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)

portfolio_schema = PortfolioSimulationSchema()
portfolios_schema = PortfolioSimulationSchema(many=True)