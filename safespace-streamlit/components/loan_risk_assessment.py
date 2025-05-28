import streamlit as st
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import requests

def loan_risk_assessment(token):
    st.title("🤲 Loan Risk Assessment")

    # User Inputs
    loan_amount = st.number_input("Loan Amount (USD)", min_value=1000, value=5000, step=500)
    interest_rate = st.slider("Interest Rate (%)", 0.0, 20.0, 5.0)
    loan_term = st.slider("Loan Term (Years)", 1, 30, 10)
    after_tax_income = st.number_input("Annual After-Tax Income (USD)", min_value=1000, value=50000, step=1000)
    income_sources = st.number_input("Number of Income Sources", min_value=1, value=1, step=1)
    monthly_debt = st.number_input("Monthly Debt Payments (USD)", min_value=0, value=500, step=50)
    credit_score = st.slider("Credit Score", 300, 850, 700)
    credit_card_limit = st.number_input("Total Credit Card Limit (USD)", min_value=0, value=10000, step=500)
    num_dependents = st.slider("Number of Dependents", 0, 10, 0)
    has_real_estate = st.selectbox("Real Estate Securing the Loan?", ["Yes", "No"])

    submit_button = st.button("Submit Loan Info")

    if submit_button:
        # Feature Engineering
        dti_ratio = (monthly_debt * 12) / after_tax_income
        lti_ratio = loan_amount / after_tax_income
        credit_utilization = (monthly_debt * 12) / (credit_card_limit + 1e-6)

        score = 0
        score_log = []

        # Credit Score
        if credit_score >= 750:
            score += 3
            score_log.append(("Credit Score (750+)", 3))
        elif credit_score >= 700:
            score += 2
            score_log.append(("Credit Score (700-749)", 2))
        elif credit_score >= 650:
            score += 1
            score_log.append(("Credit Score (650-699)", 1))
        else:
            score -= 2
            score_log.append(("Credit Score (<650)", -2))

        # Debt-to-Income Ratio
        if dti_ratio < 0.2:
            score += 2
            score_log.append(("Debt-to-Income Ratio (<0.20)", 2))
        elif dti_ratio < 0.35:
            score += 1
            score_log.append(("Debt-to-Income Ratio (0.20–0.35)", 1))
        elif dti_ratio > 0.5:
            score -= 2
            score_log.append(("Debt-to-Income Ratio (>0.50)", -2))
        else:
            score_log.append(("Debt-to-Income Ratio (0.35–0.50)", 0))

        # Loan-to-Income Ratio
        if lti_ratio < 0.2:
            score += 2
            score_log.append(("Loan-to-Income Ratio (<0.20)", 2))
        elif lti_ratio > 0.4:
            score -= 2
            score_log.append(("Loan-to-Income Ratio (>0.40)", -2))
        else:
            score_log.append(("Loan-to-Income Ratio (0.20–0.40)", 0))

        # Interest Rate
        if interest_rate > 10:
            score -= 1
            score_log.append(("Interest Rate (>10%)", -1))
        else:
            score_log.append(("Interest Rate (<=10%)", 0))

        # Loan Term
        if loan_term > 20:
            score -= 1
            score_log.append(("Loan Term (>20 years)", -1))
        else:
            score_log.append(("Loan Term (<=20 years)", 0))

        # Income Sources
        if income_sources >= 3:
            score += 2
            score_log.append(("3+ Income Sources", 2))
        elif income_sources == 2:
            score += 1
            score_log.append(("2 Income Sources", 1))
        elif income_sources == 1:
            score_log.append(("1 Income Source", 0))
        else:
            score -= 1
            score_log.append(("No Income Source", -1))

        # Credit Utilization
        if credit_utilization > 0.5:
            score -= 2
            score_log.append(("Credit Utilization (>50%)", -2))
        elif credit_utilization > 0.3:
            score -= 1
            score_log.append(("Credit Utilization (30–50%)", -1))
        else:
            score += 1
            score_log.append(("Credit Utilization (<30%)", 1))

        # Dependents
        if num_dependents >= 4:
            score -= 2
            score_log.append(("4+ Dependents", -2))
        elif num_dependents >= 2:
            score -= 1
            score_log.append(("2–3 Dependents", -1))
        else:
            score_log.append(("0–1 Dependents", 0))

        # Real Estate
        if has_real_estate == "Yes":
            score += 2
            score_log.append(("Real Estate Collateral", 2))
        else:
            score -= 1
            score_log.append(("No Collateral", -1))

        # Risk Category
        if score >= 7:
            risk = "Low Risk"
            color = "🟢"
        elif score >= 3:
            risk = "Medium Risk"
            color = "🟡"
        else:
            risk = "High Risk"
            color = "🔴"

        # Output Summary
        st.subheader(f"🔮 Predicted Loan Risk: {color} **{risk}**")
        st.markdown("---")

        # Score Log Table
        st.subheader("📑 Score Contribution Breakdown")
        df_scores = pd.DataFrame(score_log, columns=["Factor", "Score Impact"])
        st.dataframe(df_scores, use_container_width=True)

        # Save data to session
        st.session_state["loan_risk_assessment_data"] = {
            "loan_amount": loan_amount,
            "loan_term": loan_term,
            "interest_rate": interest_rate,
            "credit_score": credit_score,
            "after_tax_income": after_tax_income,
            "monthly_debt": monthly_debt,
            "dti_ratio": dti_ratio,
            "lti_ratio": lti_ratio,
            "credit_utilization": credit_utilization,
            "loan_risk": risk,
            "num_dependents": num_dependents,
            "income_sources": income_sources,
            "credit_card_limit": credit_card_limit,
            "has_real_estate": has_real_estate
        }

    if "loan_risk_assessment_data" in st.session_state:
        if st.button("Save Loan Risk Assessment"):
            # apiURL = "http://localhost:5000/"
            apiURL = "https://ec2-3-133-140-182.us-east-2.compute.amazonaws.com"
            try:
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.post(
                    f"{apiURL}/simulations/loans",
                    json=st.session_state["loan_risk_assessment_data"],
                    headers=headers
                )
                if response.status_code == 201:
                    st.success("Loan risk assessment saved successfully!")
                else:
                    st.error(f"Failed to save loan risk assessment: {response.text}")
            except Exception as e:
                st.error(f"An error occurred: {e}")