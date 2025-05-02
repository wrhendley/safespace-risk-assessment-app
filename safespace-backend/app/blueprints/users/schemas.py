from app.models import User
from app.extensions import ma

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User # basing schema on User Table Model
        include_fk = True
    
# instantiating schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)

user_create_schema = UserSchema(exclude=['account_id'])