import pandas as pd
import numpy as np
from typing import List, Dict, Any


def calculate_sma(df: pd.DataFrame, column: str = "Close", period: int = 20) -> pd.Series:
    """
    Calculate Simple Moving Average (SMA) strictly aligned with candle timestamps.
    """
    if df.empty or len(df) < period:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)
    return df[column].rolling(window=period).mean()


def calculate_ema(df: pd.DataFrame, column: str = "Close", period: int = 20) -> pd.Series:
    """
    Calculate Exponential Moving Average (EMA) strictly aligned with candle timestamps.
    """
    if df.empty or len(df) < period:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)
    return df[column].ewm(span=period, adjust=False).mean()


def calculate_rsi(df: pd.DataFrame, column: str = "Close", period: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index (RSI) strictly aligned with candle boundaries.
    """
    if df.empty or len(df) < period + 1:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)

    delta = df[column].diff()
    gain = (delta.where(delta > 0, 0)).copy()
    loss = (-delta.where(delta < 0, 0)).copy()

    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    for i in range(period, len(df)):
        if i == period:
            continue
        avg_gain.iloc[i] = (avg_gain.iloc[i - 1] * (period - 1) + gain.iloc[i]) / period
        avg_loss.iloc[i] = (avg_loss.iloc[i - 1] * (period - 1) + loss.iloc[i]) / period

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    rsi = rsi.replace([np.inf, -np.inf], 100)
    rsi.iloc[:period] = np.nan
    return rsi


def calculate_macd(df: pd.DataFrame, column: str = "Close", fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> pd.DataFrame:
    """
    Calculate MACD strictly aligned with candle records to prevent offsets.
    """
    if df.empty or len(df) < slow_period:
        empty_series = pd.Series([np.nan] * len(df), index=df.index, dtype=float)
        return pd.DataFrame({
            "MACD": empty_series,
            "Signal": empty_series,
            "Hist": empty_series
        }, index=df.index)

    fast_ema = df[column].ewm(span=fast_period, adjust=False).mean()
    slow_ema = df[column].ewm(span=slow_period, adjust=False).mean()

    macd_line = fast_ema - slow_ema
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    histogram = macd_line - signal_line

    return pd.DataFrame({
        "MACD": macd_line,
        "Signal": signal_line,
        "Hist": histogram
    }, index=df.index)


def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Calculate Average True Range (ATR) strictly aligned with high/low bounds of the candles.
    """
    if df.empty or len(df) < period + 1:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)

    high = df["High"]
    low = df["Low"]
    close_prev = df["Close"].shift(1)

    tr1 = high - low
    tr2 = (high - close_prev).abs()
    tr3 = (low - close_prev).abs()

    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr


def calculate_reversal_probability(df: pd.DataFrame) -> float:
    """
    Calculate Oversold/Overbought Divergence and Reversal Probability Index.
    Does not guarantee outcomes; serves as a technical probabilistic tool.
    """
    if df.empty or "Close" not in df.columns:
        return 50.0

    rsi_series = calculate_rsi(df)
    if rsi_series.empty or pd.isna(rsi_series.iloc[-1]):
        return 50.0

    latest_rsi = rsi_series.iloc[-1]

    if latest_rsi < 30:
        prob = 50.0 + (30.0 - latest_rsi) * 2.0
    elif latest_rsi > 70:
        prob = 50.0 + (latest_rsi - 70.0) * 2.0
    else:
        prob = 30.0 + abs(latest_rsi - 50.0) * 0.5

    return float(np.clip(prob, 0.0, 95.0))


def estimate_risk_reward_zones(df: pd.DataFrame) -> dict:
    """
    Estimate Support and Resistance zones strictly relative to Candle high, low, and ATR.
    """
    if df.empty:
        return {"support_zone": None, "resistance_zone": None, "stop_loss_zone": None, "atr": None}

    latest_close = float(df["Close"].iloc[-1])
    atr_series = calculate_atr(df)
    latest_atr = atr_series.iloc[-1] if not atr_series.empty else None

    if pd.isna(latest_atr) or latest_atr is None:
        latest_atr = latest_close * 0.02

    support_zone = latest_close - (1.5 * latest_atr)
    resistance_zone = latest_close + (1.5 * latest_atr)
    stop_loss_zone = latest_close - (2.0 * latest_atr)

    return {
        "support_zone": float(support_zone),
        "resistance_zone": float(resistance_zone),
        "stop_loss_zone": float(stop_loss_zone),
        "atr": float(latest_atr)
    }


def detect_gaps_and_trends(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Scan historical series to identify:
    1. Market gaps (price gap-up / gap-down between previous close and current open).
    2. Major support/resistance breakouts.
    3. Macro trend signals.
    """
    if len(df) < 5:
        return {
            "recent_gaps": [],
            "macro_trend": "Neutral",
            "breakout_detected": False,
            "breakout_direction": None
        }

    # Clean and align candles
    df_clean = df.copy()

    # 1. Detect Recent Gaps (past 5 periods)
    recent_gaps = []
    for i in range(len(df_clean) - 5, len(df_clean)):
        if i <= 0:
            continue
        prev_close = float(df_clean["Close"].iloc[i - 1])
        curr_open = float(df_clean["Open"].iloc[i])

        # Calculate gap %
        gap_pct = ((curr_open - prev_close) / prev_close) * 100.0
        if abs(gap_pct) >= 0.5: # 0.5% gap threshold
            gap_type = "Gap Up" if gap_pct > 0 else "Gap Down"
            recent_gaps.append({
                "index_position": i,
                "gap_type": gap_type,
                "gap_percentage": float(f"{gap_pct:.2f}"),
                "previous_close": prev_close,
                "current_open": curr_open
            })

    # 2. Breakout Detector
    # Check if latest Close broke above resistance (e.g., rolling high of past 20 candles)
    latest_close = float(df_clean["Close"].iloc[-1])
    latest_high = float(df_clean["High"].iloc[-1])
    latest_low = float(df_clean["Low"].iloc[-1])

    # Use rolling 20 period excluding latest row
    rolling_subset = df_clean.iloc[-21:-1]
    breakout_detected = False
    breakout_direction = None

    if len(rolling_subset) >= 10:
        resistance_line = float(rolling_subset["High"].max())
        support_line = float(rolling_subset["Low"].min())

        if latest_close > resistance_line:
            breakout_detected = True
            breakout_direction = "Bullish Breakout (Resistance Crossed)"
        elif latest_close < support_line:
            breakout_detected = True
            breakout_direction = "Bearish Breakout (Support Violated)"

    # 3. Macro Trend Calculation
    # Determine trend via Simple Moving Average slope
    sma_20 = calculate_sma(df_clean, period=20)
    if not sma_20.empty and not pd.isna(sma_20.iloc[-1]) and not pd.isna(sma_20.iloc[-5]):
        slope = sma_20.iloc[-1] - sma_20.iloc[-5]
        if slope > 0.05 * sma_20.iloc[-1] / 100.0:
            macro_trend = "Bullish Uptrend"
        elif slope < -0.05 * sma_20.iloc[-1] / 100.0:
            macro_trend = "Bearish Downtrend"
        else:
            macro_trend = "Sideways / Consolidation"
    else:
        macro_trend = "Insufficient Data"

    return {
        "recent_gaps": recent_gaps,
        "macro_trend": macro_trend,
        "breakout_detected": breakout_detected,
        "breakout_direction": breakout_direction
    }


def calculate_position_sizing(account_size: float, risk_percentage: float, entry_price: float, stop_loss_price: float) -> dict:
    """
    Standard professional Capital Sizing Calculator.
    Calculates recommended position sizes based on user's input risk percentage.
    """
    if account_size <= 0 or risk_percentage <= 0 or entry_price <= 0 or stop_loss_price <= 0:
        return {"units": 0, "total_capital_at_risk": 0.0, "position_value": 0.0}

    if risk_percentage > 1.0:
        risk_decimal = risk_percentage / 100.0
    else:
        risk_decimal = risk_percentage

    capital_at_risk = account_size * risk_decimal
    risk_per_unit = abs(entry_price - stop_loss_price)

    if risk_per_unit == 0:
        return {"units": 0, "total_capital_at_risk": 0.0, "position_value": 0.0}

    units = capital_at_risk / risk_per_unit
    position_value = units * entry_price

    return {
        "units": int(np.floor(units)),
        "total_capital_at_risk": float(capital_at_risk),
        "position_value": float(position_value)
    }


def append_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Append technical indicators to the DataFrame and return it.
    """
    if df.empty or "Close" not in df.columns:
        return df

    df_indicators = df.copy()
    df_indicators["SMA_20"] = calculate_sma(df, period=20)
    df_indicators["SMA_50"] = calculate_sma(df, period=50)
    df_indicators["SMA_200"] = calculate_sma(df, period=200)
    df_indicators["EMA_20"] = calculate_ema(df, period=20)
    df_indicators["RSI_14"] = calculate_rsi(df, period=14)

    macd_df = calculate_macd(df)
    df_indicators["MACD"] = macd_df["MACD"]
    df_indicators["MACD_Signal"] = macd_df["Signal"]
    df_indicators["MACD_Hist"] = macd_df["Hist"]

    return df_indicators
