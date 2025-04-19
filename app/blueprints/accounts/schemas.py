from app.models import Account
from app.extensions import ma

class AccountSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Account # basing schema on Account Table Model
    
# instantiating schemas
account_schema = AccountSchema()
accounts_schema = AccountSchema(many=True)

# Left the part below in just in case we end up needing it, can be removed later
# Creating a login schema that excludes details name, phone for account authentication
# account_login_schema = AccountSchema(exclude=['name', 'phone'])