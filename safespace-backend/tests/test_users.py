from app.models import db, User, Account
from app import create_app
import unittest
from unittest.mock import patch
from datetime import datetime

# User Test Cases
class TestUser(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()

        # Create a test user and account
        self.account = Account(email="testuser@example.com", firebase_uid="test_uid", role="user")
        db.session.add(self.account)
        db.session.commit()

        self.user = User(account_id=self.account.id, first_name="Test", last_name="User", phone_number="1234567890")
        db.session.add(self.user)
        db.session.commit()

    def tearDown(self):
        # Clean up the database after each test
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # Create New User
    @patch('firebase_admin.auth.verify_id_token')
    def test_create_user_success(self, mock_firebase_token):
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
            role='user'
        )
        db.session.add(account)
        db.session.commit()
        payload = {
            'phone_number': '0987654321',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.post('/users/', json=payload, headers=headers)
        self.assertEqual(response.status_code, 201) # 201 User Created Successfully
        user = User.query.filter_by(account_id=account.id).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'John')

    def test_create_user_missing_token(self):
        payload = {
            'phone_number': '1234567890',
            'first_name': 'Jane',
            'last_name': 'Doe'
        }
        response = self.client.post('/users/', json=payload)
        self.assertEqual(response.status_code, 401) # 401 Missing token
        self.assertIn(b'Missing token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_create_user_invalid_token(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.side_effect = Exception("Invalid token")
        payload = {
            'phone_number': '0000000000',
            'first_name': 'Invalid',
            'last_name': 'Token'
        }
        # Providing the invalid token
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.post('/users/', json=payload, headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Invalid token
        self.assertIn(b'Invalid token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_create_user_unauthenticated(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'uid': 'uid_unauthorized',
            'email': 'intruder@example.com',
            'role': 'user'
        }
        # Create account with different UID
        account = Account(
            email='real@example.com',
            firebase_uid='legit_uid',
            role='user'
        )
        db.session.add(account)
        db.session.commit()
        payload = {
            'phone_number': '9999999999',
            'first_name': 'Unauth',
            'last_name': 'User'
        }
        headers = {'Authorization': 'Bearer token'}
        response = self.client.post('/users/', json=payload, headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthenticated
        self.assertIn(b'Authentication error', response.data)

    # Get User by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_success(self, mock_firebase_token):
        # Mock firebase token
        mock_firebase_token.return_value = {
            'user_id': 'test_uid',
            'email': 'testuser@example.com',
            'role': 'user'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get(f'/users/{self.user.id}', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Retrieved User Profile Data
        self.assertIn(b'Test', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_not_found(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'user_id': 'test_uid',
            'email': 'testuser@example.com',
            'role': 'user'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get('/users/999', headers=headers)
        self.assertEqual(response.status_code, 404) # 404 User Not Found
        self.assertIn(b'user not found', response.data)

    def test_get_user_by_id_missing_token(self):
        response = self.client.get('/users/1')
        self.assertEqual(response.status_code, 401) # 401 Missing Token
        self.assertIn(b'Missing token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception('Invalid token')
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.get('/users/1', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Invalid Token
        self.assertIn(b'Invalid token', response.data)

    # # Update User by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_update_user_success(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'user_id': 'test_uid',
            'email': 'testuser@example.com',
            'role': 'user'
        }
        update_payload = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone_number': '5642310987'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.put(f'/users/{self.user.id}', json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Updated User
        updated_user = User.query.get(self.user.id)
        self.assertEqual(updated_user.first_name, 'Updated')
        self.assertEqual(updated_user.last_name, 'Name')
        self.assertEqual(updated_user.phone_number, '5642310987')

    @patch('firebase_admin.auth.verify_id_token')
    def test_update_user_not_found(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'user_id': 'test_uid',
            'email': 'testuser@example.com',
            'role': 'user'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        payload = {'first_name': 'Ghost'}
        response = self.client.put('/users/99', json=payload, headers=headers)
        self.assertEqual(response.status_code, 404) # 404 User Not Found
        self.assertIn(b'user not found', response.data)

    def test_update_user_missing_token(self):
        payload = {'first_name': 'NoToken'}
        response = self.client.put('/users/1', json=payload)
        self.assertEqual(response.status_code, 401) # 401 Missing Token
        self.assertIn(b'Missing token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_update_user_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception('Invalid token')
        headers = {'Authorization': 'Bearer invalid_token'}
        payload = {'first_name': 'InvalidToken'}
        response = self.client.put('/users/1', json=payload, headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Invalid Token
        self.assertIn(b'Invalid token', response.data)

    # # Delete User by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_own_user_success(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'user_id': 'test_uid',
            'email': 'testuser@example.com',
            'role': 'user'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete(f'/users/{self.user.id}', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Deleted User
        self.assertIn(b'succesfully deleted user', response.data)
        self.assertIsNone(User.query.get(self.user.id))

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_other_user_forbidden(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'uid': 'uid_unauthorized',
            'email': 'intruder@example.com',
            'role': 'user'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete(f'/users/{self.user.id}', headers=headers)
        self.assertEqual(response.status_code, 401)
        self.assertIn(b'Authentication error', response.data)

    def test_delete_user_missing_token(self):
        response = self.client.delete('/users/1')
        self.assertEqual(response.status_code, 401) # 401 Missing Token
        self.assertIn(b'Missing token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_user_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception('Invalid token')
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.delete('/users/1', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Invalid Token
        self.assertIn(b'Invalid token', response.data)