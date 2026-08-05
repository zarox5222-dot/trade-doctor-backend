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
    calculate_position_sizing,
    detect_gaps_and_trends,
    calculate_volume_z_score,
    calculate_trade_health_score,
    estimate_atr_stops
)
from ai_signal import generate_ai_signal, analyze_chart_image, ai_parse_screener_query, LEGAL_DISCLAIMER

app = Flask(__name__)
CORS(app)

# In-memory store for free-tier AI search query limit tracking (IP-based mock)
FREE_SEARCH_HISTORY = {}


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
        "version": "1.3.0",
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

    risk_reward = estimate_risk_reward_zones(df)
    reversal_probability = calculate_reversal_probability(df)

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
    Implements a strict Premium Paywall / Access Gate.
    """
    region = request.args.get("region", "all").strip().lower()
    sector = request.args.get("sector", "all").strip().lower()

    filtered_assets = []
    for asset in HIGH_GROWTH_ASSETS:
        if region != "all" and asset["market"].lower() != region:
            continue
        if sector != "all" and sector not in asset["sector"].lower():
            continue
        filtered_assets.append(asset)

    enriched_results = []
    for index, asset in enumerate(filtered_assets):
        is_locked = index >= 2

        asset_info = {
            "ticker": asset["ticker"],
            "name": asset["name"],
            "market": asset["market"],
            "sector": asset["sector"],
            "is_locked": is_locked
        }

        seed = sum(ord(c) for c in asset["ticker"])
        growth_rate = 15.0 + (seed % 40) + (seed % 10) / 10.0
        rsi_val = 30 + (seed % 50)
        sentiment = "Bullish" if rsi_val < 70 else "Bearish"
        trend_confidence = "High" if growth_rate > 35 else ("Medium" if growth_rate > 22 else "Low")
        catalyst = "AI chips surge" if "Semiconductors" in asset["sector"] else "Adoption expansion"

        ui_metadata = {
            "icon_class": "fa-brands fa-bitcoin text-yellow-500" if asset["sector"] == "Crypto" else "fa-solid fa-chart-line text-blue-500",
            "badge_color": "bg-green-500/10 text-green-400 border border-green-500/20" if sentiment == "Bullish" else "bg-red-500/10 text-red-400 border border-red-500/20",
            "theme_glow_color": "rgba(34, 197, 94, 0.15)" if sentiment == "Bullish" else "rgba(239, 68, 68, 0.15)",
            "chart_gradient_stops": ["#22c55e", "#15803d"] if sentiment == "Bullish" else ["#ef4444", "#b91c1c"]
        }

        if is_locked:
            asset_info.update({
                "growth_rate_pct": None,
                "rsi": None,
                "sentiment": "[LOCKED]",
                "trend_confidence": "[LOCKED]",
                "catalyst": "[LOCKED]",
                "ui_metadata": {
                    "icon_class": "fa-solid fa-lock text-slate-500",
                    "badge_color": "bg-slate-500/10 text-slate-400 border border-slate-500/20",
                    "theme_glow_color": "rgba(100, 116, 139, 0.1)",
                    "chart_gradient_stops": ["#64748b", "#475569"]
                },
                "premium_gate_overlay": {
                    "text": "Unlock Premium Global & Indian Market Insights — $19.99/month",
                    "live_data_text": "Upgrade to Access Live Data in USD",
                    "price_usd": 19.99,
                    "blur_style": "backdrop-blur-md bg-slate-950/70 border border-slate-800",
                    "call_to_action_class": "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all duration-300"
                }
            })
        else:
            asset_info.update({
                "growth_rate_pct": float(f"{growth_rate:.1f}"),
                "rsi": int(rsi_val),
                "sentiment": sentiment,
                "trend_confidence": trend_confidence,
                "catalyst": catalyst,
                "ui_metadata": ui_metadata
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


@app.route("/api/analyze-chart", methods=["POST"])
def post_analyze_chart():
    """
    Accepts screenshot chart uploads in base64 string encoding,
    analyzes visual entry mistakes, and outputs educational alternatives.
    """
    req_data = request.get_json() or {}
    base64_image = req_data.get("image_base64", "").strip()

    if not base64_image:
        return jsonify({
            "error": "Missing parameter: 'image_base64' is required.",
            "disclaimer": LEGAL_DISCLAIMER
        }), 400

    analysis = analyze_chart_image(base64_image)
    analysis = _clean_nans_and_inf(analysis)

    return jsonify(analysis), 200


@app.route("/api/market-gaps-trends", methods=["GET"])
def get_market_gaps_trends():
    """
    Calculate and report gaps, resistance breakouts, and macro trend patterns
    for a given asset to feed premium UI streams.
    """
    ticker = request.args.get("ticker", "AAPL").upper().strip()

    df = fetch_historical_data(ticker, period="3mo", interval="1d")
    if df.empty:
        return jsonify({
            "error": f"Failed to retrieve data to calculate gaps & trends for: {ticker}",
            "disclaimer": LEGAL_DISCLAIMER
        }), 404

    gaps_trends = detect_gaps_and_trends(df)
    gaps_trends = _clean_nans_and_inf(gaps_trends)
    gaps_trends["ticker"] = ticker
    gaps_trends["disclaimer"] = LEGAL_DISCLAIMER

    return jsonify(gaps_trends), 200


@app.route("/api/screener/ai-search", methods=["POST"])
def post_screener_ai_search():
    """
    Conversational Natural Language Screener Endpoint.
    Free tier limits to 1 search per day based on mock user tracking.
    Premium 'Inner Circle' has unlimited searches.
    """
    req_data = request.get_json() or {}
    query = req_data.get("query", "").strip()
    user_ip = request.remote_addr or "127.0.0.1"
    is_premium = bool(req_data.get("is_premium", False))

    if not query:
        return jsonify({
            "error": "Query string is required.",
            "disclaimer": LEGAL_DISCLAIMER
        }), 400

    # Rate limiting mock for free users
    if not is_premium:
        search_count = FREE_SEARCH_HISTORY.get(user_ip, 0)
        if search_count >= 1:
            return jsonify({
                "error": "Free tier limit reached (1 Search per day).",
                "is_locked": True,
                "premium_upsell": {
                    "text": "Upgrade to Inner Circle for unlimited Natural Language AI Searches.",
                    "price_usd": 19.99,
                    "cta": "Unlock with Inner Circle ($19.99/mo)"
                },
                "disclaimer": LEGAL_DISCLAIMER
            }), 403
        else:
            FREE_SEARCH_HISTORY[user_ip] = search_count + 1

    # Execute parser
    parsed_bounds = ai_parse_screener_query(query)

    # Filter matching stocks from the predefined HIGH_GROWTH_ASSETS array
    matching_assets = []
    for asset in HIGH_GROWTH_ASSETS:
        # Check sector filter
        if parsed_bounds.get("sector") and parsed_bounds["sector"].lower() not in asset["sector"].lower():
            continue
        # Check market filter
        if parsed_bounds.get("market") and parsed_bounds["market"].lower() != asset["market"].lower():
            continue
        matching_assets.append(asset)

    # Return structured results
    return jsonify({
        "original_query": query,
        "parsed_parameters": parsed_bounds,
        "matches": matching_assets[:10], # top 10 limit
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/smart-money/flow", methods=["GET"])
def get_smart_money_flow():
    """
    Institutional Smart Money Flow & Whale Tracker Heatmap API.
    Provides volume ratios and alert signals for momentum tracking.
    Locked/Blurred for free users.
    """
    is_premium = request.args.get("is_premium", "false").lower() == "true"

    heatmap_results = []
    whale_alerts = []

    # Process exactly the predefined list to identify Whale spikes
    # For demo/mock resilience we return compiled items quickly
    for index, asset in enumerate(HIGH_GROWTH_ASSETS[:15]):
        # Deterministic dummy math to simulate spikes for heatmap
        seed = sum(ord(c) for c in asset["ticker"])
        volume_ratio = 1.0 + (seed % 35) / 10.0 # ranges up to 4.5
        price_change_pct = float(f"{((seed % 15) - 4.0):.2f}")

        is_spike = volume_ratio >= 2.5
        activity_label = "Smart Money Accumulation" if is_spike else "Normal Activity"
        if volume_ratio >= 3.5:
            activity_label = "Institutional Activity"

        heatmap_item = {
            "ticker": asset["ticker"],
            "name": asset["name"],
            "market": asset["market"],
            "volume_z_score": float(f"{volume_ratio:.2f}"),
            "price_change_pct": price_change_pct,
            "label": activity_label if is_premium else "[LOCKED]"
        }
        heatmap_results.append(heatmap_item)

        if is_spike:
            whale_alerts.append({
                "ticker": asset["ticker"],
                "message": f"Whale spike alert: {volume_ratio:.2f}x volume flow detected with {price_change_pct}% change.",
                "severity": "High" if volume_ratio > 3.2 else "Medium"
            })

    if not is_premium:
        # Partially blur details and offer upsell package
        return jsonify({
            "heatmap": heatmap_results[:2], # Tease first 2
            "whale_alerts": [],
            "is_locked": True,
            "premium_upsell": {
                "text": "Unlock Smart Money Entry Points & Live Telegram Whale Alerts with Inner Circle ($19.99/mo).",
                "price_usd": 19.99,
                "badge_lock": "🔒 Unlock with Inner Circle ($19.99/mo)"
            },
            "disclaimer": LEGAL_DISCLAIMER
        }), 200

    return jsonify({
        "heatmap": heatmap_results,
        "whale_alerts": whale_alerts,
        "is_locked": False,
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/trade-diagnostic", methods=["GET"])
def get_trade_diagnostic():
    """
    AI Trade Diagnostic & "Mistake Blocker" Setup API.
    Uses ATR and health scores to calculate risk setups.
    Free users can see the score but not the entry/exit breakdown.
    """
    ticker = request.args.get("ticker", "AAPL").upper().strip()
    is_premium = request.args.get("is_premium", "false").lower() == "true"

    df = fetch_historical_data(ticker, period="3mo", interval="1d")
    if df.empty:
        return jsonify({
            "error": f"Failed to retrieve data for diagnostic: {ticker}",
            "disclaimer": LEGAL_DISCLAIMER
        }), 404

    # Calculate pre-trade diagnostics
    diagnostic = calculate_trade_health_score(df)

    # Calculate ATR Stop levels
    latest_close = float(df["Close"].iloc[-1])
    atr_series = detect_gaps_and_trends(df) # mock ATR trigger check or call indicator calculations
    # Fetch real atr calculation from engine
    from indicator_engine import calculate_atr
    atr_list = calculate_atr(df)
    atr_val = atr_list.iloc[-1] if not atr_list.empty and not pd.isna(atr_list.iloc[-1]) else latest_close * 0.02

    stops = estimate_atr_stops(latest_close, atr_val)

    response_payload = {
        "ticker": ticker,
        "trade_health_score": diagnostic["score"],
        "status": diagnostic["status"],
        "risk_warning": diagnostic["risk_warning"],
        "disclaimer": LEGAL_DISCLAIMER
    }

    if not is_premium:
        # Free users can see the score but not the breakdown elements
        response_payload.update({
            "is_locked": True,
            "atr_stop_loss_setup": None,
            "smart_money_inflow_breakdown": "[LOCKED]",
            "exact_entry_exit_points": "[LOCKED]",
            "premium_upsell": {
                "text": "Unlock exact entry points, ATR stops, and risk guardrails.",
                "price_usd": 19.99,
                "badge_lock": "🔒 Unlock with Inner Circle ($19.99/mo)"
            }
        })
    else:
        response_payload.update({
            "is_locked": False,
            "atr_stop_loss_setup": stops,
            "smart_money_inflow_breakdown": {
                "volume_multiplier_ratio": diagnostic["volume_spike_ratio"],
                "indicators_aligned": diagnostic["reasons"]
            },
            "exact_entry_exit_points": {
                "estimated_appropriate_entry": float(latest_close),
                "suggested_risk_ratio": "1:2 and 1:3 targets"
            }
        })

    response_payload = _clean_nans_and_inf(response_payload)
    return jsonify(response_payload), 200


@app.route("/api/telegram/alert", methods=["POST"])
def post_telegram_alert():
    """
    Mock Telegram Alert Bot endpoint.
    Sends instant alerts when momentum indicators trigger smart money flow.
    """
    req_data = request.get_json() or {}
    ticker = req_data.get("ticker", "AAPL").upper().strip()
    chat_id = req_data.get("chat_id", "").strip()

    if not chat_id:
        return jsonify({
            "error": "Missing parameter: 'chat_id' is required for Telegram integration.",
            "disclaimer": LEGAL_DISCLAIMER
        }), 400

    # Simple mockup alert confirmation
    return jsonify({
        "success": True,
        "message": f"Subscribed successfully! Live Whale alerts for {ticker} will be pushed to Telegram chat ID: {chat_id}.",
        "channel": "Trade Doctor Telegram Alerts Bot",
        "pricing_usd_rate": 19.99,
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/auth/register-login", methods=["POST"])
def post_auth_register_login():
    """
    Account selection & signup mockup endpoint supporting Google or Email account selections.
    Enables selection of three premium tier packages pricing in USD.
    """
    req_data = request.get_json() or {}
    email = req_data.get("email", "").strip()
    provider = req_data.get("provider", "email").strip().lower() # 'email' or 'google'
    tier_level = int(req_data.get("tier_level", 1)) # Level 1, 2, or 3

    if not email and provider == "email":
        return jsonify({
            "error": "Email is required for registration/login.",
            "disclaimer": LEGAL_DISCLAIMER
        }), 400

    # Services split cleanly by USD pricing tiers
    tiers_info = {
        1: {"name": "Momentum Tier", "price_usd": 9.99, "benefits": "Retail momentum data, indicators & basic alerts"},
        2: {"name": "Inner Circle Tier", "price_usd": 19.99, "benefits": "Institutional smart money flow tracking, Whale alarms, unlimited AI screener searches"},
        3: {"name": "Alpha Elite Tier", "price_usd": 49.99, "benefits": "Full AI trade diagnostics, mistake blockers, live Telegram signals"}
    }

    selected_tier = tiers_info.get(tier_level, tiers_info[2])

    return jsonify({
        "success": True,
        "user": {
            "email": email or f"google-oauth-{provider}@domain.com",
            "provider": provider,
            "status": "Active"
        },
        "subscription_tier": selected_tier,
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
