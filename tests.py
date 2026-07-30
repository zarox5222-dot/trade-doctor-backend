import unittest
import pandas as pd
import numpy as np
import json
from unittest.mock import patch, MagicMock

import data_fetcher
import indicator_engine
import ai_signal
import app


class TestTradeDoctorBackend(unittest.TestCase):

    def setUp(self):
        # Create a mock DataFrame with enough rows for RSI/MACD/SMA indicators
        dates = pd.date_range(start="2023-01-01", periods=50, freq="D")
        self.mock_df = pd.DataFrame({
            "Close": [float(x) for x in range(10, 60)],  # Linear increasing trend
            "Open": [float(x - 0.5) for x in range(10, 60)],
            "High": [float(x + 1) for x in range(10, 60)],
            "Low": [float(x - 1) for x in range(10, 60)],
            "Volume": [1000 * x for x in range(10, 60)]
        }, index=dates)

    # 1. Test Technical Indicator Engine Calculations
    def test_sma_calculation(self):
        sma_20 = indicator_engine.calculate_sma(self.mock_df, period=20)
        self.assertEqual(len(sma_20), 50)
        # First 19 entries should be NaN
        self.assertTrue(np.isnan(sma_20.iloc[18]))
        # 20th entry should have a value
        self.assertFalse(np.isnan(sma_20.iloc[19]))
        self.assertAlmostEqual(sma_20.iloc[19], sum(range(10, 30)) / 20.0)

    def test_ema_calculation(self):
        ema_20 = indicator_engine.calculate_ema(self.mock_df, period=20)
        self.assertEqual(len(ema_20), 50)
        # EMA handles first 19 elements too but technically we guard if len < period
        self.assertFalse(np.isnan(ema_20.iloc[19]))

    def test_rsi_calculation(self):
        rsi = indicator_engine.calculate_rsi(self.mock_df, period=14)
        self.assertEqual(len(rsi), 50)
        # First 14 should be NaN
        self.assertTrue(np.isnan(rsi.iloc[13]))
        # Since Close is strictly increasing, RSI should be extremely high (near 100)
        self.assertGreater(rsi.iloc[14], 99.0)

    def test_macd_calculation(self):
        macd_df = indicator_engine.calculate_macd(self.mock_df)
        self.assertIn("MACD", macd_df.columns)
        self.assertIn("Signal", macd_df.columns)
        self.assertIn("Hist", macd_df.columns)
        self.assertEqual(len(macd_df), 50)

    def test_append_all_indicators(self):
        df_ind = indicator_engine.append_all_indicators(self.mock_df)
        self.assertIn("SMA_20", df_ind.columns)
        self.assertIn("SMA_50", df_ind.columns)
        self.assertIn("SMA_200", df_ind.columns)
        self.assertIn("EMA_20", df_ind.columns)
        self.assertIn("RSI_14", df_ind.columns)
        self.assertIn("MACD", df_ind.columns)
        self.assertIn("MACD_Signal", df_ind.columns)
        self.assertIn("MACD_Hist", df_ind.columns)

    # 2. Test Data Fetcher Logic
    @patch("yfinance.Ticker")
    def test_fetch_historical_data_success(self, mock_ticker):
        # Set up a mock stock history DataFrame
        mock_instance = MagicMock()
        mock_instance.history.return_value = self.mock_df
        mock_ticker.return_value = mock_instance

        res_df = data_fetcher.fetch_historical_data("AAPL")
        self.assertFalse(res_df.empty)
        self.assertEqual(len(res_df), 50)
        mock_instance.history.assert_called_once_with(period="1mo", interval="1d")

    @patch("yfinance.Ticker")
    def test_fetch_realtime_details_fallback(self, mock_ticker):
        mock_instance = MagicMock()
        mock_instance.fast_info = {
            "lastPrice": 150.0,
            "open": 149.0,
            "dayHigh": 152.0,
            "dayLow": 148.0,
            "previousClose": 148.5,
            "lastVolume": 5000000,
            "currency": "USD"
        }
        mock_instance.history.return_value = pd.DataFrame() # empty today history
        mock_ticker.return_value = mock_instance

        details = data_fetcher.fetch_realtime_details("AAPL")
        self.assertEqual(details["ticker"], "AAPL")
        self.assertEqual(details["current_price"], 150.0)
        self.assertEqual(details["open"], 149.0)
        self.assertEqual(details["day_high"], 152.0)
        self.assertEqual(details["day_low"], 148.0)
        self.assertEqual(details["previous_close"], 148.5)
        self.assertEqual(details["volume"], 5000000)

    # 3. Test AI Signals Core & Fallback
    def test_ai_signal_fallback_rule_engine(self):
        # Trigger fallback BUY signal when RSI is oversold (< 30)
        rsi_val = 25.0
        signal_data = ai_signal._generate_mock_signal("AAPL", rsi=rsi_val, macd=0.0, macd_signal=0.0, close_price=100.0)
        self.assertEqual(signal_data["signal"], "BUY")
        self.assertEqual(signal_data["ticker"], "AAPL")
        self.assertIn("oversold", signal_data["rationale"].lower())
        self.assertEqual(signal_data["source"], "Fallback Rule Engine")

        # Trigger fallback SELL signal when RSI is overbought (> 70)
        rsi_val = 75.0
        signal_data2 = ai_signal._generate_mock_signal("AAPL", rsi=rsi_val, macd=0.0, macd_signal=0.0, close_price=100.0)
        self.assertEqual(signal_data2["signal"], "SELL")
        self.assertIn("overbought", signal_data2["rationale"].lower())

    @patch("google.generativeai.GenerativeModel")
    @patch("ai_signal.GEMINI_API_KEY", "mocked_key")
    def test_generate_ai_signal_with_gemini_mocked(self, mock_gen_model):
        # Configure model mock
        mock_model_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"ticker": "AAPL", "signal": "BUY", "confidence": "High", "rationale": "Strong indicators."}'
        mock_model_instance.generate_content.return_value = mock_response
        mock_gen_model.return_value = mock_model_instance

        # Prep a dummy DataFrame with latest row
        dummy_df = pd.DataFrame({
            "Close": [100.0],
            "RSI_14": [40.0],
            "MACD": [1.5],
            "MACD_Signal": [1.0]
        })

        res = ai_signal.generate_ai_signal("AAPL", dummy_df)
        self.assertEqual(res["ticker"], "AAPL")
        self.assertEqual(res["signal"], "BUY")
        self.assertEqual(res["confidence"], "High")
        self.assertEqual(res["source"], "Gemini AI")

    # 4. Test Flask REST API Endpoints
    def test_health_endpoint(self):
        client = app.app.test_client()
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(data["status"], "healthy")

    @patch("app.fetch_historical_data")
    @patch("app.fetch_realtime_details")
    def test_market_data_endpoint(self, mock_realtime, mock_history):
        mock_history.return_value = self.mock_df
        mock_realtime.return_value = {
            "ticker": "AAPL",
            "current_price": 50.0,
            "open": 49.5,
            "day_high": 51.0,
            "day_low": 48.5,
            "previous_close": 49.0,
            "volume": 1200000,
            "currency": "USD"
        }

        client = app.app.test_client()
        response = client.get("/api/market-data?ticker=AAPL&period=1mo&interval=1d")
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(data["ticker"], "AAPL")
        self.assertEqual(data["period"], "1mo")
        self.assertEqual(data["interval"], "1d")
        self.assertIn("realtime_details", data)
        self.assertEqual(data["realtime_details"]["current_price"], 50.0)
        self.assertIn("history", data)
        self.assertTrue(len(data["history"]) > 0)
        # Check that indicators are present in history records
        first_record = data["history"][-1]
        self.assertIn("SMA_20", first_record)
        self.assertIn("RSI_14", first_record)


if __name__ == "__main__":
    unittest.main()
