import yfinance as yf
import pandas as pd
from typing import Optional, Dict, Any, List

# Strict 55 High-Growth Assets Categorized across Global (US/Crypto) and Indian markets
HIGH_GROWTH_ASSETS = [
    # ---- WALL STREET & GLOBAL TECH GIANTS (20) ----
    {"ticker": "AAPL", "name": "Apple Inc.", "market": "Global", "sector": "Tech"},
    {"ticker": "MSFT", "name": "Microsoft Corp.", "market": "Global", "sector": "Tech"},
    {"ticker": "GOOGL", "name": "Alphabet Inc.", "market": "Global", "sector": "Tech"},
    {"ticker": "AMZN", "name": "Amazon.com Inc.", "market": "Global", "sector": "Consumer Discretionary"},
    {"ticker": "NVDA", "name": "NVIDIA Corp.", "market": "Global", "sector": "Semiconductors"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "market": "Global", "sector": "Automotive / EV"},
    {"ticker": "META", "name": "Meta Platforms", "market": "Global", "sector": "Tech / Social"},
    {"ticker": "NFLX", "name": "Netflix Inc.", "market": "Global", "sector": "Entertainment"},
    {"ticker": "AMD", "name": "Advanced Micro Devices", "market": "Global", "sector": "Semiconductors"},
    {"ticker": "AVGO", "name": "Broadcom Inc.", "market": "Global", "sector": "Semiconductors"},
    {"ticker": "QCOM", "name": "Qualcomm Inc.", "market": "Global", "sector": "Semiconductors"},
    {"ticker": "SMCI", "name": "Super Micro Computer", "market": "Global", "sector": "Tech / Hardware"},
    {"ticker": "ASML", "name": "ASML Holding", "market": "Global", "sector": "Semiconductors"},
    {"ticker": "JPM", "name": "JPMorgan Chase & Co.", "market": "Global", "sector": "Finance"},
    {"ticker": "GS", "name": "Goldman Sachs Group", "market": "Global", "sector": "Finance"},
    {"ticker": "BAC", "name": "Bank of America Corp.", "market": "Global", "sector": "Finance"},
    {"ticker": "V", "name": "Visa Inc.", "market": "Global", "sector": "Finance / Fintech"},
    {"ticker": "MA", "name": "Mastercard Inc.", "market": "Global", "sector": "Finance / Fintech"},
    {"ticker": "COIN", "name": "Coinbase Global", "market": "Global", "sector": "Fintech / Crypto"},
    {"ticker": "PYPL", "name": "PayPal Holdings", "market": "Global", "sector": "Fintech"},

    # ---- GLOBAL CRYPTO ASSETS (10) ----
    {"ticker": "BTC-USD", "name": "Bitcoin", "market": "Global", "sector": "Crypto"},
    {"ticker": "ETH-USD", "name": "Ethereum", "market": "Global", "sector": "Crypto"},
    {"ticker": "SOL-USD", "name": "Solana", "market": "Global", "sector": "Crypto"},
    {"ticker": "ADA-USD", "name": "Cardano", "market": "Global", "sector": "Crypto"},
    {"ticker": "DOGE-USD", "name": "Dogecoin", "market": "Global", "sector": "Crypto"},
    {"ticker": "XRP-USD", "name": "Ripple", "market": "Global", "sector": "Crypto"},
    {"ticker": "DOT-USD", "name": "Polkadot", "market": "Global", "sector": "Crypto"},
    {"ticker": "LINK-USD", "name": "Chainlink", "market": "Global", "sector": "Crypto"},
    {"ticker": "BNB-USD", "name": "Binance Coin", "market": "Global", "sector": "Crypto"},
    {"ticker": "MATIC-USD", "name": "Polygon", "market": "Global", "sector": "Crypto"},

    # ---- INDIAN BLUE-CHIP & HIGH-GROWTH EQUITIES (25) ----
    {"ticker": "RELIANCE.NS", "name": "Reliance Industries Ltd.", "market": "India", "sector": "Energy / Retail"},
    {"ticker": "TCS.NS", "name": "Tata Consultancy Services", "market": "India", "sector": "Tech / IT"},
    {"ticker": "INFY.NS", "name": "Infosys Ltd.", "market": "India", "sector": "Tech / IT"},
    {"ticker": "HDFCBANK.NS", "name": "HDFC Bank Ltd.", "market": "India", "sector": "Finance / Banking"},
    {"ticker": "ICICIBANK.NS", "name": "ICICI Bank Ltd.", "market": "India", "sector": "Finance / Banking"},
    {"ticker": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd.", "market": "India", "sector": "Telecom"},
    {"ticker": "SBIN.NS", "name": "State Bank of India", "market": "India", "sector": "Finance / Banking"},
    {"ticker": "LTIM.NS", "name": "LTIMindtree Ltd.", "market": "India", "sector": "Tech / IT"},
    {"ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd.", "market": "India", "sector": "Consumer Goods"},
    {"ticker": "ITC.NS", "name": "ITC Ltd.", "market": "India", "sector": "Conglomerate"},
    {"ticker": "TATAMOTORS.NS", "name": "Tata Motors Ltd.", "market": "India", "sector": "Automotive / EV"},
    {"ticker": "TATASTEEL.NS", "name": "Tata Steel Ltd.", "market": "India", "sector": "Metal / Mining"},
    {"ticker": "M&M.NS", "name": "Mahindra & Mahindra Ltd.", "market": "India", "sector": "Automotive"},
    {"ticker": "ADANIENT.NS", "name": "Adani Enterprises Ltd.", "market": "India", "sector": "Infrastructure"},
    {"ticker": "SUNPHARMA.NS", "name": "Sun Pharmaceutical Industries", "market": "India", "sector": "Health / Pharma"},
    {"ticker": "WIPRO.NS", "name": "Wipro Ltd.", "market": "India", "sector": "Tech / IT"},
    {"ticker": "POWERGRID.NS", "name": "Power Grid Corp.", "market": "India", "sector": "Energy / Power"},
    {"ticker": "NTPC.NS", "name": "NTPC Ltd.", "market": "India", "sector": "Energy / Power"},
    {"ticker": "COALINDIA.NS", "name": "Coal India Ltd.", "market": "India", "sector": "Energy / Mining"},
    {"ticker": "ONGC.NS", "name": "Oil & Natural Gas Corp.", "market": "India", "sector": "Energy / Oil & Gas"},
    {"ticker": "BAJFINANCE.NS", "name": "Bajaj Finance Ltd.", "market": "India", "sector": "Finance / NBFC"},
    {"ticker": "BAJAJFINSV.NS", "name": "Bajaj Finserv Ltd.", "market": "India", "sector": "Finance / Insurance"},
    {"ticker": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank", "market": "India", "sector": "Finance / Banking"},
    {"ticker": "AXISBANK.NS", "name": "Axis Bank Ltd.", "market": "India", "sector": "Finance / Banking"},
    {"ticker": "MARUTI.NS", "name": "Maruti Suzuki India", "market": "India", "sector": "Automotive"}
]


def fetch_historical_data(ticker: str, period: str = "1mo", interval: str = "1d") -> pd.DataFrame:
    """
    Fetch historical stock or cryptocurrency market data using yfinance.
    Optimized with robust error handling and fallback mechanism.
    """
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period=period, interval=interval)
        if df.empty and period != "1mo":
            df = stock.history(period="1mo", interval="1d")
        return df
    except Exception as e:
        print(f"Error fetching historical data for ticker {ticker}: {e}")
        return pd.DataFrame()


def fetch_realtime_details(ticker: str) -> Dict[str, Any]:
    """
    Fetch near real-time details with high resilience and fallback endpoints.
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.fast_info

        # Safe dict mapping to guarantee attributes are safely retrieved from yfinance object
        info_dict = {}
        for k in ['currency', 'dayHigh', 'dayLow', 'exchange', 'fiftyDayAverage', 'lastPrice', 'lastVolume', 'marketCap', 'open', 'previousClose', 'quoteType', 'regularMarketPreviousClose', 'shares', 'tenDayAverageVolume', 'threeMonthAverageVolume', 'timezone', 'twoHundredDayAverage', 'yearChange', 'yearHigh', 'yearLow']:
            try:
                info_dict[k] = info[k]
            except Exception:
                info_dict[k] = None

        history_today = stock.history(period="1d")
        current_price = None
        if not history_today.empty:
            current_price = float(history_today["Close"].iloc[-1])
        elif info_dict.get("lastPrice") is not None:
            current_price = info_dict["lastPrice"]
        elif info_dict.get("previousClose") is not None:
            current_price = info_dict["previousClose"]

        previous_close = info_dict.get("previousClose")
        if previous_close is None and not history_today.empty:
            history_prev = stock.history(period="5d")
            if len(history_prev) > 1:
                previous_close = float(history_prev["Close"].iloc[-2])

        return {
            "ticker": ticker,
            "current_price": current_price if current_price is not None else info_dict.get("lastPrice"),
            "open": info_dict.get("open"),
            "day_high": info_dict.get("dayHigh"),
            "day_low": info_dict.get("dayLow"),
            "previous_close": previous_close,
            "volume": info_dict.get("lastVolume"),
            "currency": info_dict.get("currency", "USD") or "USD"
        }
    except Exception as e:
        print(f"Error fetching real-time details for ticker {ticker}: {e}")
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
