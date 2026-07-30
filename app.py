from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os

from data_fetcher import fetch_historical_data, fetch_realtime_details
from indicator_engine import append_all_indicators
from ai_signal import generate_ai_signal

app = Flask(__name__)
# Enable CORS for all routes to make integration simple
CORS(app)


def _clean_nans_and_inf(val):
    """
    Helper function to recursively replace NaN and Inf with None
    so that Flask can serialize values into valid JSON.
    """
    if isinstance(val, float):
        if np.isnan(val) or np.isinf(val):
            return None
        return val
    elif isinstance(val, dict):
        return {k: _clean_nans_and_inf(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [_clean_nans_and_inf(v) for v in val]
    return val


@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Simple API health check endpoint.
    """
    return jsonify({
        "status": "healthy",
        "app": "Trade Doctor Backend API",
        "version": "1.0.0"
    }), 200


@app.route("/api/market-data", methods=["GET"])
def get_market_data():
    """
    Fetch historical market data and technical indicators for a given ticker.
    Query parameters:
        - ticker: Ticker symbol (e.g., AAPL, BTC-USD). Default: AAPL
        - period: Historical period (e.g., 1mo, 3mo, 1y). Default: 1mo
        - interval: Data interval (e.g., 1d, 1h). Default: 1d
    """
    ticker = request.args.get("ticker", "AAPL").upper().strip()
    period = request.args.get("period", "1mo").strip()
    interval = request.args.get("interval", "1d").strip()

    if not ticker:
        return jsonify({"error": "Ticker parameter is required"}), 400

    df = fetch_historical_data(ticker, period=period, interval=interval)
    if df.empty:
        return jsonify({"error": f"Failed to retrieve market data for ticker: {ticker}"}), 404

    # Calculate indicators
    df_with_indicators = append_all_indicators(df)

    # Format dataframe index and records
    # Convert Timestamp index to string/ISO format
    df_with_indicators = df_with_indicators.reset_index()
    if "Date" in df_with_indicators.columns:
        df_with_indicators["Date"] = df_with_indicators["Date"].astype(str)
    elif "Datetime" in df_with_indicators.columns:
        df_with_indicators["Datetime"] = df_with_indicators["Datetime"].astype(str)
        # Rename Datetime to Date for response structure consistency
        df_with_indicators = df_with_indicators.rename(columns={"Datetime": "Date"})

    # Prepare historical data records
    records = df_with_indicators.to_dict(orient="records")
    records = _clean_nans_and_inf(records)

    # Also fetch latest real-time details to return side-by-side
    realtime_details = fetch_realtime_details(ticker)
    realtime_details = _clean_nans_and_inf(realtime_details)

    return jsonify({
        "ticker": ticker,
        "period": period,
        "interval": interval,
        "realtime_details": realtime_details,
        "history": records
    }), 200


@app.route("/api/ai-signal", methods=["GET"])
def get_ai_signal():
    """
    Analyze the latest market indicators and fetch an AI trading signal (BUY/SELL/HOLD).
    Query parameters:
        - ticker: Ticker symbol (e.g., AAPL, BTC-USD). Default: AAPL
    """
    ticker = request.args.get("ticker", "AAPL").upper().strip()

    if not ticker:
        return jsonify({"error": "Ticker parameter is required"}), 400

    # Fetch 3 months of daily historical data to have enough room for 200-day SMA, RSI, MACD
    # (200-day SMA requires at least 200 data points, let's request 1y if SMA 200 is needed,
    # or handle shorter periods gracefully by falling back to whatever is calculated).
    df = fetch_historical_data(ticker, period="1y", interval="1d")
    if df.empty:
        # Try a shorter period fallback
        df = fetch_historical_data(ticker, period="3mo", interval="1d")

    if df.empty:
        return jsonify({"error": f"Failed to retrieve market data to generate signal for ticker: {ticker}"}), 404

    # Process indicators
    df_with_indicators = append_all_indicators(df)

    # Generate AI signal
    ai_response = generate_ai_signal(ticker, df_with_indicators)
    ai_response = _clean_nans_and_inf(ai_response)

    return jsonify(ai_response), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Run server
    app.run(host="0.0.0.0", port=port, debug=True)
