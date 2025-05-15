from marshmallow import Schema, fields, validates_schema, ValidationError

class LoanRiskAssessmentSchema(Schema):
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

class InvestmentSimulationSchema(Schema):
    class Meta:
        model = 'InvestmentRiskAssessment'
        include_fk = True

investment_schema = InvestmentSimulationSchema()
investments_schema = InvestmentSimulationSchema(many=True)