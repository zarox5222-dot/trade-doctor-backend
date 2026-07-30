import pandas as pd
import numpy as np


def calculate_sma(df: pd.DataFrame, column: str = "Close", period: int = 20) -> pd.Series:
    """
    Calculate Simple Moving Average (SMA).
    """
    if df.empty or len(df) < period:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)
    return df[column].rolling(window=period).mean()


def calculate_ema(df: pd.DataFrame, column: str = "Close", period: int = 20) -> pd.Series:
    """
    Calculate Exponential Moving Average (EMA).
    """
    if df.empty or len(df) < period:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)
    return df[column].ewm(span=period, adjust=False).mean()


def calculate_rsi(df: pd.DataFrame, column: str = "Close", period: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index (RSI).
    """
    if df.empty or len(df) < period + 1:
        return pd.Series([np.nan] * len(df), index=df.index, dtype=float)

    delta = df[column].diff()
    gain = (delta.where(delta > 0, 0)).copy()
    loss = (-delta.where(delta < 0, 0)).copy()

    # Wilder's smoothing/averaging
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    # First values
    for i in range(period, len(df)):
        if i == period:
            continue
        avg_gain.iloc[i] = (avg_gain.iloc[i - 1] * (period - 1) + gain.iloc[i]) / period
        avg_loss.iloc[i] = (avg_loss.iloc[i - 1] * (period - 1) + loss.iloc[i]) / period

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    # Replace division by zero/inf with 100 or 50
    rsi = rsi.replace([np.inf, -np.inf], 100)
    rsi.iloc[:period] = np.nan
    return rsi


def calculate_macd(df: pd.DataFrame, column: str = "Close", fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> pd.DataFrame:
    """
    Calculate Moving Average Convergence Divergence (MACD).
    Returns a DataFrame with columns: MACD, Signal, Hist.
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


def append_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Append technical indicators to the DataFrame and return it.
    Requires at least 'Close' column in DataFrame.
    """
    if df.empty or "Close" not in df.columns:
        return df

    # Copy to avoid SettingWithCopyWarning
    df_indicators = df.copy()

    # Calculate SMA (20, 50, 200)
    df_indicators["SMA_20"] = calculate_sma(df, period=20)
    df_indicators["SMA_50"] = calculate_sma(df, period=50)
    df_indicators["SMA_200"] = calculate_sma(df, period=200)

    # Calculate EMA (20)
    df_indicators["EMA_20"] = calculate_ema(df, period=20)

    # Calculate RSI (14)
    df_indicators["RSI_14"] = calculate_rsi(df, period=14)

    # Calculate MACD
    macd_df = calculate_macd(df)
    df_indicators["MACD"] = macd_df["MACD"]
    df_indicators["MACD_Signal"] = macd_df["Signal"]
    df_indicators["MACD_Hist"] = macd_df["Hist"]

    return df_indicators
