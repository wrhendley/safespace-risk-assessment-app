from app.models import db, User, Account
from app import create_app
import unittest
from unittest.mock import patch
from datetime import datetime

# Notes, to be removed when no longer needed:

# User Test Cases
class TestUser(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        self.client = self.app.test_client()
        with self.app.app_context():
            db.drop_all()
            db.create_all()

    # Create New User
    @patch('firebase_admin.auth.verify_id_token')
    def test_create_user_success(self, mock_verify_id_token):
        mock_verify_id_token.return_value = {
            'uid': 'user_uid_1',
            'email': 'user@example.com',
            'email_verified': True
        }
        # Create account
        account = Account(firebase_uid='user_uid_1', email='user@example.com', email_verified=True)
        db.session.add(account)
        db.session.commit()
        payload = {
            'account_id': account.account_id,
            'first_name': 'John',
            'last_name': 'Doe',
            'phone_number': '1234567890'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.post('/users', json=payload, headers=headers)
        self.assertEqual(response.status_code, 201) # 201 User Created Successfully
        self.assertIn(b'User created', response.data)
        user = User.query.filter_by(account_id=account.id).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'John')


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