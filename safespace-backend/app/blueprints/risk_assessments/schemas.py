from app.models import InvestmentRiskAssessment
from app.extensions import ma

class RiskAssessmentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = InvestmentRiskAssessment  # basing schema on RiskAssessment Table Model
        include_fk = True

# instantiating schemas
risk_assessment_schema = RiskAssessmentSchema()
risk_assessments_schema = RiskAssessmentSchema(many=True)
delete_risk_assessment_schema = RiskAssessmentSchema(only=["id"])