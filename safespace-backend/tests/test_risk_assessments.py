# import unittest
# from unittest.mock import patch
# from app import create_app, db
# from app.models import InvestmentRiskAssessment, User, Account
# from app.blueprints.risk_assessments.schemas import risk_assessment_schema

# class TestRiskAssessments(unittest.TestCase):
#     def setUp(self):
#         self.app = create_app("TestingConfig")
#         self.app_context = self.app.app_context()
#         self.app_context.push()
#         db.create_all()
#         self.client = self.app.test_client()

#         # Create a test user and account
#         self.account = Account(email="testuser@example.com", firebase_uid="test_uid", role="user")
#         self.user = User(account=self.account, first_name="Test", last_name="User", phone_number="1234567890")
#         db.session.add(self.account)
#         db.session.add(self.user)
#         db.session.commit()

#     def tearDown(self):
#         # Clean up the database after each test
#         db.session.remove()
#         db.drop_all()
#         self.app_context.pop()

#     @patch("firebase_admin.auth.verify_id_token")
#     def test_create_risk_assessment(self, mock_verify_id_token):
#         # Mock Firebase token verification
#         mock_verify_id_token.return_value = {"user_id": "test_uid"}

#         # Define the payload for the POST request
#         payload = {
#             "risk_score": 85.5,
#             "risk_level": "High",
#             "comments": "Test risk assessment"
#         }

#         # Send a POST request to create a risk assessment
#         headers = {
#             "Authorization": "Bearer fake_token",
#             "Content-Type": "application/json"
#         }
#         response = self.client.post("/users/risk-assessments", headers=headers, json=payload)

#         # Assert the response
#         self.assertEqual(response.status_code, 201)
#         self.assertIn(b"risk_score", response.data)

#         # Verify the risk assessment was created in the database
#         risk_assessment = InvestmentRiskAssessment.query.first()
#         self.assertIsNotNone(risk_assessment)
#         self.assertEqual(risk_assessment.risk_score, 85.5)
#         self.assertEqual(risk_assessment.risk_level, "High")

#     @patch("firebase_admin.auth.verify_id_token")
#     def test_get_risk_assessments(self, mock_verify_id_token):
#         # Mock Firebase token verification
#         mock_verify_id_token.return_value = {"user_id": "test_uid"}

#         # Add a test risk assessment to the database
#         risk_assessment = InvestmentRiskAssessment(
#             risk_score=85.5,
#             risk_level="High",
#             comments="Test risk assessment"
#         )
#         self.user.risk_assessments.append(risk_assessment)
#         db.session.commit()

#         # Send a GET request to retrieve risk assessments
#         headers = {
#             "Authorization": "Bearer fake_token"
#         }
#         response = self.client.get("/users/risk-assessments", headers=headers)

#         # Assert the response
#         self.assertEqual(response.status_code, 200)
#         self.assertIn(b"risk_score", response.data)
#         self.assertIn(b"85.5", response.data)

#     @patch("firebase_admin.auth.verify_id_token")
#     def test_delete_risk_assessment(self, mock_verify_id_token):
#         # Mock Firebase token verification
#         mock_verify_id_token.return_value = {"user_id": "test_uid"}

#         # Add a test risk assessment to the database
#         risk_assessment = InvestmentRiskAssessment(
#             risk_score=85.5,
#             risk_level="High",
#             comments="Test risk assessment"
#         )
#         self.user.risk_assessments.append(risk_assessment)
#         db.session.commit()

#         # Send a DELETE request to delete the risk assessment
#         json = {
#             "id": risk_assessment.id
#         }
#         headers = {
#             "Authorization": "Bearer valid_token"
#         }
#         response = self.client.delete(f"/users/risk-assessments", headers=headers, json=json)

#         # Assert the response
#         self.assertEqual(response.status_code, 200)
#         self.assertIn(b"Risk assessment deleted", response.data)

#         # Verify the risk assessment was deleted from the database
#         deleted_risk_assessment = InvestmentRiskAssessment.query.get(risk_assessment.id)
#         self.assertIsNone(deleted_risk_assessment)

# if __name__ == "__main__":
#     unittest.main()