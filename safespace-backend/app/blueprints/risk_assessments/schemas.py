from app.models import RiskAssessment
from app.extensions import ma

class RiskAssessmentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = RiskAssessment  # basing schema on RiskAssessment Table Model
        include_fk = True

# instantiating schemas
risk_assessment_schema = RiskAssessmentSchema()
risk_assessments_schema = RiskAssessmentSchema(many=True)
delete_risk_assessment_schema = RiskAssessmentSchema(only=["id"])