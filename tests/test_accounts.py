from app.models import db, Account
from app import create_app
import unittest
from unittest.mock import patch
from datetime import datetime

# Account Test Cases
class TestAccount(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        self.client = self.app.test_client()
        with self.app.app_context():
            db.drop_all()
            db.create_all()

    # Sign Up/Create New Account
    @patch('firebase_admin.auth.verify_id_token')
    def test_account_signup(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            "email": "testaccount@email.com",
            "firebase_uid": "mock_uid-456",
            "email_verified": True
        }
        headers = {
            'Authorization': 'Bearer fake_valid_token'
        }
        response = self.client.post('/signup', headers=headers)
        self.assertEqual(response.status_code, 201) # 201 Successful Signup
        self.assertIn(b'Account created', response.data)
        account = Account.query.filter_by(firebase_uid='mock_uid-456').first()
        self.assertIsNotNone(account)
        self.assertEqual(account.email, 'testaccount@email.com')
        self.assertTrue(account.email_verified)

    def test_signup_without_token(self):
        response = self.client.post('/signup')  # no headers
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Unauthorized', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_signup_with_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception("Invalid token")
        headers = {
            'Authorization': 'Bearer invalid_token'
        }
        response = self.client.post('/signup', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid or expired token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_signup_with_unverified_email(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'unverified_uid',
            'email': 'notverified@example.com',
            'email_verified': False
        }
        headers = {
            'Authorization': 'Bearer some_token'
        }
        response = self.client.post('/signup', headers=headers)
        self.assertEqual(response.status_code, 403) # 403 Email Not Verified
        self.assertIn(b'Email not verified', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_signup_existing_account(self, mock_firebase_token):
        # First create an account
        account = Account(
            firebase_uid='existing_uid',
            email='duplicate@example.com',
            email_verified=True,
            role='user',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.session.add(account)
        db.session.commit()
        # Mock the same Firebase user
        mock_firebase_token.return_value = {
            'uid': 'existing_uid',
            'email': 'duplicate@example.com',
            'email_verified': True
        }
        headers = {
            'Authorization': 'Bearer repeat_token'
        }
        response = self.client.post('/signup', headers=headers)
        self.assertEqual(response.status_code, 409) # 409 Account Already Exists
        self.assertIn(b'Account already exists', response.data)

    # Account Login - NEED TO UPDATE PAYLOADS
    @patch('firebase_admin.auth.verify_id_token')
    def test_account_login(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'valid_firebase_uid_123',
            'email': 'user@example.com',
            'email_verified': True
        }
        # Create an account that matches
        account = Account(
            firebase_uid='valid_firebase_uid_123',
            email='user@example.com',
            email_verified=True,
            role='user'
        )
        db.session.add(account)
        db.session.commit()
        headers = {
        'Authorization': 'Bearer valid_token'
        }
        response = self.client.post('/login', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successful Login
        self.assertIn(b'Login successful', response.data)

    def test_account_login_no_token(self):
        response = self.client.post('/login')  # no headers
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Unauthorized', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_account_login_invalid_token(self, mock_firebase_token):
        # Simulate Firebase throwing an error
        mock_firebase_token.side_effect = Exception("Invalid token")
        headers = {
            'Authorization': 'Bearer fake_invalid_token'
        }
        response = self.client.post('/login', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid or expired token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_account_login_no_account(self, mock_firebase_token):
        # Firebase returns a valid user
        mock_firebase_token.return_value = {
            'uid': 'nonexistent_uid',
            'email': 'ghost@example.com',
            'email_verified': True
        }
        headers = {
            'Authorization': 'Bearer valid_but_no_user'
        }
        response = self.client.post('/login', headers=headers)
        self.assertEqual(response.status_code, 404) # 404 Account Not Found
        self.assertIn(b'Account not found', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_account_login_email_not_verified(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'uid_unverified',
            'email': 'unverified@example.com',
            'email_verified': False
        }
        # Add the account to the DB
        account = Account(
            firebase_uid='uid_unverified',
            email='unverified@example.com',
            email_verified=False,
            role='user'
        )
        db.session.add(account)
        db.session.commit()
        headers = {
            'Authorization': 'Bearer token_unverified'
        }
        response = self.client.post('/login', headers=headers)
        self.assertEqual(response.status_code, 403) # 403 Email Not Verified
        self.assertIn(b'Email not verified', response.data)

    # Get Account by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_get_account_success(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'uid': 'test_uid_123',
            'email': 'user@example.com',
            'email_verified': True
        }
        # Create account with that UID
        account = Account(
            firebase_uid='test_uid_123',
            email='user@example.com',
            email_verified=True,
            role='user'
        )
        db.session.add(account)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get(f'/account/{account.account_id}', headers=headers)
        self.assertEqual(response.status_code, 200) # Success
        self.assertIn(b'user@example.com', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_account_not_found(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'irrelevant_uid',
            'email': 'ghost@example.com',
            'email_verified': True
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get('/account/99999', headers=headers)  # nonexistent ID
        self.assertEqual(response.status_code, 404) # 404 Account Not Found
        self.assertIn(b'Account not found', response.data)

    def test_get_account_unauthorized_no_token(self):
        response = self.client.get('/account/1')  # No auth header
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Unauthorized', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_account_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception("Invalid token")
        headers = {'Authorization': 'Bearer fake_token'}
        response = self.client.get('/account/1', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid or expired token', response.data)

    # Delete Account by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_own_account_success(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'delete_me_uid',
            'email': 'deleteme@example.com',
            'email_verified': True
        }
        account = Account(firebase_uid='delete_me_uid', email='deleteme@example.com', email_verified=True, role='user')
        db.session.add(account)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete(f'/account/{account.id}', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Deleted Account
        self.assertIn(b'Account deleted', response.data)
        # Confirm deletion
        self.assertIsNone(Account.query.get(account.id))

    def test_delete_account_unauthorized(self):
        response = self.client.delete('/account/1')  # No auth header
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Unauthorized', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_account_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception("Invalid token")
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.delete('/account/1', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid or expired token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_account_not_found(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'any_uid',
            'email': 'user@example.com',
            'email_verified': True
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete('/account/99999', headers=headers)
        self.assertEqual(response.status_code, 404) # 404 Account Not Found
        self.assertIn(b'Account not found', response.data)


    # RBAC Tests
    @patch('firebase_admin.auth.verify_id_token')
    def test_admin_access_as_user(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'user_uid',
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
        response = self.client.get('/admin/dashboard', headers=headers)
        self.assertEqual(response.status_code, 403) # 403 Email Not Verified
        self.assertIn(b'insufficient role', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_other_user_forbidden(self, mock_firebase_token):
        # Authenticated user (not admin)
        mock_firebase_token.return_value = {
            'uid': 'uid_user1',
            'email': 'user1@example.com',
            'email_verified': True
        }
        user1 = Account(firebase_uid='uid_user1', email='user1@example.com', email_verified=True, role='user')
        user2 = Account(firebase_uid='uid_user2', email='user2@example.com', email_verified=True, role='user')
        db.session.add_all([user1, user2])
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete(f'/account/{user2.id}', headers=headers)
        self.assertEqual(response.status_code, 403) # 403 Forbidden, unable to access
        self.assertIn(b'Forbidden', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_admin_can_delete_any_account(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'admin_uid',
            'email': 'admin@example.com',
            'email_verified': True
        }
        admin = Account(firebase_uid='admin_uid', email='admin@example.com', email_verified=True, role='admin')
        user = Account(firebase_uid='user_uid', email='user@example.com', email_verified=True, role='user')
        db.session.add_all([admin, user])
        db.session.commit()
        headers = {'Authorization': 'Bearer admin_token'}
        response = self.client.delete(f'/account/{user.id}', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Succesfully Deleted Account by Admin
        self.assertIn(b'Account deleted', response.data)
