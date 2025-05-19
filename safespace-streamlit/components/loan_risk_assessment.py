import streamlit as st
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import requests

def loan_risk_assessment(token):
    st.title("🤲 Loan Risk Assessment")
    loan_amount = st.number_input("Loan Amount (USD)", min_value=1000, value=5000, step=500)
    loan_term = st.slider("Loan Term (Years)", 1, 30, 10)
    interest_rate = st.slider("Interest Rate (%)", 0.0, 15.0, 5.0)
    credit_score = st.slider("Credit Score", 300, 850, 700)
    annual_income = st.number_input("Annual Income (USD)", min_value=0, value=50000, step=1000)
    monthly_debt = st.number_input("Monthly Debt Payments (USD)", min_value=0, value=500, step=50)

    submit_button = st.button("Submit Loan Info")

    if submit_button:
        def predict_loan_risk(credit_score, debt_to_income_ratio):
            if credit_score < 580 or debt_to_income_ratio > 0.5:
                return "High Risk"
            elif 580 <= credit_score <= 700 or 0.3 <= debt_to_income_ratio <= 0.5:
                return "Medium Risk"
            else:
                return "Low Risk"

        debt_to_income_ratio = (monthly_debt * 12) / (annual_income + 1e-9)
        loan_risk = predict_loan_risk(credit_score, debt_to_income_ratio)
        
        # Convert risk level to score
        risk_score_map = {
            "Low Risk": 2,
            "Medium Risk": 5,
            "High Risk": 8
        }
        loan_risk_score = risk_score_map.get(loan_risk, 5)

        st.markdown("## :warning: Loan Risk Score")
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=loan_risk_score,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': f"Loan Risk Level: {loan_risk}", 'font': {'size': 24}},
            gauge={
                'axis': {'range': [0, 10]},
                'bar': {'color': "#a33f3f" if loan_risk_score > 6 else "#c97a41" if loan_risk_score > 3 else "#367c74"},
                'steps': [
                    {'range': [0, 3.5], 'color': "#367c74"},
                    {'range': [3.5, 6.5], 'color': "#c97a41"},
                    {'range': [6.5, 10], 'color': "#a33f3f"}
                ],
                'threshold': {
                    'line': {'color': "black", 'width': 4},
                    'thickness': 0.75,
                    'value': loan_risk_score
                }
            }
        ))
        st.plotly_chart(fig, use_container_width=True)

        st.write(f"Loan Amount: ${loan_amount:,.2f}")
        st.write(f"Loan Term: {loan_term} years @ {interest_rate:.2f}%")
        st.write(f"Debt-to-Income Ratio: {debt_to_income_ratio:.2f}")
        st.write(f"Credit Score: {credit_score}")
        st.session_state["loan_risk_assessment_data"] = {
            "loan_amount": loan_amount,
            "loan_term": loan_term,
            "interest_rate": interest_rate,
            "credit_score": credit_score,
            "annual_income": annual_income,
            "monthly_debt": monthly_debt,
            "debt_to_income_ratio": debt_to_income_ratio,
            "loan_risk": loan_risk
        }
    
    if "loan_risk_assessment_data" in st.session_state:
        if st.button("Save Loan Risk Assessment"):
            try:
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.post("http://localhost:5000/simulations/loans", json=st.session_state["loan_risk_assessment_data"], headers=headers)
                if response.status_code == 201:
                    st.success("Loan risk assessment saved successfully!")
                else:
                    st.error(f"Failed to save loan risk assessment: {response.text}")
            except Exception as e:
                st.error(f"An error occurred: {e}")