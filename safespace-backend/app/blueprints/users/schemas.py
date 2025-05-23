from app.models import User
from app.extensions import ma

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User # basing schema on User Table Model
    
# instantiating schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
