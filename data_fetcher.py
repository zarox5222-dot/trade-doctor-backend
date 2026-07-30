import yfinance as yf
import pandas as pd
from typing import Optional, Dict, Any


def fetch_historical_data(ticker: str, period: str = "1mo", interval: str = "1d") -> pd.DataFrame:
    """
    Fetch historical stock or cryptocurrency market data using yfinance.

    Parameters:
        ticker (str): The ticker symbol (e.g., 'AAPL', 'BTC-USD').
        period (str): The data period to download (e.g., '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max').
        interval (str): The data interval (e.g., '1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo').

    Returns:
        pd.DataFrame: A pandas DataFrame containing historical prices with Date index, Open, High, Low, Close, Volume.
    """
    try:
        # Some crypto symbols are commonly input without -USD, try to handle gently if needed,
        # but standard yfinance tickers are expected (e.g., AAPL, BTC-USD).
        stock = yf.Ticker(ticker)
        df = stock.history(period=period, interval=interval)
        return df
    except Exception as e:
        print(f"Error fetching historical data for ticker {ticker}: {e}")
        return pd.DataFrame()


def fetch_realtime_details(ticker: str) -> Dict[str, Any]:
    """
    Fetch near real-time details (current price, day high/low, open, previous close, volume) for a ticker.

    Parameters:
        ticker (str): The ticker symbol (e.g., 'AAPL', 'BTC-USD').

    Returns:
        Dict[str, Any]: A dictionary containing current market stats.
    """
    try:
        stock = yf.Ticker(ticker)
        # yfinance fast_info contains fast-access properties
        info = stock.fast_info

        # We can also attempt to fetch a short period (1 day) with small interval (1m or 5m)
        # to guarantee we get the very latest closing price if fast_info is sparse.
        history_today = stock.history(period="1d")

        current_price = None
        if not history_today.empty:
            current_price = float(history_today["Close"].iloc[-1])
        elif "lastPrice" in info:
            current_price = info["lastPrice"]
        elif "previousClose" in info:
            current_price = info["previousClose"]

        previous_close = info.get("previousClose", None)
        if previous_close is None and not history_today.empty:
            # Fallback for previous close
            history_prev = stock.history(period="5d")
            if len(history_prev) > 1:
                previous_close = float(history_prev["Close"].iloc[-2])

        return {
            "ticker": ticker,
            "current_price": current_price if current_price is not None else info.get("last_price", None),
            "open": info.get("open", None),
            "day_high": info.get("dayHigh", None),
            "day_low": info.get("dayLow", None),
            "previous_close": previous_close,
            "volume": info.get("lastVolume", None) or info.get("volume", None),
            "currency": info.get("currency", "USD")
        }
    except Exception as e:
        print(f"Error fetching real-time details for ticker {ticker}: {e}")
        # Return structured fallback dictionary with None values
        return {
            "ticker": ticker,
            "current_price": None,
            "open": None,
            "day_high": None,
            "day_low": None,
            "previous_close": None,
            "volume": None,
            "currency": "USD",
            "error": str(e)
        }
