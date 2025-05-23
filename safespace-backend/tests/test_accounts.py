from app import create_app
from app.models import db, Account
import unittest
from unittest.mock import patch
from datetime import datetime

# Account Test Cases
class TestAccount(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        self.app_context = self.app.app_context()
        self.app_context.push()  # Keeps the context active during the whole test
        db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()  # Clean up the database session
        db.drop_all()  # Drop all tables after each test
        self.app_context.pop() # clean up after each test

    # Sign Up/Create New Account
    def test_account_signup(self):
        user = {
            "email": "testaccount@email.com",
            "firebase_uid": "mock_uid-456",
            "role": "user"
        }
        headers = {
            'Origin': 'http://localhost',
            'Content-Type': 'application/json'
        }
        response = self.client.post('/api/accounts', headers=headers, json=user)
        self.assertEqual(response.status_code, 201) # 201 Successful Signup
        account = Account.query.filter_by(firebase_uid='mock_uid-456').first()
        self.assertIsNotNone(account)
        self.assertEqual(account.email, 'testaccount@email.com')
        self.assertFalse(account.email_verified)

    def test_signup_existing_account(self):
        # First create an account
        account = Account(
            email='duplicate@example.com',
            firebase_uid='existing_uid',
            role='user'
        )
        db.session.add(account)
        db.session.commit()
        # Mock the same Firebase user
        account2 = {
            'firebase_uid': 'existing_uid',
            'email': 'duplicate@example.com',
            'role': 'user'
        }
        headers = {
            'Authorization': 'Bearer repeat_token',
            'Content-Type': 'application/json'
        }
        response = self.client.post('/api/accounts', headers=headers, json=account2)
        self.assertEqual(response.status_code, 409) # 409 Account Already Exists
        self.assertIn(b'Account with this email already exists', response.data)

    # # Account Login - NEED TO UPDATE PAYLOADS
    # @patch('firebase_admin.auth.verify_id_token')
    # def test_account_login(self, mock_firebase_token):
    #     mock_firebase_token.return_value = {
    #         'user_id': 'valid_firebase_uid_123',
    #         'email': 'user@example.com',
    #         'email_verified': True
    #     }
    #     # Create an account that matches
    #     account = Account(
    #         email='user@example.com',
    #         firebase_uid='valid_firebase_uid_123',
    #         role='user',
    #         is_active=True,
    #         email_verified=True
    #     )
    #     db.session.add(account)
    #     db.session.commit()
    #     headers = {
    #         'Authorization': 'Bearer valid_token'
    #     }
    #     response = self.client.post('/api/accounts', headers=headers)
    #     self.assertEqual(response.status_code, 200) # 200 Successful Login
    #     self.assertIn(b'Login successful', response.data)

    # def test_account_login_no_token(self):
    #     response = self.client.post('/api/accounts')  # no headers
    #     self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
    #     self.assertIn(b'Unauthorized', response.data)

    # @patch('firebase_admin.auth.verify_id_token')
    # def test_account_login_invalid_token(self, mock_firebase_token):
    #     # Simulate Firebase throwing an error
    #     mock_firebase_token.side_effect = Exception("Invalid token")
    #     headers = {
    #         'Authorization': 'Bearer fake_invalid_token'
    #     }
    #     response = self.client.post('/api/accounts', headers=headers)
    #     self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
    #     self.assertIn(b'Invalid or expired token', response.data)

    # @patch('firebase_admin.auth.verify_id_token')
    # def test_account_login_no_account(self, mock_firebase_token):
    #     # Firebase returns a valid user
    #     mock_firebase_token.return_value = {
    #         'user_id': 'nonexistent_uid',
    #         'email': 'ghost@example.com',
    #         'email_verified': True
    #     }
    #     headers = {
    #         'Authorization': 'Bearer valid_but_no_user'
    #     }
    #     response = self.client.post('/api/accounts', headers=headers)
    #     self.assertEqual(response.status_code, 404) # 404 Account Not Found
    #     self.assertIn(b'Account not found', response.data)

    # @patch('firebase_admin.auth.verify_id_token')
    # def test_account_login_email_not_verified(self, mock_firebase_token):
    #     mock_firebase_token.return_value = {
    #         'user_id': 'uid_unverified',
    #         'email': 'unverified@example.com',
    #         'email_verified': False
    #     }
    #     # Add the account to the DB
    #     account = Account(
    #         email='unverified@example.com',
    #         firebase_uid='uid_unverified',
    #         role='user',
    #         is_active=True,
    #         created_at=datetime.now(),
    #         last_login=datetime.now(),
    #         email_verified=True
    #     )
    #     db.session.add(account)
    #     db.session.commit()
    #     headers = {
    #         'Authorization': 'Bearer token_unverified'
    #     }
    #     response = self.client.post('/api/accounts', headers=headers)
    #     self.assertEqual(response.status_code, 403) # 403 Email Not Verified
    #     self.assertIn(b'Email not verified', response.data)

    # Get Account by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_get_account_success(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'email': 'user@example.com',
            'user_id': 'test_uid_123',
            'role': 'user'
        }
        # Create account with that UID
        account = Account(
            email='user@example.com',
            firebase_uid='test_uid_123',
            role='user',
        )
        db.session.add(account)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get(f'/api/accounts/me', headers=headers)
        self.assertEqual(response.status_code, 200) # Success
        self.assertIn(b'user@example.com', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_account_not_found(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'user_id': 'irrelevant_uid',
            'email': 'ghost@example.com',
            'email_verified': True
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get('/api/accounts/me', headers=headers)  # nonexistent ID
        self.assertEqual(response.status_code, 404) # 404 Account Not Found
        self.assertIn(b'Account not found', response.data)

    def test_get_account_unauthorized_no_token(self):
        response = self.client.get('/api/accounts/me')  # No auth header
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Missing token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_account_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception("Invalid token")
        headers = {'Authorization': 'Bearer fake_token'}
        response = self.client.get('/api/accounts/me', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid token', response.data)

    # Delete Account by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_own_account_success(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'user_id': 'delete_me_uid',
            'email': 'deleteme@example.com',
            'email_verified': True
        }
        account = Account(firebase_uid='delete_me_uid', email='deleteme@example.com', email_verified=True, role='user')
        db.session.add(account)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete(f'/api/accounts', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Deleted Account
        self.assertIn(b'Account deleted', response.data)
        self.assertIsNone(db.session.get(Account, account.id)) # Confirm deletion

    def test_delete_account_unauthorized(self):
        response = self.client.delete('/api/accounts')  # No auth header
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Missing token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_account_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception("Invalid token")
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.delete('/api/accounts', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_account_not_found(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'user_id': 'any_uid',
            'email': 'user@example.com',
            'email_verified': True
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete('/api/accounts', headers=headers)
        self.assertEqual(response.status_code, 404) # 404 Account Not Found
        self.assertIn(b'Account not found', response.data)


    # RBAC Tests
    @patch('firebase_admin.auth.verify_id_token')
    def test_admin_access_as_user(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'user_id': 'user_uid',
            'email': 'user@example.com',
            'email_verified': True
        }
        # Create account with role 'user'
        account = Account(
            firebase_uid='user_uid',
            email='user@example.com',
            email_verified=True,
            role='user'
        )
        db.session.add(account)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get('/api/accounts', headers=headers)
        self.assertEqual(response.status_code, 403) # 403 Email Not Verified
        self.assertIn(b'Admin access required', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_admin_access_as_admin(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'user_id': 'admin_uid',
            'email': 'admin@example.com',
            'email_verified': True,
            'role': 'admin'
        }
        # Create account with role 'admin'
        account = Account(
            firebase_uid='admin_uid',
            email='admin@example.com',
            email_verified=True,
            role='admin'
        )
        db.session.add(account)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get('/api/accounts', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn('admin_uid', response.data.decode())

    # @patch('firebase_admin.auth.verify_id_token')
    # def test_delete_other_user_forbidden(self, mock_firebase_token):
    #     # Authenticated user (not admin)
    #     mock_firebase_token.return_value = {
    #         'user_id': 'uid_user1',
    #         'email': 'user1@example.com',
    #         'email_verified': True
    #     }
    #     user1 = Account(firebase_uid='uid_user1', email='user1@example.com', email_verified=True, role='user')
    #     user2 = Account(firebase_uid='uid_user2', email='user2@example.com', email_verified=True, role='user')
    #     db.session.add_all([user1, user2])
    #     db.session.commit()
    #     headers = {'Authorization': 'Bearer valid_token'}
    #     response = self.client.delete(f'/api/accounts', headers=headers)
    #     self.assertEqual(response.status_code, 403) # 403 Forbidden, unable to access
    #     self.assertIn(b'Forbidden', response.data)

    # @patch('firebase_admin.auth.verify_id_token')
    # def test_admin_can_delete_any_account(self, mock_firebase_token):
    #     mock_firebase_token.return_value = {
    #         'user_id': 'admin_uid',
    #         'email': 'admin@example.com',
    #         'email_verified': True
    #     }
    #     admin = Account(firebase_uid='admin_uid', email='admin@example.com', email_verified=True, role='admin')
    #     user = Account(firebase_uid='user_uid', email='user@example.com', email_verified=True, role='user')
    #     db.session.add_all([admin, user])
    #     db.session.commit()
    #     headers = {'Authorization': 'Bearer admin_token'}
    #     response = self.client.delete(f'/api/accounts/{user.id}', headers=headers)
    #     self.assertEqual(response.status_code, 200) # 200 Succesfully Deleted Account by Admin
    #     self.assertIn(b'Account deleted', response.data)
