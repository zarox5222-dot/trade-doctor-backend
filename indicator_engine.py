import pandas as pd
import numpy as np


def calculate_sma(df: pd.DataFrame, column: str = "Close", period: int = 20) -> pd.Series:
    """
    Calculate Simple Moving Average (SMA) with fallback for inputs with fewer rows.
    """
    if df.empty or len(df) < period:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)
    return df[column].rolling(window=period).mean()


def calculate_ema(df: pd.DataFrame, column: str = "Close", period: int = 20) -> pd.Series:
    """
    Calculate Exponential Moving Average (EMA) with fallback for inputs with fewer rows.
    """
    if df.empty or len(df) < period:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)
    return df[column].ewm(span=period, adjust=False).mean()


def calculate_rsi(df: pd.DataFrame, column: str = "Close", period: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index (RSI) with safety checks.
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
    Calculate Moving Average Convergence Divergence (MACD) with safety checks.
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
    Calculate Average True Range (ATR) for risk/reward estimations.
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
    Calculate Oversold/Overbought Divergence and Trend Reversal Probability Index (0% to 100%).
    This calculations does not guarantee outcomes, acting strictly as a probabilistic technical estimator.
    """
    if df.empty or "Close" not in df.columns:
        return 50.0 # Neutral

    rsi_series = calculate_rsi(df)
    if rsi_series.empty or pd.isna(rsi_series.iloc[-1]):
        return 50.0

    latest_rsi = rsi_series.iloc[-1]

    # Simple probabilistic calculation:
    # High reversal probability if RSI is extremely overbought (> 75) or oversold (< 25)
    if latest_rsi < 30:
        # Oversold -> probability of upward reversal increases as RSI gets lower
        prob = 50.0 + (30.0 - latest_rsi) * 2.0
    elif latest_rsi > 70:
        # Overbought -> probability of downward reversal increases as RSI gets higher
        prob = 50.0 + (latest_rsi - 70.0) * 2.0
    else:
        prob = 30.0 + abs(latest_rsi - 50.0) * 0.5 # lower base prob around neutral 50

    return float(np.clip(prob, 0.0, 95.0))


def estimate_risk_reward_zones(df: pd.DataFrame) -> dict:
    """
    Estimate dynamic Support and Resistance zones using Average True Range (ATR)
    without guaranteeing absolute outcomes.
    """
    if df.empty:
        return {"support_zone": None, "resistance_zone": None, "stop_loss_zone": None, "atr": None}

    latest_close = float(df["Close"].iloc[-1])
    atr_series = calculate_atr(df)
    latest_atr = atr_series.iloc[-1] if not atr_series.empty else None

    if pd.isna(latest_atr) or latest_atr is None:
        # Fallback if ATR is not calculated yet
        latest_atr = latest_close * 0.02 # 2% fallback ATR

    support_zone = latest_close - (1.5 * latest_atr)
    resistance_zone = latest_close + (1.5 * latest_atr)
    stop_loss_zone = latest_close - (2.0 * latest_atr)

    return {
        "support_zone": float(support_zone),
        "resistance_zone": float(resistance_zone),
        "stop_loss_zone": float(stop_loss_zone),
        "atr": float(latest_atr)
    }


def calculate_position_sizing(account_size: float, risk_percentage: float, entry_price: float, stop_loss_price: float) -> dict:
    """
    Standard professional Capital Sizing Calculator.
    Calculates recommended position sizes based on user's input risk percentage.
    """
    if account_size <= 0 or risk_percentage <= 0 or entry_price <= 0 or stop_loss_price <= 0:
        return {"units": 0, "total_capital_at_risk": 0.0, "position_value": 0.0}

    # Ensure risk percent is as decimal (e.g. 2% -> 0.02)
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
