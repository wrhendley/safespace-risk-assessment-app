from app.models import db, User, Account
from app import create_app
import unittest
from unittest.mock import patch
from datetime import datetime

 # Admin Routes (RBAC)
class TestAdmin(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()

        # Create a test admin user and account
        self.account = Account(email="testadmin@example.com", firebase_uid="test_uid", role="admin")
        db.session.add(self.account)
        db.session.commit()

        self.admin = User(account_id=self.account.id, first_name="Test", last_name="Admin", phone_number="1234567890")
        db.session.add(self.admin)
        db.session.commit()

    def tearDown(self):
        # Clean up the database after each test
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    # Create New Admin
    @patch('firebase_admin.auth.verify_id_token')
    def test_create_admin_success(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'email': 'admin@example.com',
            'user_id': 'test_uid_123',
            'role': 'admin'
        }
        # Create account with that UID
        account = Account(
            email='admin@example.com',
            firebase_uid='test_uid_123',
            role='admin'
        )
        db.session.add(account)
        db.session.commit()
        payload = {
            'phone_number': '9999999999',
            'first_name': 'Admin',
            'last_name': 'General'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.post('/admin/users/', json=payload, headers=headers)
        self.assertEqual(response.status_code, 201) # 201 Admin User Created Successfully
        user = User.query.filter_by(account_id=account.id).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'Admin')

    def test_create_admin_missing_token(self):
        payload = {
            'phone_number': '8888888888',
            'first_name': 'Conan',
            'last_name': 'Admin'
        }
        response = self.client.post('/admin/users/', json=payload)
        self.assertEqual(response.status_code, 401) # 401 Missing token
        self.assertIn(b'Missing token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_create_admin_invalid_token(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.side_effect = Exception("Invalid token")
        payload = {
            'phone_number': '0000000000',
            'first_name': 'Invalid',
            'last_name': 'Token'
        }
        # Providing the invalid token
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.post('/admin/users/', json=payload, headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Invalid token
        self.assertIn(b'Invalid token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_create_admin_unauthenticated(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'uid': 'uid_unauthorized',
            'email': 'intruder@example.com',
            'role': 'admin'
        }
        # Create account with different UID
        account = Account(
            email='real@example.com',
            firebase_uid='legit_uid',
            role='admin'
        )
        db.session.add(account)
        db.session.commit()
        payload = {
            'phone_number': '7777777777',
            'first_name': 'Unauth',
            'last_name': 'Admin'
        }
        headers = {'Authorization': 'Bearer token'}
        response = self.client.post('/admin/users/', json=payload, headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthenticated
        self.assertIn(b'Authentication error', response.data)

    # Get All Users
    # @patch('firebase_admin.auth.verify_id_token')
    # def test_get_users(self, mock_firebase_token):
    #     # Mock Firebase token
    #     mock_firebase_token.return_value = {
    #         'user_id': 'test_uid',
    #         'email': 'testuser@example.com',
    #         'role': 'admin'
    #     }
    #     headers = {'Authorization': 'Bearer token'}
    #     response = self.client.get('/admin/users/', headers=headers)
    #     print(response)
    #     self.assertEqual(response.status_code, 200)

    # Get User by ID
    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_success(self, mock_firebase_token):
        # Mock firebase token
        mock_firebase_token.return_value = {
            'user_id': 'test_uid',
            'email': 'testuser@example.com',
            'role': 'admin'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get(f'/users/{self.admin.id}', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Retrieved User Profile Data
        self.assertIn(b'Test', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_not_found(self, mock_firebase_token):
        # Mock Firebase token
        mock_firebase_token.return_value = {
            'user_id': 'test_uid',
            'email': 'testuser@example.com',
            'role': 'admin'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get('/users/999', headers=headers)
        self.assertEqual(response.status_code, 404) # 404 User Not Found
        self.assertIn(b'user not found', response.data)

    def test_get_user_by_id_missing_token(self):
        response = self.client.get(f'/users/{self.admin.id}')
        self.assertEqual(response.status_code, 401) # 401 Missing Token
        self.assertIn(b'Missing token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception('Invalid token')
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.get(f'/users/{self.admin.id}', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Invalid Token
        self.assertIn(b'Invalid token', response.data)

    # Update User by ID
    