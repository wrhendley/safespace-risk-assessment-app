import pandas as pd
import numpy as np

def simulate_portfolio_logic(data, df):
    amount = data.get("amount")
    tickers = data.get("tickers")
    allocations = data.get("allocations")
    start_date = pd.to_datetime(data.get("start_date"))
    end_date = pd.to_datetime(data.get("end_date"))

    if sum(allocations.values()) != 100:
        return {"error": "Allocations must sum to 100"}, 400

    results = []
    weighted_returns = []

    for ticker in tickers:
        ticker_data = df[(df['ticker'] == ticker) & (df['date'] >= start_date) & (df['date'] <= end_date)].copy()
        if ticker_data.shape[0] < 2:
            continue
        ticker_data.sort_values('date', inplace=True)
        ticker_data['return'] = ticker_data['close_price'].pct_change()
        ticker_data.dropna(inplace=True)

        initial = ticker_data.iloc[0]['close_price']
        final = ticker_data.iloc[-1]['close_price']
        percent_change = (final - initial) / initial
        investment = amount * allocations[ticker] / 100
        result_amount = investment * (1 + percent_change)

        std_dev = np.std(ticker_data['return']) if not ticker_data['return'].empty else 0
        sharpe = (ticker_data['return'].mean() / std_dev) * np.sqrt(252) if std_dev != 0 else 0
        max_drawdown = ((ticker_data['close_price'].cummax() - ticker_data['close_price']) / ticker_data['close_price'].cummax()).max()

        results.append({
            "ticker": ticker,
            "start_price": initial,
            "end_price": final,
            "investment": investment,
            "result_amount": result_amount,
            "percent_return": percent_change * 100,
            "volatility": std_dev,
            "sharpe_ratio": sharpe,
            "max_drawdown": max_drawdown,
        })

        weighted_returns.append(ticker_data['return'] * (allocations[ticker] / 100))

    if not results:
        return {"error": "Not enough data for selected tickers."}, 400

    portfolio_returns = sum([r['result_amount'] for r in results])
    combined_returns = sum(weighted_returns)
    portfolio_std = np.std(combined_returns)
    portfolio_mean = np.mean(combined_returns)
    portfolio_sharpe = portfolio_mean / portfolio_std * np.sqrt(252) if portfolio_std != 0 else 0

    return {
        "results": results,
        "total_return": portfolio_returns,
        "initial_investment": amount,
        "percent_gain": ((portfolio_returns - amount) / amount) * 100,
        "portfolio_std": portfolio_std,
        "portfolio_sharpe": portfolio_sharpe
    }, 200

def assess_loan_risk_logic(data):
    loan_amount = data.get("loan_amount")
    loan_term = data.get("loan_term")
    interest_rate = data.get("interest_rate")
    credit_score = data.get("credit_score")
    annual_income = data.get("annual_income")
    monthly_debt = data.get("monthly_debt")

    if not all(v is not None for v in [loan_amount, loan_term, interest_rate, credit_score, annual_income, monthly_debt]):
        return {"error": "Missing required fields"}, 400

    dti = (monthly_debt * 12) / (annual_income + 1e-9)  # Avoid div by zero

    if credit_score < 580 or dti > 0.5:
        risk = "High Risk"
    elif 580 <= credit_score <= 700 or 0.3 <= dti <= 0.5:
        risk = "Medium Risk"
    else:
        risk = "Low Risk"

    return {
        "loan_amount": loan_amount,
        "loan_term": loan_term,
        "interest_rate": interest_rate,
        "credit_score": credit_score,
        "debt_to_income_ratio": dti,
        "loan_risk": risk
    }, 200
