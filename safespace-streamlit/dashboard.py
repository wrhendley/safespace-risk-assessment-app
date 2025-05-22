import streamlit as st
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import requests

token = st.query_params.get("token", [None])
name = st.query_params.get("name", [None])
# apiURL = "http://localhost:5000/"
apiURL = "https://ec2-3-133-140-182.us-east-2.compute.amazonaws.com"

if token:
    st.session_state["idToken"] = token
else:
    st.error("🔒 You must be signed in to use the simulator.")
    st.stop()

# Function to download data from Yahoo Finance for a given list of tickers
# @st.cache_data
def get_yahoo_data(tickers, start_date, end_date):
    try:
        data = yf.download(tickers, start=start_date, end=end_date)['Close']
        # Ensure it's always a DataFrame
        if isinstance(data, pd.Series):
            data = data.to_frame()
        return data

    except Exception as e:
        st.error(f"Error fetching data from Yahoo Finance: {e}")
        return None

@st.cache_data
def load_sp500_tickers():
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    table = pd.read_html(url)
    df = table[0]
    return sorted(df['Symbol'].tolist())

ticker_list = load_sp500_tickers()


# Retrieve idToken from the Frontend
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
    st.title(f"{name}'s Dashboard")
    st.write(name)
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
    def portfolio_simulator():
        st.title("📊 Investment Simulator")
        
        amount = st.number_input("💵 Total Investment Amount (USD)", value=10000)
        selected_tickers = st.multiselect("Select tickers", ticker_list)
        # ticker_input = st.text_input("Enter Tickers Symbols (comma-separated)", "AAPL, MSFT")
        # selected_tickers = [ticker.strip().upper() for ticker in ticker_input.split(",") if ticker.strip()]
        start_date = st.date_input("Select Start Date", min_value=pd.to_datetime('2010-01-01'))
        end_date = st.date_input("Select End Date", min_value=start_date, max_value=pd.to_datetime('today'))
        if not selected_tickers:
            st.error("Please enter at least one valid ticker symbol.")
            return

        allocations = {}
        for ticker in selected_tickers:
            allocations[ticker] = st.slider(f"{ticker} Allocation %", 0, 100, 100 // len(selected_tickers), key=f"alloc_{ticker}")

        total_alloc = sum(allocations.values())
        if total_alloc != 100:
            st.error("Allocations must total 100%.")
            return

        submit_button = st.button("Simulate Portfolio")
        if submit_button:
            data = get_yahoo_data(selected_tickers, start_date, end_date)
            if data is None:
                return

            portfolio_returns = []
            weighted_returns = []
            selected_ticker_details = []
            for ticker in selected_tickers:
                ticker_data = data[ticker]
                if ticker_data.empty:
                    st.error(f"Error: Select a valid timeframe.")
                    return

                returns = ticker_data.pct_change().dropna()
                initial_price = ticker_data.iloc[0]
                final_price = ticker_data.iloc[-1]
                percent_change = (final_price - initial_price) / initial_price
                investment = amount * allocations[ticker] / 100
                result_amount = investment * (1 + percent_change)
                std_dev = np.std(returns) if not returns.empty else 0
                sharpe_ratio = (returns.mean() / std_dev) * np.sqrt(252) if std_dev != 0 else 0
                max_drawdown = ((ticker_data.cummax() - ticker_data) / ticker_data.cummax()).max()
                weighted_returns.append(returns * (allocations[ticker] / 100))

                selected_ticker_details.append({
                    "ticker": ticker,
                    "allocation": allocations[ticker],
                    "start_price": initial_price,
                    "end_price": final_price,
                    "initial_investment": investment,
                    "final_value": result_amount,
                    "return_percent": percent_change * 100,
                    "volatility": std_dev,
                    "sharpe_ratio": sharpe_ratio,
                    "max_drawdown": max_drawdown
                })

                st.subheader(f"📈 {ticker} Summary")
                df_perf = pd.DataFrame({
                    "Performance Metrics": ["Start Price", "End Price", "Initial Investment", "Final Value", "Portfolio Return"],
                    "Values": [f"${initial_price:.2f}", f"${final_price:.2f}", f"${investment:,.2f}", f"${result_amount:,.2f}", f"{percent_change*100:.2f}%"]
                })
                st.dataframe(df_perf.to_dict(orient="records"), use_container_width=True)
                # st.dataframe(df_perf, use_container_width=True)
                st.line_chart(ticker_data)

                df_risk = pd.DataFrame({
                    "Risk Metrics": ["Volatility (Std Dev)", "Sharpe Ratio", "Max Drawdown"],
                    "Values": [f"{std_dev:.4f}", f"{sharpe_ratio:.2f}", f"{max_drawdown:.2%}"]
                })
                st.write("**⚠️ Risk Analysis**")
                st.dataframe(df_risk.to_dict(orient="records"), use_container_width=True)
                
                portfolio_returns.append(result_amount)

            if portfolio_returns:
                total_return = sum(portfolio_returns)
                combined_returns = pd.concat(weighted_returns, axis=1).sum(axis=1)
                portfolio_std = np.std(combined_returns)
                portfolio_mean = np.mean(combined_returns)
                portfolio_sharpe = portfolio_mean / portfolio_std * np.sqrt(252) if portfolio_std != 0 else 0

                st.markdown("---")
                st.header("💼 Portfolio Summary")
                total_percent_change = ((total_return - amount) / amount) * 100
                if total_percent_change >= 0:
                    st.success(f"🎉 Positive Return! Your investment grew by **{total_percent_change:.2f}%**!")
                else:
                    st.error(f"⚠️ Negative Return! Your investment shrunk by **{total_percent_change:.2f}%**.")

                st.write(f"**Initial Investment:** ${amount:,.2f}")
                st.write(f"**Final Value:** ${total_return:,.2f}")
                st.write(f"**Portfolio Volatility:** {portfolio_std:.4f}")
                st.write(f"**Portfolio Sharpe Ratio:** {portfolio_sharpe:.2f}")
                st.line_chart(combined_returns.cumsum())
                
                st.markdown("## :warning: Portfolio Risk Score")
                risk_scores = []

                for ticker in selected_tickers:
                    returns = data[ticker].pct_change().dropna()
                    std_dev = np.std(returns) if not returns.empty else 0
                    sharpe_ratio = (returns.mean() / std_dev) * np.sqrt(252) if std_dev != 0 else 0
                    max_drawdown = ((data[ticker].cummax() - data[ticker]) / data[ticker].cummax()).max()
                    volatility_score = min(std_dev * 100, 10)
                    drawdown_score = min(max_drawdown * 10, 10)
                    sharpe_score = max(0, 10 - sharpe_ratio)
                    total_score = (volatility_score + drawdown_score + sharpe_score) / 3
                    weighted_score = total_score * (allocations[ticker] / 100)
                    risk_scores.append(weighted_score)

                risk_score = sum(risk_scores)
                if risk_score < 3.5:
                    risk_level = "Low Risk"
                    color = "#367c74"  # green
                elif risk_score < 6.5:
                    risk_level = "Moderate Risk"
                    color = "#c97a41"  # orange
                else:
                    risk_level = "High Risk"
                    color = "#a33f3f"  # red

                st.markdown(f"**Overall Risk Score:** {risk_score:.2f}")
                fig = go.Figure(go.Indicator(
                    mode="gauge+number+delta",
                    value=risk_score,
                    domain={'x': [0, 1], 'y': [0, 1]},
                    title={'text': f"Portfolio Risk Level: {risk_level}", 'font': {'size': 24}},
                    gauge={
                        'axis': {'range': [0, 10], 'tickwidth': 1, 'tickcolor': "darkgray"},
                        'bar': {'color': color},
                        'steps': [
                            {'range': [0, 3.5], 'color': "#367c74"},  # success
                            {'range': [3.5, 6.5], 'color': "#c97a41"},  # warning
                            {'range': [6.5, 10], 'color': "#a33f3f"}   # danger
                        ],
                        'threshold': {
                            'line': {'color': "black", 'width': 4},
                            'thickness': 0.75,
                            'value': risk_score
                        }
                    }
                ))
                st.plotly_chart(fig, use_container_width=True)

                st.session_state["risk_assessment_data"] = {
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "start_date": str(start_date),
                    "end_date": str(end_date),
                    "return_percent": total_percent_change,
                    "initial_investment": amount,
                    "final_value": total_return,
                    "portfolio_volatility": portfolio_std,
                    "portfolio_sharpe_ratio": portfolio_sharpe,
                    "ticker_data": selected_ticker_details
                }
                
        if "risk_assessment_data" in st.session_state:
            if st.button("Save Risk Assessment"):

                try:
                    headers = {"Authorization": f"Bearer {token}"}
                    response = requests.post("f{apiURL}simulations/investments", json=st.session_state["risk_assessment_data"], headers=headers)
                    if response.status_code == 201:
                        st.success("Risk assessment saved successfully!")
                    else:
                        st.error(f"Failed to save risk assessment: {response.text}")
                except Exception as e:
                    st.error(f"An error occurred: {e}")

    portfolio_simulator()

# --- Loan Risk Assessment Tab ---
with tabs[2]:
    st.title("🤲 Loan Risk Assessment")

    # User Inputs
    loan_amount = st.number_input("Loan Amount (USD)", min_value=1000, value=5000, step=500)
    interest_rate = st.slider("Interest Rate (%)", 0.0, 20.0, 5.0)
    loan_term = st.slider("Loan Term (Years)", 1, 30, 10)
    after_tax_income = st.number_input("Annual After-Tax Income (USD)", min_value=1000, value=50000, step=1000)
    income_source_count = st.number_input("Number of Income Sources", min_value=1, value=1, step=1)
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
        if income_source_count >= 3:
            score += 2
            score_log.append(("3+ Income Sources", 2))
        elif income_source_count == 2:
            score += 1
            score_log.append(("2 Income Sources", 1))
        elif income_source_count == 1:
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
            "debt_to_income_ratio": dti_ratio,
            "loan_to_income_ratio": lti_ratio,
            "credit_utilization": credit_utilization,
            "loan_risk": risk,
            "num_dependents": num_dependents,
            "income_source_count": income_source_count,
            "credit_card_limit": credit_card_limit,
            "has_real_estate": has_real_estate
        }

    if "loan_risk_assessment_data" in st.session_state:
        if st.button("Save Loan Risk Assessment"):
            try:
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.post(
                    f"{apiURL}simulations/loans",
                    json=st.session_state["loan_risk_assessment_data"],
                    headers=headers
                )
                if response.status_code == 201:
                    st.success("Loan risk assessment saved successfully!")
                else:
                    st.error(f"Failed to save loan risk assessment: {response.text}")
            except Exception as e:
                st.error(f"An error occurred: {e}")