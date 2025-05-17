import streamlit as st
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import requests

token = st.query_params.get("token", [None])

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
        # data = yf.download(tickers, start=start_date, end=end_date)
        # return data['Close']  # Returning only close prices
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
token = st.query_params.get("token", [None])[0]
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
                    st.error(f"Error: No data found for {ticker}.")
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
                st.dataframe(df_risk, use_container_width=True)

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
                    color = "green"
                elif risk_score < 6.5:
                    risk_level = "Moderate Risk"
                    color = "orange"
                else:
                    risk_level = "High Risk"
                    color = "red"

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
                    response = requests.post("http://localhost:5000/simulations/investments", json=st.session_state["risk_assessment_data"], headers=headers)
                    if response.status_code == 201:
                        st.success("Risk assessment saved successfully!")
                    else:
                        st.error(f"Failed to save risk assessment: {response.text}")
                except Exception as e:
                    st.error(f"An error occurred: {e}")

    portfolio_simulator()

# --- Loan Risk Assessment Tab ---
with tabs[2]:
    def loan_risk_assessment():
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

            st.write(f"Loan Amount: ${loan_amount:,.2f}")
            st.write(f"Loan Term: {loan_term} years @ {interest_rate:.2f}%")
            st.write(f"Debt-to-Income Ratio: {debt_to_income_ratio:.2f}")
            st.write(f"Credit Score: {credit_score}")
            st.subheader(f"🔮 Predicted Loan Risk: **{loan_risk}**")

    loan_risk_assessment()
