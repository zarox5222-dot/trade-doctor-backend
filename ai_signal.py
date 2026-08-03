import os
import json
import base64
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


def analyze_chart_image(base64_image_data: str) -> Dict[str, Any]:
    """
    Accepts base64-encoded screenshot of a candlestick chart, analyzes trade entry mistakes,
    and identifies where "it seems appropriate" to take the trade, strictly without guaranteeing outcomes.
    Follows absolute legal safety guidelines.
    """
    if not GEMINI_API_KEY:
        # Strict deterministic fallback response
        return {
            "is_valid_chart": True,
            "identified_mistake": "Entering trade late into a strong parabolic candle after a support breakout.",
            "appropriate_entry_zone": "It seems appropriate to look for entry signals near the established Support Line or upon a consolidated pullback rather than chasing a rapid candle breakout.",
            "educational_analysis": "Chasing breakout candles often results in buying near local highs, exposing the capital to severe immediate drawdowns. Review candle closes and wait for consolidation.",
            "disclaimer": LEGAL_DISCLAIMER,
            "source": "Fallback Visual Analysis Engine"
        }

    try:
        # Decode the image
        img_bytes = base64.b64decode(base64_image_data)
        image_part = {
            "mime_type": "image/png",
            "data": img_bytes
        }

        prompt = """
        You are an elite educational trading coach ("Trade Doctor").
        Analyze this screenshot of a financial trading chart.
        The user wants to identify their trading entry mistake and find a more logical zone.

        CRITICAL COMPLIANCE AND SAFETY RULES:
        1. DO NOT use absolute statements like "You must enter here" or "This was a perfect entry."
        2. Instead, use soft, educational language such as: "It seems appropriate to initiate entry near...", "There is an increased probability of support near...", "A logical area to monitor would be...".
        3. Explain any clear visual mistakes (e.g. chasing massive candles, entering directly into major resistance zones, buying into overbought indicators).
        4. Focus heavily on candlestick structures, support/resistance alignments, and indicator clues.

        Output strictly a JSON object with this schema:
        {
            "is_valid_chart": true,
            "identified_mistake": "Description of the user's apparent entry mistake or trade location relative to candles.",
            "appropriate_entry_zone": "A soft suggestion of where it seems appropriate to have taken or monitored the trade.",
            "educational_analysis": "A detailed educational breakdown of candle boundaries, wick rejections, and indicator signals present in the chart."
        }
        """

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content([image_part, prompt])
        text = response.text.strip()

        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        ai_data = json.loads(text)
        return {
            "is_valid_chart": ai_data.get("is_valid_chart", True),
            "identified_mistake": ai_data.get("identified_mistake", "Chasing late-stage breakout momentum."),
            "appropriate_entry_zone": ai_data.get("appropriate_entry_zone", "It seems appropriate to consider entries near support structures rather than chasing wicks."),
            "educational_analysis": ai_data.get("educational_analysis", "Review candle configurations and wait for confirmed closes before acting."),
            "disclaimer": LEGAL_DISCLAIMER,
            "source": "Gemini Multimodal Analysis"
        }
    except Exception as e:
        # Fallback in case of exceptions
        return {
            "is_valid_chart": True,
            "identified_mistake": f"Chasing momentum wicks. Analysis limited due to visual parser: {str(e)}",
            "appropriate_entry_zone": "It seems appropriate to wait for pullbacks to historical support levels to manage downside risk.",
            "educational_analysis": "Look for candlestick validation close to moving averages. This ensures tighter stop-losses and higher win ratios.",
            "disclaimer": LEGAL_DISCLAIMER,
            "source": "Fallback Visual Analysis Engine"
        }
