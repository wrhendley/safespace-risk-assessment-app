from app.models import db, Account
from app import create_app
import unittest
from datetime import datetime
# from app.utils.util import encode_token

# Notes, to be removed when no longer needed:
# need token creation and decoding funcions started to use function names

# Account Test Cases
class TestAccount(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        today = datetime
        self.account = Account(email="accountemail@test.com", firebase_uid="", email_verified="true", role='admin', created_at=today, updated_at=today) # attributes can be adjusted, placed all for time being
        with self.app.app_context():
            db.drop_all()
            db.create_all()
            db.session.add(self.customer)
            db.session.commit()
        self.token = encode_token(1) # need to update this according to the util file
        self.client = self.app.test_client()

    # Sign Up/Create New Account
    def test_account_signup(self):
        signup_payload = {
            # need to update payload
        }
        response = self.client.post('/signup', json=signup_payload)
        self.assertEqual(response.status_code, 201)

    def test_invalid_signup(self):
        signup_payload = {
            # need to update payload
        }
        response = self.client.post('/signup', json=signup_payload)
        self.assertEqual(response.status_code, 400)

    # Account Login - NEED TO UPDATE PAYLOADS
    def test_account_login(self):
        login_payload = {
            "email": "accountemail@test.com"
        }
        response = self.client.post('/login', json=login_payload)
        self.assertEqual(response.status_code, 200)

    def test_invalid_login(self):
        login_payload = {
            "email": "wrongemail@test.com"
        }
        response = self.client.post('/login', json=login_payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json['message'], 'invalid email or password')

    # Get Account by ID, auth required
    def test_get_account(self):
        headers = {'Authorization': "Bearer " + self.token}
        response = self.client.get('/accounts/1', headers=headers)
        self.assertEqual(response.status_code, 200)

    def test_get_account_fail(self):
        headers = {'Authorization': "Bearer " + self.test_account_login()}
        response = self.client.get('/accounts/122', headers=headers)
        self.assertEqual(response.status_code, 400)

    # Delete Account by ID, auth required
    def test_delete_account(self):
        headers = {'Authorization': "Bearer " + self.test_account_login()}
        response = self.client.delete('/accounts/1', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn('succesfully deleted account', response.get_data(as_text=True))

    def test_invalid_delete(self):
        response = self.client.delete('/accounts/999')
        self.assertIn(response.status_code, [400, 401])