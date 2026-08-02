import os
import json
import pandas as pd
import google.generativeai as genai
from typing import Dict, Any, Optional

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to configure Google Generative AI client: {e}")

LEGAL_DISCLAIMER = "For educational/informational purposes only. Not financial advice."


def _generate_mock_signal(ticker: str, rsi: Optional[float], macd: Optional[float], macd_signal: Optional[float], close_price: Optional[float]) -> Dict[str, Any]:
    """
    Fallback deterministic mock probabilistic estimate when Gemini API is unavailable.
    Guarantees strict legal compliance. No absolute BUY/SELL issued.
    """
    # Strict probabilistic zone
    zone = "Neutral Consolidation Zone"
    confidence = "Low (Fallback)"
    rationale = "Technical indicators suggest neutral momentum. Consolidating without absolute trend direction."

    if rsi is not None:
        if rsi < 30:
            zone = "High Probability Bullish Zone (Oversold)"
            confidence = "Medium (Fallback)"
            rationale = f"RSI is extremely low ({rsi:.2f}), indicating the asset is heavily oversold. Historical probability points to a bullish zone pullback."
        elif rsi > 70:
            zone = "High Probability Bearish Zone (Overbought)"
            confidence = "Medium (Fallback)"
            rationale = f"RSI is extremely high ({rsi:.2f}), indicating the asset is heavily overbought. Historical probability points to a corrective bearish pullback."
        elif macd is not None and macd_signal is not None:
            if macd > macd_signal and rsi < 55:
                zone = "High Probability Bullish Zone"
                confidence = "Medium (Fallback)"
                rationale = f"MACD line crossed above the signal line (Bullish crossover) with supportive RSI ({rsi:.2f})."
            elif macd < macd_signal and rsi > 45:
                zone = "High Probability Bearish Zone"
                confidence = "Medium (Fallback)"
                rationale = f"MACD line crossed below the signal line (Bearish crossover) with vulnerable RSI ({rsi:.2f})."

    return {
        "ticker": ticker,
        "probabilistic_estimate": zone,
        "confidence": confidence,
        "rationale": rationale,
        "indicator_snapshot": {
            "close_price": close_price,
            "rsi_14": rsi,
            "macd": macd,
            "macd_signal": macd_signal
        },
        "source": "Fallback Rule Engine",
        "disclaimer": LEGAL_DISCLAIMER
    }


def generate_ai_signal(ticker: str, df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate a Probabilistic Technical Estimate trading signal using Gemini model or fallback mock engine.
    Follows STRICT LEGAL COMPLIANCE by omitting BUY/SELL or absolute predictions.
    """
    if df.empty:
        return {
            "ticker": ticker,
            "probabilistic_estimate": "Neutral Consolidation Zone",
            "confidence": "None",
            "rationale": "No market data available to generate signal estimates.",
            "indicator_snapshot": {},
            "source": "Error fallback",
            "disclaimer": LEGAL_DISCLAIMER
        }

    latest_row = df.iloc[-1]

    close_price = float(latest_row.get("Close")) if "Close" in latest_row else None
    rsi = float(latest_row.get("RSI_14")) if "RSI_14" in latest_row and not pd.isna(latest_row.get("RSI_14")) else None
    macd = float(latest_row.get("MACD")) if "MACD" in latest_row and not pd.isna(latest_row.get("MACD")) else None
    macd_signal = float(latest_row.get("MACD_Signal")) if "MACD_Signal" in latest_row and not pd.isna(latest_row.get("MACD_Signal")) else None
    sma_20 = float(latest_row.get("SMA_20")) if "SMA_20" in latest_row and not pd.isna(latest_row.get("SMA_20")) else None
    sma_50 = float(latest_row.get("SMA_50")) if "SMA_50" in latest_row and not pd.isna(latest_row.get("SMA_50")) else None
    sma_200 = float(latest_row.get("SMA_200")) if "SMA_200" in latest_row and not pd.isna(latest_row.get("SMA_200")) else None

    if not GEMINI_API_KEY:
        return _generate_mock_signal(ticker, rsi, macd, macd_signal, close_price)

    # STRICT LEGAL COMPLIANCE prompt
    prompt = f"""
    You are a professional financial trading AI assistant ("Trade Doctor").
    Analyze the following market data and technical indicators for {ticker}:
    - Latest Close Price: {close_price}
    - Relative Strength Index (RSI 14): {rsi}
    - MACD Line: {macd}
    - MACD Signal Line: {macd_signal}
    - 20-Day SMA: {sma_20}
    - 50-Day SMA: {sma_50}
    - 200-Day SMA: {sma_200}

    CRITICAL RULES FOR LEGAL COMPLIANCE AND SAFETY:
    1. DO NOT output absolute "BUY", "SELL", or "HOLD" directives.
    2. DO NOT make direct or exact future price predictions.
    3. Output the estimated probabilistic momentum zone instead.
    4. Categorize the probabilistic_estimate as one of: "High Probability Bullish Zone", "Neutral Consolidation Zone", or "High Probability Bearish Zone".
    5. Always conclude with a strictly educational risk analysis.

    Respond strictly in JSON format. Do not write any markdown code blocks, backticks, or other text outside the JSON. The JSON schema must be:
    {{
        "ticker": "{ticker}",
        "probabilistic_estimate": "High Probability Bullish Zone" | "Neutral Consolidation Zone" | "High Probability Bearish Zone",
        "confidence": "Low" | "Medium" | "High",
        "rationale": "Detailed explanation of probabilistic technical analysis indicators without guaranteeing outcomes."
    }}
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()

        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        try:
            ai_data = json.loads(text)
        except json.JSONDecodeError as e:
            try:
                ai_data = json.loads(text[:e.pos])
            except Exception:
                start_idx = text.find("{")
                end_idx = text.rfind("}")
                if start_idx != -1 and end_idx != -1:
                    ai_data = json.loads(text[start_idx:end_idx + 1])
                else:
                    raise e

        # Ensure correct structured response with mandatory disclaimer
        return {
            "ticker": ticker,
            "probabilistic_estimate": ai_data.get("probabilistic_estimate", "Neutral Consolidation Zone"),
            "confidence": ai_data.get("confidence", "Medium"),
            "rationale": ai_data.get("rationale", "No explanation provided by AI."),
            "indicator_snapshot": {
                "close_price": close_price,
                "rsi_14": rsi,
                "macd": macd,
                "macd_signal": macd_signal,
                "sma_20": sma_20,
                "sma_50": sma_50,
                "sma_200": sma_200
            },
            "source": "Gemini AI",
            "disclaimer": LEGAL_DISCLAIMER
        }
    except Exception as api_err:
        print(f"Gemini API request failed: {api_err}. Falling back to Rule Engine.")
        fallback_res = _generate_mock_signal(ticker, rsi, macd, macd_signal, close_price)
        fallback_res["error"] = str(api_err)
        return fallback_res
