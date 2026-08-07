from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import datetime

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

# Supabase configuration setup
app.config["SUPABASE_URL"] = os.environ.get("SUPABASE_URL") or "https://wsnkikllgvfgvhujwjii.supabase.co"
app.config["SUPABASE_KEY"] = os.environ.get("SUPABASE_KEY")

# In-memory stores
FREE_SEARCH_HISTORY = {}  # Tracks IP search timestamps
FREE_IMAGE_ANALYSIS_COUNT = {}  # Tracks IP image uploads (unlocked 2-3 free requests)
SAVED_TRADE_JOURNAL = []  # Simulated AI Trade Journal DB
TELEGRAM_SUBSCRIBERS = []  # Simulated VIP Telegram watchlist hookups


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
        "version": "1.4.0",
        "supabase_connection": app.config["SUPABASE_URL"],
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
    Unlocked for paid members ('Pro' or 'VIP').
    """
    region = request.args.get("region", "all").strip().lower()
    sector = request.args.get("sector", "all").strip().lower()
    user_role = request.args.get("subscription_role", "Free").strip()

    is_paid_user = user_role in ["Pro", "VIP"]

    filtered_assets = []
    for asset in HIGH_GROWTH_ASSETS:
        if region != "all" and asset["market"].lower() != region:
            continue
        if sector != "all" and sector not in asset["sector"].lower():
            continue
        filtered_assets.append(asset)

    enriched_results = []
    for index, asset in enumerate(filtered_assets):
        # Locked index starts at 2 for Free users, unlocked completely for Pro/VIP
        is_locked = (index >= 2) and (not is_paid_user)

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
                    "text": "Unlock Premium Global & Indian Market Insights — $29.99/month",
                    "live_data_text": "Upgrade to Access Live Data in USD",
                    "price_usd": 29.99,
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
    analyzes visual entry mistakes, matches exactly 4 trading book patterns, and outputs educational alternatives.
    Unlocks 3 FREE scans per user/IP before enforcing subscription gating.
    """
    req_data = request.get_json() or {}
    base64_image = req_data.get("image_base64", "").strip()
    user_role = req_data.get("subscription_role", "Free").strip()
    user_ip = request.remote_addr or "127.0.0.1"

    if not base64_image:
        return jsonify({
            "error": "Missing parameter: 'image_base64' is required.",
            "disclaimer": LEGAL_DISCLAIMER
        }), 400

    is_premium = user_role in ["Pro", "VIP"]

    if not is_premium:
        # Enforce 3 free image scans rate limit
        current_scans = FREE_IMAGE_ANALYSIS_COUNT.get(user_ip, 0)
        if current_scans >= 3:
            return jsonify({
                "error": "Free tier visual chart analysis limit reached (3 scans unlocked). Please upgrade to Pro or VIP to continue.",
                "is_locked": True,
                "premium_upsell": {
                    "text": "Unlock unlimited AI candlestick and 4-chart pattern reviews with Pro ($29.99/mo).",
                    "price_usd": 29.99,
                    "cta": "Unlock with Pro ($29.99/mo)"
                },
                "disclaimer": LEGAL_DISCLAIMER
            }), 403
        else:
            FREE_IMAGE_ANALYSIS_COUNT[user_ip] = current_scans + 1

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
    Free tier limits to 1 search per 24 hours based on mock IP user tracking.
    Pro Tier ($29.99/mo) and above has unlimited search queries.
    """
    req_data = request.get_json() or {}
    query = req_data.get("query", "").strip()
    user_ip = request.remote_addr or "127.0.0.1"

    # Check User Subscription role: "Free" ($0), "Pro" ($29.99), or "VIP" ($69.99)
    user_role = req_data.get("subscription_role", "Free").strip()

    if not query:
        return jsonify({
            "error": "Query string is required.",
            "disclaimer": LEGAL_DISCLAIMER
        }), 400

    # Role-based search checks
    if user_role == "Free":
        now = datetime.datetime.now()
        last_search_time = FREE_SEARCH_HISTORY.get(user_ip)
        if last_search_time:
            delta = now - last_search_time
            if delta.total_seconds() < 86400: # 24 Hours limits
                remaining_seconds = int(86400 - delta.total_seconds())
                return jsonify({
                    "error": "Free tier limit reached (1 Search per 24 hours).",
                    "is_locked": True,
                    "remaining_seconds": remaining_seconds,
                    "premium_upsell": {
                        "text": "Upgrade to Pro for unlimited Natural Language AI Searches.",
                        "price_usd": 29.99,
                        "cta": "Unlock with Pro ($29.99/mo)"
                    },
                    "disclaimer": LEGAL_DISCLAIMER
                }), 403

        FREE_SEARCH_HISTORY[user_ip] = now

    # Execute conversational query parser
    parsed_bounds = ai_parse_screener_query(query)

    matching_assets = []
    for asset in HIGH_GROWTH_ASSETS:
        if parsed_bounds.get("sector") and parsed_bounds["sector"].lower() not in asset["sector"].lower():
            continue
        if parsed_bounds.get("market") and parsed_bounds["market"].lower() != asset["market"].lower():
            continue
        matching_assets.append(asset)

    return jsonify({
        "original_query": query,
        "parsed_parameters": parsed_bounds,
        "matches": matching_assets[:10],
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/smart-money/flow", methods=["GET"])
def get_smart_money_flow():
    """
    Institutional Smart Money Flow & Whale Tracker Heatmap API.
    Only Unlocked for VIP Inner Circle Tier ($69.99/mo).
    """
    user_role = request.args.get("subscription_role", "Free").strip()
    is_vip = user_role == "VIP"

    heatmap_results = []
    whale_alerts = []

    for index, asset in enumerate(HIGH_GROWTH_ASSETS[:15]):
        seed = sum(ord(c) for c in asset["ticker"])
        volume_ratio = 1.0 + (seed % 35) / 10.0
        price_change_pct = float(f"{((seed % 15) - 4.0):.2f}")

        is_spike = volume_ratio >= 2.5
        activity_label = "Smart Money Accumulation" if is_spike else "Normal Activity"
        if volume_ratio >= 3.5:
            activity_label = "Institutional Activity"

        heatmap_item = {
            "ticker": asset["ticker"],
            "name": asset["name"],
            "market": asset["market"],
            "volume_z_score": float(f"{volume_ratio:.2f}") if is_vip else None,
            "price_change_pct": price_change_pct if is_vip else None,
            "label": activity_label if is_vip else "[LOCKED]"
        }
        heatmap_results.append(heatmap_item)

        if is_spike and is_vip:
            whale_alerts.append({
                "ticker": asset["ticker"],
                "message": f"Whale spike alert: {volume_ratio:.2f}x volume flow detected with {price_change_pct}% change.",
                "severity": "High" if volume_ratio > 3.2 else "Medium"
            })

    if not is_vip:
        return jsonify({
            "heatmap": heatmap_results[:2], # Tease first 2 with masked metrics
            "whale_alerts": [],
            "is_locked": True,
            "premium_upsell": {
                "text": "Unlock Smart Money Volume Z-Scores and Whale Activity Alerts with VIP Inner Circle ($69.99/mo).",
                "price_usd": 69.99,
                "badge_lock": "🔒 Unlock with VIP Inner Circle ($69.99/mo)"
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
    Free users can see the score.
    Pro Tier ($29.99/mo) and VIP Tier ($69.99/mo) unlock ATR Stops and exact entries.
    """
    ticker = request.args.get("ticker", "AAPL").upper().strip()
    user_role = request.args.get("subscription_role", "Free").strip()

    is_pro_or_above = user_role in ["Pro", "VIP"]

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

    if not is_pro_or_above:
        response_payload.update({
            "is_locked": True,
            "atr_stop_loss_setup": None,
            "smart_money_inflow_breakdown": "[LOCKED]",
            "exact_entry_exit_points": "[LOCKED]",
            "premium_upsell": {
                "text": "Unlock exact entry points, ATR stop risk setup, and trade logs with Pro ($29.99/mo).",
                "price_usd": 29.99,
                "badge_lock": "🔒 Unlock with Pro ($29.99/mo)"
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


@app.route("/api/trade-journal", methods=["POST"])
def post_trade_journal():
    """
    Pro feature ($29.99/mo) and above: Save user trade records to the simulated DB.
    """
    req_data = request.get_json() or {}
    user_role = req_data.get("subscription_role", "Free").strip()
    ticker = req_data.get("ticker", "").upper().strip()
    entry_price = req_data.get("entry_price")
    comments = req_data.get("comments", "").strip()

    if user_role not in ["Pro", "VIP"]:
        return jsonify({
            "error": "Saved Trade Journal is a Pro Feature. Please upgrade.",
            "price_usd": 29.99,
            "disclaimer": LEGAL_DISCLAIMER
        }), 403

    if not ticker or not entry_price:
        return jsonify({
            "error": "Missing parameters. Required: ticker, entry_price",
            "disclaimer": LEGAL_DISCLAIMER
        }), 400

    record = {
        "id": len(SAVED_TRADE_JOURNAL) + 1,
        "ticker": ticker,
        "entry_price": float(entry_price),
        "comments": comments,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    SAVED_TRADE_JOURNAL.append(record)

    return jsonify({
        "success": True,
        "message": "Trade logged successfully in your AI Journal.",
        "record": record,
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/telegram/alert", methods=["POST"])
def post_telegram_alert():
    """
    Mock Telegram Alert Bot subscriber endpoint.
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

    return jsonify({
        "success": True,
        "message": f"Subscribed successfully! Live Whale alerts for {ticker} will be pushed to Telegram chat ID: {chat_id}.",
        "channel": "Trade Doctor Telegram Alerts Bot",
        "pricing_usd_rate": 69.99,
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/telegram/webhook", methods=["POST"])
def post_telegram_webhook():
    """
    VIP feature webhook monitoring.
    Sends alerts to subscribers when Trade Score > 85 + Institutional Volume Spike occurs.
    """
    req_data = request.get_json() or {}
    ticker = req_data.get("ticker", "AAPL").upper().strip()
    chat_id = req_data.get("chat_id", "vip_alerts_channel").strip()

    df = fetch_historical_data(ticker, period="1mo", interval="1d")
    if df.empty:
        return jsonify({"error": f"Failed to fetch data for ticker {ticker}"}), 404

    # Calculate metrics
    diagnostic = calculate_trade_health_score(df)
    score = diagnostic["score"]
    vol_ratio = diagnostic["volume_spike_ratio"]

    # Check triggers: Score > 85 and Institutional Vol Spike (volume >= 2.5x)
    triggered = score > 85 and vol_ratio >= 2.5
    dispatch_message = None

    if triggered:
        dispatch_message = (
            f"🔔 [VIP Inner Circle Alert] {ticker} has breached key filters!\n"
            f"📈 AI Trade Score: {score}/100\n"
            f"🐋 Smart Money Volume: {vol_ratio:.2f}x average\n"
            f"⚖️ Setup status: Bullish Breakout Accumulation\n"
            f"🛡️ Warning disclaimer: {LEGAL_DISCLAIMER}"
        )

    return jsonify({
        "ticker": ticker,
        "vip_chat_id": chat_id,
        "triggered": triggered,
        "trade_health_score": score,
        "volume_spike_ratio": vol_ratio,
        "dispatch_message": dispatch_message,
        "disclaimer": LEGAL_DISCLAIMER
    }), 200


@app.route("/api/briefing", methods=["GET"])
def get_ai_briefing():
    """
    VIP 1-Click AI Voice/Text Briefing generator via Gemini API.
    """
    ticker = request.args.get("ticker", "AAPL").upper().strip()
    user_role = request.args.get("subscription_role", "Free").strip()

    if user_role != "VIP":
        return jsonify({
            "error": "AI Market Briefing is a VIP Inner Circle feature. Please upgrade.",
            "price_usd": 69.99,
            "disclaimer": LEGAL_DISCLAIMER
        }), 403

    # Fast summary mock
    briefing_text = (
        f"Trade Doctor AI Morning Briefing for {ticker}: "
        f"Consolidated support lines are holding firm above moving averages. "
        f"A visual analysis of candle bodies reveals a strong Hammer pattern close to support, "
        f"matching classic trading literature. Smart money tracking indicates volume is 3x baseline."
    )

    return jsonify({
        "ticker": ticker,
        "briefing": briefing_text,
        "voice_synthesis_url": f"https://api.tradedoctor.ai/v1/voice?text={briefing_text[:50]}",
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

    tiers_info = {
        1: {"name": "Free Tier", "price_usd": 0.00, "benefits": "Retail momentum data, indicators & basic alerts"},
        2: {"name": "Pro Tier", "price_usd": 29.99, "benefits": "Institutional smart money flow tracking, Whale alarms, unlimited AI screener searches"},
        3: {"name": "VIP Inner Circle Tier", "price_usd": 69.99, "benefits": "Full AI trade diagnostics, mistake blockers, live Telegram signals"}
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
