import pandas as pd
import yfinance as yf
import streamlit as st

# Fetch the ticker data from YahooFinance API
@st.cache_data
def get_yahoo_data(tickers, start_date, end_date):
    try:
        data = yf.download(tickers, start=start_date, end=end_date)['Close']
        if isinstance(data, pd.Series):
            data = data.to_frame()
        return data
    except Exception as e:
        st.error(f"Error fetching data from Yahoo Finance: {e}")
        return None

# Fetch teh tickers from the S&P 500 
@st.cache_data
def load_sp500_tickers():
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    table = pd.read_html(url)
    df = table[0]
    return sorted(df['Symbol'].tolist())
