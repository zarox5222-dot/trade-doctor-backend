import os
import json
import pandas as pd
import google.generativeai as genai
from typing import Dict, Any, Optional

# Configure Gemini model and client if environment key is provided
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to configure Google Generative AI client: {e}")


def _generate_mock_signal(ticker: str, rsi: Optional[float], macd: Optional[float], macd_signal: Optional[float], close_price: Optional[float]) -> Dict[str, Any]:
    """
    Fallback deterministic mock signal generator when Gemini API is unavailable.
    """
    # Simple rule-based logic for mock signal
    signal = "HOLD"
    confidence = "Low (Fallback)"
    rationale = "Technical indicators are neutral. No strong trend identified."

    if rsi is not None:
        if rsi < 30:
            signal = "BUY"
            confidence = "Medium (Fallback)"
            rationale = f"RSI is extremely low ({rsi:.2f}), indicating the asset is oversold. Potential rebound expected."
        elif rsi > 70:
            signal = "SELL"
            confidence = "Medium (Fallback)"
            rationale = f"RSI is extremely high ({rsi:.2f}), indicating the asset is overbought. Corrective pullback likely."
        elif macd is not None and macd_signal is not None:
            if macd > macd_signal and rsi < 55:
                signal = "BUY"
                confidence = "Medium (Fallback)"
                rationale = f"MACD line crossed above the signal line (Bullish crossover) with supportive RSI ({rsi:.2f})."
            elif macd < macd_signal and rsi > 45:
                signal = "SELL"
                confidence = "Medium (Fallback)"
                rationale = f"MACD line crossed below the signal line (Bearish crossover) with vulnerable RSI ({rsi:.2f})."

    return {
        "ticker": ticker,
        "signal": signal,
        "confidence": confidence,
        "rationale": rationale,
        "indicator_snapshot": {
            "close_price": close_price,
            "rsi_14": rsi,
            "macd": macd,
            "macd_signal": macd_signal
        },
        "source": "Fallback Rule Engine"
    }


def generate_ai_signal(ticker: str, df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate an AI trading signal (BUY, SELL, HOLD) using Gemini model or fallback mock engine.

    Parameters:
        ticker (str): Asset ticker symbol.
        df (pd.DataFrame): Historical price DataFrame with indicator columns appended.

    Returns:
        Dict[str, Any]: Detailed trading analysis with signal, confidence, rationale, snapshot, and source.
    """
    if df.empty:
        return {
            "ticker": ticker,
            "signal": "HOLD",
            "confidence": "None",
            "rationale": "No market data available to generate signal.",
            "indicator_snapshot": {},
            "source": "Error fallback"
        }

    # Extract latest row of data for indicators
    latest_row = df.iloc[-1]

    # Safely retrieve indicator values
    close_price = float(latest_row.get("Close")) if "Close" in latest_row else None
    rsi = float(latest_row.get("RSI_14")) if "RSI_14" in latest_row and not pd.isna(latest_row.get("RSI_14")) else None
    macd = float(latest_row.get("MACD")) if "MACD" in latest_row and not pd.isna(latest_row.get("MACD")) else None
    macd_signal = float(latest_row.get("MACD_Signal")) if "MACD_Signal" in latest_row and not pd.isna(latest_row.get("MACD_Signal")) else None
    sma_20 = float(latest_row.get("SMA_20")) if "SMA_20" in latest_row and not pd.isna(latest_row.get("SMA_20")) else None
    sma_50 = float(latest_row.get("SMA_50")) if "SMA_50" in latest_row and not pd.isna(latest_row.get("SMA_50")) else None
    sma_200 = float(latest_row.get("SMA_200")) if "SMA_200" in latest_row and not pd.isna(latest_row.get("SMA_200")) else None

    # Fallback if API Key is not set
    if not GEMINI_API_KEY:
        return _generate_mock_signal(ticker, rsi, macd, macd_signal, close_price)

    # Prepare prompt for Gemini
    prompt = f"""
    You are a professional financial trading AI assistant ("Trade Doctor").
    Analyze the following market data and technical indicators for {ticker} to generate a Trading Signal:
    - Latest Close Price: {close_price}
    - Relative Strength Index (RSI 14): {rsi}
    - MACD Line: {macd}
    - MACD Signal Line: {macd_signal}
    - 20-Day SMA: {sma_20}
    - 50-Day SMA: {sma_50}
    - 200-Day SMA: {sma_200}

    Based on this data, issue one of the following trading actions: BUY, SELL, or HOLD.
    Provide a solid trade rationale explaining the interaction of these technical indicators and a confidence score (Low, Medium, or High).

    Respond strictly in JSON format. Do not write any markdown code blocks, backticks, or other text outside the JSON. The JSON schema must be:
    {{
        "ticker": "{ticker}",
        "signal": "BUY" | "SELL" | "HOLD",
        "confidence": "Low" | "Medium" | "High",
        "rationale": "Detailed explanation of technical analysis indicators combined with trading signals."
    }}
    """

    try:
        # Use newer gemini model
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Clean potential markdown block formatting from model response
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
            # Fallback parser to extract JSON bounds
            try:
                ai_data = json.loads(text[:e.pos])
            except Exception:
                # If still failing, attempt parsing with index-of find
                start_idx = text.find("{")
                end_idx = text.rfind("}")
                if start_idx != -1 and end_idx != -1:
                    ai_data = json.loads(text[start_idx:end_idx + 1])
                else:
                    raise e

        # Ensure correct structure is returned
        return {
            "ticker": ticker,
            "signal": ai_data.get("signal", "HOLD").upper(),
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
            "source": "Gemini AI"
        }
    except Exception as api_err:
        print(f"Gemini API request failed: {api_err}. Falling back to Rule Engine.")
        fallback_res = _generate_mock_signal(ticker, rsi, macd, macd_signal, close_price)
        fallback_res["error"] = str(api_err)
        return fallback_res
