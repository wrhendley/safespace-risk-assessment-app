import streamlit as st
from components.investment_simulator import portfolio_simulator
from components.loan_risk_assessment import loan_risk_assessment
import requests
# from components.investment_simulator import portfolio_simulator
# from components.loan_risk_assessment import loan_risk_assessment

# Authenticate user
token = st.query_params.get("token", [None])
name = st.query_params.get("name", [None])
# apiURL = "http://localhost:5000/"
apiURL = "https://ec2-3-133-140-182.us-east-2.compute.amazonaws.com"

if token:
    st.session_state["idToken"] = token
else:
    st.error("🔒 You must be signed in to use the simulator.")
    st.stop()
    
# Tabs for navigation
tabs = st.tabs(["🏠 Welcome", "📊 Investment Simulator", "🤲 Loan Risk Assessment"])

# --- Welcome Tab ---
with tabs[0]:
    st.title(f"{name}'s Dashboard")
    st.markdown("""
    Welcome to the SafeSpace Financial Risk Dashboard!  
    Use the tabs to explore:
    - 📊 Investment Simulator: A quick and easy way to make a stock portfolio and assess the risk.
    - 🤲 Loan Risk Assessment: A loan calculator to determine your loan risk.
    """)

    st.markdown("## 📂 Your Saved Risk Assessments")

    # Add buttons to fetch saved assessments
    if st.button("Load Investment Risk Assessments"):
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{apiURL}simulations/investments", headers=headers)
            if response.status_code == 200:
                investment_data = response.json()
                if investment_data:
                    st.subheader("💼 Investment Risk Assessments")
                    for idx, assessment in enumerate(investment_data, 1):
                        st.markdown(f"### Assessment #{idx}")
                        st.json(assessment)
                else:
                    st.info("No investment risk assessments found.")
            else:
                st.error(f"Failed to load investment assessments: {response.text}")
        except Exception as e:
            st.error(f"An error occurred: {e}")

    if st.button("Load Loan Risk Assessments"):
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{apiURL}simulations/loans", headers=headers)
            if response.status_code == 200:
                loan_data = response.json()
                if loan_data:
                    st.subheader("🏦 Loan Risk Assessments")
                    for idx, assessment in enumerate(loan_data, 1):
                        st.markdown(f"### Assessment #{idx}")
                        st.json(assessment)
                else:
                    st.info("No loan risk assessments found.")
            else:
                st.error(f"Failed to load loan assessments: {response.text}")
        except Exception as e:
            st.error(f"An error occurred: {e}")

# --- Investment Simulator Tab ---
with tabs[1]:
    portfolio_simulator(token)

# # --- Loan Risk Assessment Tab ---
with tabs[2]:
    loan_risk_assessment(token)
