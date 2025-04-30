import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

st.set_page_config(layout="wide")

# Load historical stock data
df = pd.read_csv(../src/components/Risk_Dashboard/dummy_stock_prediction_data_50yrs.csv)
df['date'] = pd.to_datetime(df['date'])

st.title("📊 Investment Portfolio Simulator & Risk Analyzer")

# Sidebar inputs
amount = st.sidebar.number_input("Total Investment Amount (USD)", value=1000)
tickers = st.sidebar.multiselect("Select Stocks", options=df['ticker'].unique(), default=['AAPL'])
date_range = st.sidebar.date_input("Select Date Range", [df['date'].min().date(), df['date'].max().date()])

allocations = {}
for ticker in tickers:
    allocations[ticker] = st.sidebar.slider(f"{ticker} Allocation %", 0, 100, 100 // len(tickers))

total_alloc = sum(allocations.values())
if total_alloc != 100:
    st.sidebar.error("Allocations must total 100%.")

# Filter and compute for each ticker
portfolio_returns = []
weighted_returns = []

col1, col2 = st.columns(2)

for ticker in tickers:
    data = df[(df['ticker'] == ticker) &
              (df['date'] >= pd.to_datetime(date_range[0])) &
              (df['date'] <= pd.to_datetime(date_range[1]))]

    if len(data) >= 2:
        data = data.sort_values('date')
        data['return'] = data['close_price'].pct_change()
        data.dropna(inplace=True)

        initial = data.iloc[0]['close_price']
        final = data.iloc[-1]['close_price']
        percent_change = (final - initial) / initial
        investment = amount * allocations[ticker] / 100
        result_amount = investment * (1 + percent_change)

        std_dev = np.std(data['return'])
        max_drawdown = ((data['close_price'].cummax() - data['close_price']) / data['close_price'].cummax()).max()
        sharpe_ratio = data['return'].mean() / std_dev * np.sqrt(252) if std_dev != 0 else 0

        weighted_returns.append(data['return'] * (allocations[ticker] / 100))

        with col1:
            st.subheader(f"📈 {ticker} Summary")
            st.write(f"Start Price: ${initial:.2f}")
            st.write(f"End Price: ${final:.2f}")
            st.write(f"Change: {percent_change * 100:.2f}%")
            st.write(f"Return on ${investment:.2f}: ${result_amount:.2f}")
            st.write(f"Volatility (Std Dev): {std_dev:.4f}")
            st.write(f"Max Drawdown: {max_drawdown:.2%}")
            st.write(f"Sharpe Ratio: {sharpe_ratio:.2f}")

        with col2:
            st.line_chart(data.set_index('date')['close_price'])

        portfolio_returns.append(result_amount)
    else:
        st.warning(f"Not enough data for {ticker}.")

# Aggregate Portfolio
if portfolio_returns and total_alloc == 100:
    total_return = sum(portfolio_returns)
    combined_returns = sum(weighted_returns)
    portfolio_std = np.std(combined_returns)
    portfolio_mean = np.mean(combined_returns)
    portfolio_sharpe = portfolio_mean / portfolio_std * np.sqrt(252) if portfolio_std != 0 else 0

    st.markdown("---")
    st.header("💼 Portfolio Summary")
    st.write(f"Initial Investment: ${amount:.2f}")
    st.write(f"Final Value: ${total_return:.2f}")
    st.write(f"Total Return: {((total_return - amount) / amount) * 100:.2f}%")
    st.write(f"Portfolio Volatility: {portfolio_std:.4f}")
    st.write(f"Sharpe Ratio: {portfolio_sharpe:.2f}")
    st.line_chart(combined_returns.cumsum())

