from app.models import User
from app.extensions import ma

class AdminSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User # basing schema on User Table Model
        include_fk = True
    
# instantiating schemas
admin_schema = AdminSchema()
admins_schema = AdminSchema(many=True)

admin_create_schema = AdminSchema(exclude=['account_id'])