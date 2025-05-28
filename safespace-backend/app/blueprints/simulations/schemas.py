from marshmallow import Schema, fields, validates_schema, ValidationError
from app.models import InvestmentRiskAssessment, Asset, LoanRiskAssessment
from app.extensions import ma

class LoanRiskAssessmentSchema(ma.SQLAlchemyAutoSchema):
    
    class Meta:
        model = LoanRiskAssessment

    @validates_schema
    def validate_positive_numbers(self, data, **kwargs):
        for key, value in data.items():
            if isinstance(value, str):
                continue
            elif value < 0:
                raise ValidationError(f"{key} must be a non-negative number.")

loan_schema = LoanRiskAssessmentSchema()
loans_schema = LoanRiskAssessmentSchema(many=True)

class AssetSchema(ma.SQLAlchemyAutoSchema):
    
    class Meta:
        model = Asset
        include_fk = True

asset_schema = AssetSchema()
assets_schema = AssetSchema(many=True)

class InvestmentSimulationSchema(ma.SQLAlchemyAutoSchema):
    
    class Meta:
        model = InvestmentRiskAssessment
        include_relationships = True
    
    assets = ma.Nested(AssetSchema, many=True)

investment_schema = InvestmentSimulationSchema()
investments_schema = InvestmentSimulationSchema(many=True)
investment_schema_no_assets = InvestmentSimulationSchema(exclude=("assets",))
investments_schema_no_assets = InvestmentSimulationSchema(exclude=("assets",), many=True)
