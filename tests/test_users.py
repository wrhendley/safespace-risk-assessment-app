from app.models import db, User, Account
from app import create_app
import unittest
from datetime import datetime
# from app.utils.util import encode_token

# Notes, to be removed when no longer needed:
# need token creation and decoding funcions started to use function names
# add test functions from Accounts to log into account, add Account in setup for login purposes and authorization for token required routes

# User Test Cases
class TestUser(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        today = datetime
        self.user = User(email="accountemail@test.com", firebase_uid="", email_verified="true", role='admin', created_at=today, updated_at=today) # attributes can be adjusted, placed all for time being
        self.account = Account(email="accountemail@test.com", firebase_uid="", email_verified="true", role='admin', created_at=today, updated_at=today)
        with self.app.app_context():
            db.drop_all()
            db.create_all()
            db.session.add(self.customer)
            db.session.commit()
        self.token = encode_token(1) # need to update this according to the util file
        self.client = self.app.test_client()

    # Create New User
    def test_create_user(self):
        pass

    def test_invalid_create(self):
        pass

    # Get User by ID, auth required
    def test_get_user(self):
        pass

    def test_get_user_fail(self):
        pass

    # Update User by ID, auth required
    def test_update_user(self):
        pass

    def test_invalid_update(self):
        pass

    # Delete User by ID, auth required
    def test_delete_user(self):
        pass

    def test_invalid_delete(self):
        pass