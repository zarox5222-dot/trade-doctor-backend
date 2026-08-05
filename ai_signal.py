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

LEGAL_DISCLAIMER = (
    "All signals, analytics, and scores are generated for informational/educational purposes only "
    "and do not constitute financial advice. Past performance is not indicative of future results."
)


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
    Recognizes classic candlestick book patterns and provides feedback.
    """
    if not GEMINI_API_KEY:
        return {
            "is_valid_chart": True,
            "identified_mistake": "Entering trade late into a strong parabolic candle after a support breakout.",
            "appropriate_entry_zone": "It seems appropriate to look for entry signals near the established Support Line or upon a consolidated pullback rather than chasing a rapid candle breakout.",
            "candlestick_book_pattern": "Hammer Candle Pullback Pattern",
            "educational_analysis": "This candlestick aligns closely with the 'Hammer Candle' layout found in classic trading literature. Chasing breakout candles often results in buying near local highs, exposing capital to severe immediate drawdowns.",
            "disclaimer": LEGAL_DISCLAIMER,
            "source": "Fallback Visual Analysis Engine"
        }

    try:
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
        4. Focus heavily on candlestick structures (e.g. Hammer, Shooting Star, Bullish Engulfing, Marubozu), support/resistance alignments, and standard literature patterns.

        Output strictly a JSON object with this schema:
        {
            "is_valid_chart": true,
            "identified_mistake": "Description of the user's apparent entry mistake or trade location relative to candles.",
            "appropriate_entry_zone": "A soft suggestion of where it seems appropriate to have taken or monitored the trade.",
            "candlestick_book_pattern": "Name of the detected classic candlestick pattern (e.g. Bullish Engulfing, Hammer Rejection, Bearish Marubozu)",
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
            "candlestick_book_pattern": ai_data.get("candlestick_book_pattern", "Classic Candle Reversal"),
            "educational_analysis": ai_data.get("educational_analysis", "Review candle configurations and wait for confirmed closes before acting."),
            "disclaimer": LEGAL_DISCLAIMER,
            "source": "Gemini Multimodal Analysis"
        }
    except Exception as e:
        return {
            "is_valid_chart": True,
            "identified_mistake": f"Chasing momentum wicks. Analysis limited due to visual parser: {str(e)}",
            "appropriate_entry_zone": "It seems appropriate to wait for pullbacks to historical support levels to manage downside risk.",
            "candlestick_book_pattern": "Standard Candlestick Pattern",
            "educational_analysis": "Look for candlestick validation close to moving averages. This ensures tighter stop-losses and higher win ratios.",
            "disclaimer": LEGAL_DISCLAIMER,
            "source": "Fallback Visual Analysis Engine"
        }


def ai_parse_screener_query(user_query: str) -> Dict[str, Any]:
    """
    Conversational Natural Language Screener: Parses conversational requests
    (e.g., "Find technology stocks with RSI under 40 and unusual volume")
    into structured pandas query parameters.
    """
    # Deterministic fallback parser
    fallback_result = {
        "rsi_less_than": None,
        "rsi_greater_than": None,
        "volume_spike_multiplier": None,
        "market": None,
        "sector": None,
        "explanation": f"Screener query processed: filtering assets matching conversational patterns."
    }

    query_lower = user_query.lower()

    # Simple rule based checks for fallback compatibility
    if "rsi" in query_lower:
        if "under" in query_lower or "below" in query_lower or "<" in query_lower:
            # find first number
            words = query_lower.split()
            for w in words:
                cleaned = "".join(filter(str.isdigit, w))
                if cleaned:
                    fallback_result["rsi_less_than"] = int(cleaned)
                    break
            if not fallback_result["rsi_less_than"]:
                fallback_result["rsi_less_than"] = 40
        elif "above" in query_lower or "over" in query_lower or ">" in query_lower:
            words = query_lower.split()
            for w in words:
                cleaned = "".join(filter(str.isdigit, w))
                if cleaned:
                    fallback_result["rsi_greater_than"] = int(cleaned)
                    break
            if not fallback_result["rsi_greater_than"]:
                fallback_result["rsi_greater_than"] = 70

    if "volume" in query_lower:
        fallback_result["volume_spike_multiplier"] = 2.5 if "unusual" in query_lower or "high" in query_lower or "spike" in query_lower else 1.5

    if "tech" in query_lower or "technology" in query_lower:
        fallback_result["sector"] = "Tech"
    elif "crypto" in query_lower:
        fallback_result["sector"] = "Crypto"
    elif "finance" in query_lower or "bank" in query_lower:
        fallback_result["sector"] = "Finance"

    if "india" in query_lower:
        fallback_result["market"] = "India"
    elif "global" in query_lower or "us" in query_lower:
        fallback_result["market"] = "Global"

    if not GEMINI_API_KEY:
        return fallback_result

    try:
        prompt = f"""
        You are an advanced financial screener parser.
        Translate this natural language user query into structured stock filter parameters:
        "{user_query}"

        Return strictly a JSON object with this schema:
        {{
            "rsi_less_than": integer or null,
            "rsi_greater_than": integer or null,
            "volume_spike_multiplier": float or null,
            "market": "Global" | "India" | null,
            "sector": "Tech" | "Crypto" | "Finance" | "Automotive" | "Energy" | "Semiconductors" | null,
            "explanation": "A 1-sentence AI Summary explaining why matching companies satisfy these parameters."
        }}
        """

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

        ai_data = json.loads(text)
        return {
            "rsi_less_than": ai_data.get("rsi_less_than"),
            "rsi_greater_than": ai_data.get("rsi_greater_than"),
            "volume_spike_multiplier": ai_data.get("volume_spike_multiplier"),
            "market": ai_data.get("market"),
            "sector": ai_data.get("sector"),
            "explanation": ai_data.get("explanation", "Matches custom technical momentum conditions.")
        }
    except Exception:
        return fallback_result
