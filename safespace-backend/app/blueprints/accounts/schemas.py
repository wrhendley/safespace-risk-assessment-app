from app.models import Account
from app.extensions import ma
from marshmallow import fields

class AccountSchema(ma.SQLAlchemyAutoSchema):
    # firebase_uid = ma.auto_field(data_key='uid')
    
    class Meta:
        model = Account # basing schema on Account Table Model

        fields = (
            'id',
            'email',
            'firebase_uid',
            'role',
            'is_active',
            'created_at',
            'updated_at',
            'email_verified',
            'user_id'
        )
        
    
# instantiating schemas
account_schema = AccountSchema()
accounts_schema = AccountSchema(many=True)

# Creating a login schema that excludes details name, phone for account authentication
account_login_schema = AccountSchema(only=['id', 'firebase_uid'])
account_update_schema = AccountSchema(only=['is_active'])