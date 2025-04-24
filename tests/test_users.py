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
        self.app_context.push()  # Keeps the context active during the whole test
        self.client = self.app.test_client()

        db.drop_all()
        db.create_all()

    def tearDown(self):
        self.app_context.pop() # clean up after each test

    # Create New User
    @patch('firebase_admin.auth.verify_id_token')
    def test_create_user_success(self, mock_firebase_token):
        mock_firebase_token.return_value = {
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
            'phone_number': '1234567890',
            'first_name': 'John',
            'last_name': 'Doe',
            'created_at': datetime.now(),
            'updated_at': datetime.now()
            
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.post('/users', json=payload, headers=headers)
        self.assertEqual(response.status_code, 201) # 201 User Created Successfully
        self.assertIn(b'User created', response.data)
        user = User.query.filter_by(account_id=account.id).first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'John')

    def test_create_user_unauthorized(self):
        payload = {
            'account_id': 1,
            'phone_number': '1234567890',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        response = self.client.post('/users', json=payload)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Unauthorized', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_create_user_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception("Invalid token")
        payload = {
            'account_id': 1,
            'phone_number': '0000000000',
            'first_name': 'Invalid',
            'last_name': 'Token',
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.post('/users', json=payload, headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid or expired token', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_create_user_account_not_found(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'no_uid',
            'email': 'none@example.com',
            'email_verified': True
        }
        payload = {
            'account_id': 9999,  # non-existent
            'phone_number': '0001112222',
            'first_name': 'Nonexist',
            'last_name': 'User',
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.post('/users', json=payload, headers=headers)
        self.assertEqual(response.status_code, 404) # 404 User Not Found
        self.assertIn(b'Account does not exist', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_create_user_forbidden(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'uid_unauthorized',
            'email': 'intruder@example.com',
            'email_verified': True
        }
        # Account belongs to someone else
        account = Account(firebase_uid='legit_uid', email='real@example.com', email_verified=True)
        db.session.add(account)
        db.session.commit()
        payload = {
            'account_id': account.id,
            'phone_number': '9999999999',
            'first_name': 'Unauth',
            'last_name': 'User',
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        headers = {'Authorization': 'Bearer token'}
        response = self.client.post('/users', json=payload, headers=headers)
        self.assertEqual(response.status_code, 403) # 403 Forbidden, Unauthorized Access
        self.assertIn(b'Forbidden', response.data)

    # Get User by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_success(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'user_uid_1',
            'email': 'user@example.com',
            'email_verified': True
        }
        # Create Account and User within this test
        account = Account(firebase_uid='user_uid_1', email='user@example.com', email_verified=True)
        db.session.add(account)
        db.session.commit()
        user = User(account_id=account.account_id, first_name='Alice', last_name='Admin')
        db.session.add(user)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get(f'/users/{user.user_id}', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Retrieved User Profile Data
        self.assertIn(b'Alice', response.data)
        self.assertIn(b'Admin', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_not_found(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'user_uid_1',
            'email': 'user@example.com',
            'email_verified': True
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.get('/users/nonexistent_id', headers=headers)
        self.assertEqual(response.status_code, 404) # 404 User Not Found
        self.assertIn(b'User not found', response.data)

    def test_get_user_by_id_missing_token(self):
        response = self.client.get('/users/some_id')
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Unauthorized', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_get_user_by_id_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception('Invalid token')
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.get('/users/some_id', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid token', response.data)

    # Update User by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_update_user_success(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'user_uid_1',
            'email': 'user@example.com',
            'email_verified': True
        }
        account = Account(firebase_uid='user_uid_1', email='user@example.com', email_verified=True)
        db.session.add(account)
        db.session.commit()
        user = User(account_id=account.account_id, first_name='Alice', last_name='Admin', phone_number='1234567890')
        db.session.add(user)
        db.session.commit()
        update_payload = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone_number': '0987654321'
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.put(f'/users/{user.user_id}', json=update_payload, headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Updated User
        self.assertIn(b'User updated successfully', response.data)
        updated_user = User.query.get(user.user_id)
        self.assertEqual(updated_user.first_name, 'Updated')
        self.assertEqual(updated_user.last_name, 'Name')
        self.assertEqual(updated_user.phone_number, '0987654321')

    @patch('firebase_admin.auth.verify_id_token')
    def test_update_user_not_found(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'user_uid_1',
            'email': 'user@example.com',
            'email_verified': True
        }
        headers = {'Authorization': 'Bearer valid_token'}
        payload = {'first_name': 'Ghost'}
        response = self.client.put('/users/nonexistent_id', json=payload, headers=headers)
        self.assertEqual(response.status_code, 404) # 404 User Not Found
        self.assertIn(b'User not found', response.data)

    def test_update_user_missing_token(self):
        payload = {'first_name': 'NoToken'}
        response = self.client.put('/users/some_id', json=payload)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Unauthorized', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_update_user_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception('Invalid token')
        headers = {'Authorization': 'Bearer invalid_token'}
        payload = {'first_name': 'InvalidToken'}
        response = self.client.put('/users/some_id', json=payload, headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid token', response.data)

    # Delete User by ID, auth required
    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_own_user_success(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'user_uid_1',
            'email': 'user@example.com',
            'email_verified': True
        }
        account = Account(firebase_uid='user_uid_1', email='user@example.com', email_verified=True)
        db.session.add(account)
        db.session.commit()
        user = User(account_id=account.account_id, first_name='Alice')
        db.session.add(user)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete(f'/users/{user.user_id}', headers=headers)
        self.assertEqual(response.status_code, 200) # 200 Successfully Deleted User
        self.assertIn(b'User deleted successfully', response.data)
        self.assertIsNone(User.query.get(user.user_id))

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_other_user_forbidden(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'intruder_uid',
            'email': 'intruder@example.com',
            'email_verified': True
        }
        owner_account = Account(firebase_uid='owner_uid', email='owner@example.com', email_verified=True)
        db.session.add(owner_account)
        db.session.commit()
        user = User(account_id=owner_account.account_id, first_name='Owner')
        db.session.add(user)
        db.session.commit()
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete(f'/users/{user.user_id}', headers=headers)
        self.assertEqual(response.status_code, 403) # 403 Forbidden, Aunauthorized Access
        self.assertIn(b'Forbidden', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_user_not_found(self, mock_firebase_token):
        mock_firebase_token.return_value = {
            'uid': 'user_uid_1',
            'email': 'user@example.com',
            'email_verified': True
        }
        headers = {'Authorization': 'Bearer valid_token'}
        response = self.client.delete('/users/nonexistent_id', headers=headers)
        self.assertEqual(response.status_code, 404) # 404 User Not Found
        self.assertIn(b'User not found', response.data)

    def test_delete_user_missing_token(self):
        response = self.client.delete('/users/some_id')
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Unauthorized', response.data)

    @patch('firebase_admin.auth.verify_id_token')
    def test_delete_user_invalid_token(self, mock_firebase_token):
        mock_firebase_token.side_effect = Exception('Invalid token')
        headers = {'Authorization': 'Bearer invalid_token'}
        response = self.client.delete('/users/some_id', headers=headers)
        self.assertEqual(response.status_code, 401) # 401 Unauthorized, Invalid or Expired Token
        self.assertIn(b'Invalid token', response.data)

    # RBAC Logic Tests
    # @patch('firebase_admin.auth.verify_id_token')
    # def test_admin_create_user_for_any_account(self, mock_firebase_token):
    #     mock_firebase_token.return_value = {
    #         'uid': 'admin_uid',
    #         'email': 'admin@example.com',
    #         'email_verified': True
    #     }
    #     admin = Account(firebase_uid='admin_uid', email='admin@example.com', email_verified=True, role='admin')
    #     user_account = Account(firebase_uid='user_uid', email='user@example.com', email_verified=True, role='user')
    #     db.session.add_all([admin, user_account])
    #     db.session.commit()
    #     payload = {
    #         'account_id': user_account.id,
    #         'first_name': 'AdminCreated',
    #         'last_name': 'User',
    #         'phone_number': '7777777777'
    #     }
    #     headers = {'Authorization': 'Bearer admin_token'}
    #     response = self.client.post('/users', json=payload, headers=headers)
    #     self.assertEqual(response.status_code, 201)
    #     self.assertIn(b'User created', response.data)
