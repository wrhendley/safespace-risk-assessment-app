import streamlit as st
from components.investment_simulator import portfolio_simulator
from components.loan_risk_assessment import loan_risk_assessment

# Authenticate user
token = st.query_params.get("token", [None])

if token:
    st.session_state["idToken"] = token
else:
    st.error("🔒 You must be signed in to use the simulator.")
    st.stop()
    
# Tabs for navigation
tabs = st.tabs(["🏠 Welcome", "📊 Investment Simulator", "🤲 Loan Risk Assessment"])

# --- Welcome Tab ---
with tabs[0]:
    st.title("🏠 Welcome to SafeSpace")
    st.markdown("""
    Welcome to the SafeSpace Financial Risk Dashboard!  
    Use the tabs to explore:
    - 📊 Investment Simulator: A quick and easy way to make a stock portfolio and assess the risk.
    - 🤲 Loan Risk Assessment: A loan calculator to determine your loan risk.
    """)
    st.write(token)

# --- Investment Simulator Tab ---
with tabs[1]:
    portfolio_simulator(token)

# # --- Loan Risk Assessment Tab ---
with tabs[2]:
    loan_risk_assessment(token)
