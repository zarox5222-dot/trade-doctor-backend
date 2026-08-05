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
        dates = pd.date_range(start="2023-01-01", periods=50, freq="D")
        self.mock_df = pd.DataFrame({
            "Close": [float(x) for x in range(10, 60)],
            "Open": [float(x - 0.5) for x in range(10, 60)],
            "High": [float(x + 1) for x in range(10, 60)],
            "Low": [float(x - 1) for x in range(10, 60)],
            "Volume": [1000 * x for x in range(10, 60)]
        }, index=dates)

    def test_sma_calculation(self):
        sma_20 = indicator_engine.calculate_sma(self.mock_df, period=20)
        self.assertEqual(len(sma_20), 50)
        self.assertTrue(np.isnan(sma_20.iloc[18]))
        self.assertFalse(np.isnan(sma_20.iloc[19]))
        self.assertAlmostEqual(sma_20.iloc[19], sum(range(10, 30)) / 20.0)

    def test_ema_calculation(self):
        ema_20 = indicator_engine.calculate_ema(self.mock_df, period=20)
        self.assertEqual(len(ema_20), 50)
        self.assertFalse(np.isnan(ema_20.iloc[19]))

    def test_rsi_calculation(self):
        rsi = indicator_engine.calculate_rsi(self.mock_df, period=14)
        self.assertEqual(len(rsi), 50)
        self.assertTrue(np.isnan(rsi.iloc[13]))
        self.assertGreater(rsi.iloc[14], 99.0)

    def test_macd_calculation(self):
        macd_df = indicator_engine.calculate_macd(self.mock_df)
        self.assertIn("MACD", macd_df.columns)
        self.assertIn("Signal", macd_df.columns)
        self.assertIn("Hist", macd_df.columns)
        self.assertEqual(len(macd_df), 50)

    def test_atr_calculation(self):
        atr = indicator_engine.calculate_atr(self.mock_df, period=14)
        self.assertEqual(len(atr), 50)
        self.assertTrue(np.isnan(atr.iloc[12]))
        self.assertFalse(np.isnan(atr.iloc[13]))

    def test_reversal_probability(self):
        prob = indicator_engine.calculate_reversal_probability(self.mock_df)
        self.assertTrue(0.0 <= prob <= 100.0)

    def test_estimate_risk_reward_zones(self):
        zones = indicator_engine.estimate_risk_reward_zones(self.mock_df)
        self.assertIn("support_zone", zones)
        self.assertIn("resistance_zone", zones)
        self.assertIn("stop_loss_zone", zones)
        self.assertIsNotNone(zones["support_zone"])

    def test_detect_gaps_and_trends_calculation(self):
        results = indicator_engine.detect_gaps_and_trends(self.mock_df)
        self.assertIn("recent_gaps", results)
        self.assertIn("macro_trend", results)
        self.assertIn("breakout_detected", results)

    def test_volume_z_score(self):
        z_score = indicator_engine.calculate_volume_z_score(self.mock_df)
        self.assertTrue(z_score > 0)

    def test_calculate_trade_health_score(self):
        res = indicator_engine.calculate_trade_health_score(self.mock_df)
        self.assertIn("score", res)
        self.assertIn("status", res)
        self.assertIn("volume_spike_ratio", res)

    def test_estimate_atr_stops(self):
        stops = indicator_engine.estimate_atr_stops(150, 3.5)
        self.assertEqual(stops["entry_price"], 150.0)
        self.assertEqual(stops["stop_loss"], 143.0)
        self.assertEqual(stops["take_profit_1_2"], 164.0)

    def test_position_sizing(self):
        sizing = indicator_engine.calculate_position_sizing(10000, 2, 100, 95)
        self.assertEqual(sizing["units"], 40)
        self.assertAlmostEqual(sizing["total_capital_at_risk"], 200.0)
        self.assertAlmostEqual(sizing["position_value"], 4000.0)

    @patch("yfinance.Ticker")
    def test_fetch_historical_data_success(self, mock_ticker):
        mock_instance = MagicMock()
        mock_instance.history.return_value = self.mock_df
        mock_ticker.return_value = mock_instance

        res_df = data_fetcher.fetch_historical_data("AAPL")
        self.assertFalse(res_df.empty)
        self.assertEqual(len(res_df), 50)

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
        mock_instance.history.return_value = pd.DataFrame()
        mock_ticker.return_value = mock_instance

        details = data_fetcher.fetch_realtime_details("AAPL")
        self.assertEqual(details["ticker"], "AAPL")
        self.assertEqual(details["current_price"], 150.0)

    def test_ai_signal_fallback_legal_compliance(self):
        signal_data = ai_signal._generate_mock_signal("AAPL", rsi=25.0, macd=0.0, macd_signal=0.0, close_price=100.0)
        self.assertNotEqual(signal_data["probabilistic_estimate"], "BUY")
        self.assertNotEqual(signal_data["probabilistic_estimate"], "SELL")
        self.assertIn("disclaimer", signal_data)
        self.assertEqual(signal_data["disclaimer"], ai_signal.LEGAL_DISCLAIMER)

    def test_analyze_chart_image_api_fallback_compliance(self):
        analysis = ai_signal.analyze_chart_image("dW5pdHRlc3Q=")
        self.assertTrue(analysis["is_valid_chart"])
        self.assertIn("breakout", analysis["identified_mistake"].lower())
        self.assertIn("it seems appropriate", analysis["appropriate_entry_zone"].lower())
        self.assertIn("disclaimer", analysis)

    def test_ai_parse_screener_query(self):
        parsed = ai_signal.ai_parse_screener_query("tech stocks with RSI below 35 and unusual volume")
        self.assertEqual(parsed["rsi_less_than"], 35)
        self.assertEqual(parsed["sector"], "Tech")
        self.assertTrue(parsed["volume_spike_multiplier"] >= 1.5)

    @patch("google.generativeai.GenerativeModel")
    @patch("ai_signal.GEMINI_API_KEY", "mocked_key")
    def test_generate_ai_signal_with_gemini_mocked(self, mock_gen_model):
        mock_model_instance = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"ticker": "AAPL", "probabilistic_estimate": "High Probability Bullish Zone", "confidence": "High", "rationale": "Strong indicators."}'
        mock_model_instance.generate_content.return_value = mock_response
        mock_gen_model.return_value = mock_model_instance

        dummy_df = pd.DataFrame({
            "Close": [100.0],
            "RSI_14": [40.0],
            "MACD": [1.5],
            "MACD_Signal": [1.0]
        })

        res = ai_signal.generate_ai_signal("AAPL", dummy_df)
        self.assertEqual(res["ticker"], "AAPL")
        self.assertEqual(res["probabilistic_estimate"], "High Probability Bullish Zone")
        self.assertEqual(res["source"], "Gemini AI")

    def test_health_endpoint(self):
        client = app.app.test_client()
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(data["status"], "healthy")
        self.assertIn("disclaimer", data)

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
        response = client.get("/api/market-data?ticker=AAPL")
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(data["ticker"], "AAPL")
        self.assertIn("risk_reward_estimation", data)
        self.assertIn("trend_reversal_probability_percent", data)
        self.assertIn("disclaimer", data)

    def test_high_growth_assets_paywall_endpoint(self):
        client = app.app.test_client()
        response = client.get("/api/high-growth-assets")
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.data.decode("utf-8"))
        self.assertIn("assets", data)
        self.assertEqual(data["count_total"], 55)

        assets = data["assets"]
        self.assertFalse(assets[0]["is_locked"])
        self.assertFalse(assets[1]["is_locked"])
        self.assertIsNotNone(assets[0]["rsi"])
        self.assertIn("ui_metadata", assets[0])

        self.assertTrue(assets[2]["is_locked"])
        self.assertIsNone(assets[2]["rsi"])
        self.assertEqual(assets[2]["sentiment"], "[LOCKED]")
        self.assertIn("premium_gate_overlay", assets[2])
        self.assertEqual(assets[2]["premium_gate_overlay"]["price_usd"], 19.99)

    def test_position_sizing_endpoint(self):
        client = app.app.test_client()
        payload = {
            "account_size": 20000,
            "risk_percentage": 1.5,
            "entry_price": 150,
            "stop_loss_price": 140
        }
        response = client.post("/api/position-size", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(data["units"], 30)
        self.assertEqual(data["total_capital_at_risk"], 300.0)

    def test_post_analyze_chart_endpoint_success(self):
        client = app.app.test_client()
        payload = {
            "image_base64": "dW5pdHRlc3Q="
        }
        response = client.post("/api/analyze-chart", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertTrue(data["is_valid_chart"])
        self.assertIn("breakout", data["identified_mistake"].lower())
        self.assertIn("it seems appropriate", data["appropriate_entry_zone"].lower())
        self.assertEqual(data["disclaimer"], ai_signal.LEGAL_DISCLAIMER)

    @patch("app.fetch_historical_data")
    def test_get_market_gaps_trends_endpoint(self, mock_history):
        mock_history.return_value = self.mock_df
        client = app.app.test_client()
        response = client.get("/api/market-gaps-trends?ticker=AAPL")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(data["ticker"], "AAPL")
        self.assertIn("recent_gaps", data)
        self.assertIn("macro_trend", data)
        self.assertIn("breakout_detected", data)

    def test_post_screener_ai_search_endpoint_success(self):
        client = app.app.test_client()
        payload = {
            "query": "Find technology stocks with RSI under 40 and high volume",
            "is_premium": True
        }
        response = client.post("/api/screener/ai-search", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(data["original_query"], payload["query"])
        self.assertIn("matches", data)

    def test_get_smart_money_flow_premium(self):
        client = app.app.test_client()
        response = client.get("/api/smart-money/flow?is_premium=true")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertFalse(data["is_locked"])
        self.assertTrue(len(data["heatmap"]) > 0)

    @patch("app.fetch_historical_data")
    def test_get_trade_diagnostic_premium(self, mock_history):
        mock_history.return_value = self.mock_df
        client = app.app.test_client()
        response = client.get("/api/trade-diagnostic?ticker=AAPL&is_premium=true")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertEqual(data["ticker"], "AAPL")
        self.assertFalse(data["is_locked"])
        self.assertIn("atr_stop_loss_setup", data)

    def test_post_telegram_alert(self):
        client = app.app.test_client()
        payload = {
            "ticker": "AAPL",
            "chat_id": "12345"
        }
        response = client.post("/api/telegram/alert", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertTrue(data["success"])

    def test_post_auth_register_login(self):
        client = app.app.test_client()
        payload = {
            "email": "trader@saas.com",
            "provider": "email",
            "tier_level": 3
        }
        response = client.post("/api/auth/register-login", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode("utf-8"))
        self.assertTrue(data["success"])
        self.assertEqual(data["subscription_tier"]["name"], "Alpha Elite Tier")
        self.assertEqual(data["subscription_tier"]["price_usd"], 49.99)


if __name__ == "__main__":
    unittest.main()
