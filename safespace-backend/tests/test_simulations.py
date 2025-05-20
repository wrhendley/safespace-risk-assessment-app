from app.models import db, User, Account, InvestmentRiskAssessment, Asset
from app import create_app
import unittest
from unittest.mock import patch
from datetime import datetime


class TestSimulations(unittest.TestCase):
    def setUp(self):
        self.app = create_app('TestingConfig')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()
        
        self.account = Account(email="testuser@example.com", firebase_uid="test_uid", role="user")
        db.session.add(self.account)
        db.session.flush()
        
        self.user = User(account_id=self.account.id, first_name="Test", last_name="User", phone_number="1234567890")
        db.session.add(self.user)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    @patch('app.utils.util.auth.verify_id_token')
    def test_create_investment_simulation(self, mock_verify_id_token):
        mock_verify_id_token.return_value = {"user_id": "test_uid"}
        
        with self.client:
            data = {
                    "risk_score": 2,
                    "risk_level": "Low Risk",
                    "start_date": "2023-01-01",
                    "end_date": "2023-12-31",
                    "return_percent": 0.05,
                    "initial_investment": 1000,
                    "final_value": 1050,
                    "portfolio_volatility": 0.02,
                    "portfolio_sharpe_ratio": 1.5,
                    "ticker_data": [
                        {
                            "ticker": "AAPL",
                            "allocation": 100,
                            "start_price": 150,
                            "end_price": 160,
                            "initial_investment": 500,
                            "final_value": 533.33,
                            "return_percent": 0.055,
                            "volatility": 0.02,
                            "sharpe_ratio": 1.5,
                            "max_drawdown": 0.1,
                        }
                    ]
                }
            headers = {
                'Authorization': 'Bearer test_token',
                'Content-Type': 'application/json'
            }
            response = self.client.post('/simulations/investments', json=data, headers=headers)
            self.assertEqual(response.status_code, 201)
            assessment = InvestmentRiskAssessment.query.first()
            self.assertIsNotNone(assessment)
            self.assertEqual(assessment.risk_score, 2)

    @patch('app.utils.util.auth.verify_id_token')
    def test_create_investment_simulation_invalid_data(self, mock_verify_id_token):
        mock_verify_id_token.return_value = {"user_id": "test_uid"}
        
        with self.client:
            data = {
                    "risk_score": 1,
                    "risk_level": 2,
                    "start_date": "2023-01-01",
                    "end_date": "2023-12-31",
                    "return_percent": 0.05,
                    "initial_investment": 1000,
                    "final_value": 1050,
                    "portfolio_volatility": 0.02,
                    "portfolio_sharpe_ratio": 1.5,
                    "ticker_data": [
                        {
                            "ticker": "AAPL",
                            "allocation": 100,
                            "start_price": 150,
                            "end_price": 160,
                            "initial_investment": 500,
                            "final_value": 533.33,
                            "return_percent": 0.055,
                            "volatility": 0.02,
                            "sharpe_ratio": 1.5,
                            "max_drawdown": 0.1,
                        }
                    ]
                }
            headers = {
                'Authorization': 'Bearer test_token',
                'Content-Type': 'application/json'
            }
            response = self.client.post('/simulations/investments', json=data, headers=headers)
            self.assertEqual(response.status_code, 400)

    @patch('app.utils.util.auth.verify_id_token')
    def test_get_investment_simulation(self, mock_verify_id_token):
        mock_verify_id_token.return_value = {"user_id": "test_uid"}
        
        with self.client:
            data = {
                    "risk_score": 2,
                    "risk_level": "Low Risk",
                    "start_date": "2023-01-01",
                    "end_date": "2023-12-31",
                    "return_percent": 0.05,
                    "initial_investment": 1000,
                    "final_value": 1050,
                    "portfolio_volatility": 0.02,
                    "portfolio_sharpe_ratio": 1.5,
                    "ticker_data": [
                        {
                            "ticker": "AAPL",
                            "allocation": 100,
                            "start_price": 150,
                            "end_price": 160,
                            "initial_investment": 500,
                            "final_value": 533.33,
                            "return_percent": 0.055,
                            "volatility": 0.02,
                            "sharpe_ratio": 1.5,
                            "max_drawdown": 0.1,
                        }
                    ]
                }
            headers = {
                'Authorization': 'Bearer test_token',
                'Content-Type': 'application/json'
            }
            response = self.client.post('/simulations/investments', json=data, headers=headers)
            self.assertEqual(response.status_code, 201)
            
            assessment = InvestmentRiskAssessment.query.first()
            response = self.client.get('/simulations/investments', headers=headers)
            self.assertEqual(response.status_code, 200)
            self.assertIn('risk_score', response.json[0])

    @patch('app.utils.util.auth.verify_id_token')
    def test_get_investment_simulation_not_found(self, mock_verify_id_token):
        mock_verify_id_token.return_value = {"user_id": "test_uid"}
        
        with self.client:
            response = self.client.get('/simulations/investments', headers={'Authorization': 'Bearer test_token'})
            self.assertEqual(response.status_code, 404)
            self.assertIn('No investment simulations found', response.json.get('message'))
