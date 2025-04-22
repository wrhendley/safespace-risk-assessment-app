from app.models import Account
from app.extensions import ma

class AccountSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Account # basing schema on Account Table Model
    
# instantiating schemas
account_schema = AccountSchema()
accounts_schema = AccountSchema(many=True)

# Creating a login schema that excludes details name, phone for account authentication
account_login_schema = AccountSchema(include=['id', 'firebase_uid'])