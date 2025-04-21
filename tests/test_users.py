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
        self.client = self.app.test_client()
        with self.app.app_context():
            db.drop_all()
            db.create_all()

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