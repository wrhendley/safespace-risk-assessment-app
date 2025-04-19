from app.models import User
from app.extensions import ma

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User # basing schema on User Table Model
    
# instantiating schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Left the part below in just in case we end up needing it, can be removed later
# Creating a login schema that excludes details name, phone for user authentication
# user_login_schema = UserSchema(exclude=['name', 'phone'])