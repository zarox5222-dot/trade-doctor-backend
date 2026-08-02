from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os

from data_fetcher import fetch_historical_data, fetch_realtime_details, HIGH_GROWTH_ASSETS
from indicator_engine import (
    append_all_indicators,
    estimate_risk_reward_zones,
    calculate_reversal_probability,
    calculate_position_sizing
)
from ai_signal import generate_ai_signal, LEGAL_DISCLAIMER

app = Flask(__name__)
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
        "version": "1.1.0",
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/market-data", methods=["GET"])
def get_market_data():
    """
    Fetch historical market data, technical indicators, Support/Resistance zones,
    and reversal probabilities.
    """
    ticker = request.args.get("ticker", "AAPL").upper().strip()
    period = request.args.get("period", "1mo").strip()
    interval = request.args.get("interval", "1d").strip()

    if not ticker:
        return jsonify({"error": "Ticker parameter is required", "disclaimer": LEGAL_DISCLAIMER}), 400

    df = fetch_historical_data(ticker, period=period, interval=interval)
    if df.empty:
        return jsonify({"error": f"Failed to retrieve market data for ticker: {ticker}", "disclaimer": LEGAL_DISCLAIMER}), 404

    df_with_indicators = append_all_indicators(df)

    # Estimate Support/Resistance Risk Reward Zones
    risk_reward = estimate_risk_reward_zones(df)
    reversal_probability = calculate_reversal_probability(df)

    # Format dataframe index and records
    df_with_indicators = df_with_indicators.reset_index()
    if "Date" in df_with_indicators.columns:
        df_with_indicators["Date"] = df_with_indicators["Date"].astype(str)
    elif "Datetime" in df_with_indicators.columns:
        df_with_indicators["Datetime"] = df_with_indicators["Datetime"].astype(str)
        df_with_indicators = df_with_indicators.rename(columns={"Datetime": "Date"})

    records = df_with_indicators.to_dict(orient="records")
    records = _clean_nans_and_inf(records)

    realtime_details = fetch_realtime_details(ticker)
    realtime_details = _clean_nans_and_inf(realtime_details)

    return jsonify({
        "ticker": ticker,
        "period": period,
        "interval": interval,
        "realtime_details": realtime_details,
        "risk_reward_estimation": risk_reward,
        "trend_reversal_probability_percent": reversal_probability,
        "history": records,
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/ai-signal", methods=["GET"])
def get_ai_signal():
    """
    Analyze the latest market indicators and fetch a Probabilistic Technical Estimate.
    """
    ticker = request.args.get("ticker", "AAPL").upper().strip()

    if not ticker:
        return jsonify({"error": "Ticker parameter is required", "disclaimer": LEGAL_DISCLAIMER}), 400

    df = fetch_historical_data(ticker, period="1y", interval="1d")
    if df.empty:
        df = fetch_historical_data(ticker, period="3mo", interval="1d")

    if df.empty:
        return jsonify({"error": f"Failed to retrieve market data to generate signal for ticker: {ticker}", "disclaimer": LEGAL_DISCLAIMER}), 404

    df_with_indicators = append_all_indicators(df)

    ai_response = generate_ai_signal(ticker, df_with_indicators)
    ai_response = _clean_nans_and_inf(ai_response)

    return jsonify(ai_response), 200


@app.route("/api/high-growth-assets", methods=["GET"])
def get_high_growth_assets():
    """
    List high-growth and momentum assets across Global and Indian markets.
    Implements a strict Premium Paywall / Access Gate:
    - Tease/preview only the top 2 assets (e.g. index 0 and 1).
    - Remaining assets are blurred/locked with details masked and lock overlays.
    """
    region = request.args.get("region", "all").strip().lower() # 'all', 'global', 'india'
    sector = request.args.get("sector", "all").strip().lower() # 'all', 'tech', 'crypto', etc.

    # Filter listed assets
    filtered_assets = []
    for asset in HIGH_GROWTH_ASSETS:
        # Region Filter
        if region != "all" and asset["market"].lower() != region:
            continue
        # Sector Filter
        if sector != "all" and sector not in asset["sector"].lower():
            continue
        filtered_assets.append(asset)

    # Compile enriched results with mock dynamic momentum & trend confidence
    enriched_results = []
    for index, asset in enumerate(filtered_assets):
        # Top 2 assets are Unlocked, remainder are locked
        is_locked = index >= 2

        # Base asset data
        asset_info = {
            "ticker": asset["ticker"],
            "name": asset["name"],
            "market": asset["market"],
            "sector": asset["sector"],
            "is_locked": is_locked
        }

        # Deterministic dummy calculation values for demo/out-of-the-box UI
        # Dynamic mockup of Growth momentum and confidence
        seed = sum(ord(c) for c in asset["ticker"])
        growth_rate = 15.0 + (seed % 40) + (seed % 10) / 10.0
        rsi_val = 30 + (seed % 50)
        sentiment = "Bullish" if rsi_val < 70 else "Bearish"
        trend_confidence = "High" if growth_rate > 35 else ("Medium" if growth_rate > 22 else "Low")
        catalyst = "AI chips surge" if "Semiconductors" in asset["sector"] else "Adoption expansion"

        if is_locked:
            # Mask sensitive values for paywalled records
            asset_info.update({
                "growth_rate_pct": None,
                "rsi": None,
                "sentiment": "[LOCKED]",
                "trend_confidence": "[LOCKED]",
                "catalyst": "[LOCKED]",
                "premium_gate_overlay": {
                    "text": "Unlock Premium Global & Indian Market Insights — $19.99/month",
                    "live_data_text": "Upgrade to Access Live Data in USD",
                    "price_usd": 19.99
                }
            })
        else:
            # Fully visible preview/teaser
            asset_info.update({
                "growth_rate_pct": float(f"{growth_rate:.1f}"),
                "rsi": int(rsi_val),
                "sentiment": sentiment,
                "trend_confidence": trend_confidence,
                "catalyst": catalyst
            })

        enriched_results.append(asset_info)

    return jsonify({
        "assets": enriched_results,
        "count_total": len(HIGH_GROWTH_ASSETS),
        "count_filtered": len(enriched_results),
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/position-size", methods=["POST"])
def get_position_size():
    """
    Position Sizing Calculator Endpoint.
    Calculates units and risk based on user inputs.
    """
    req_data = request.get_json() or {}

    account_size = float(req_data.get("account_size", 0))
    risk_percentage = float(req_data.get("risk_percentage", 0))
    entry_price = float(req_data.get("entry_price", 0))
    stop_loss_price = float(req_data.get("stop_loss_price", 0))

    if not all([account_size, risk_percentage, entry_price, stop_loss_price]):
        return jsonify({
            "error": "Missing parameters. Required: account_size, risk_percentage, entry_price, stop_loss_price",
            "disclaimer": LEGAL_DISCLAIMER
        }), 400

    sizing = calculate_position_sizing(account_size, risk_percentage, entry_price, stop_loss_price)
    sizing = _clean_nans_and_inf(sizing)
    sizing["disclaimer"] = LEGAL_DISCLAIMER

    return jsonify(sizing), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
