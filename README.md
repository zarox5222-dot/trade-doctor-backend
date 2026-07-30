# Trade Doctor Backend

Trade Doctor is a comprehensive technical analysis and AI-driven trading assistant backend. Built with Python and Flask, it fetches historical and real-time market data (stocks, crypto, etc.) using `yfinance`, calculates key technical indicators (SMA, EMA, RSI, and MACD) using `pandas`, and uses the Google Gemini API to generate professional trading signals and detailed rationales.

---

## Architecture Overview

1. **`app.py`**: The main Flask server exposing REST API endpoints for application health, technical-indicator-augmented historical market data, and AI-driven signals.
2. **`data_fetcher.py`**: Integration layer with `yfinance` to fetch historical prices and current real-time metrics.
3. **`indicator_engine.py`**: Pandas-driven technical computation module to calculate Moving Averages (SMA/EMA), Relative Strength Index (RSI), and Moving Average Convergence Divergence (MACD).
4. **`ai_signal.py`**: Core AI processing module that constructs detailed analysis prompts and integrates with the `google-generativeai` package to fetch market-signal responses from the `gemini-1.5-flash` model. Includes a smart, rule-based indicator fallback engine when API keys are not provided.
5. **`tests.py`**: Unittest suite verifying calculation logic, fallbacks, and REST endpoint routes.

---

## Requirements and Installation

Make sure you have Python 3.8+ installed on your machine.

1. **Clone the Repository** (or locate the files).
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## Configuration

To enable real Gemini AI trading signals, you must set either `GEMINI_API_KEY` or `GOOGLE_API_KEY` in your environment.

### Linux/macOS
```bash
export GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### Windows (Command Prompt)
```cmd
set GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Windows (PowerShell)
```powershell
$env:GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

*Note: If no API key is set, the system seamlessly falls back to a deterministic, rule-based indicator engine to ensure consistent functionality without crashing.*

---

## Running the Server

Start the Flask development server on the default port (5000):
```bash
python app.py
```

To run on a custom port, set the `PORT` environment variable:
```bash
PORT=8080 python app.py
```

---

## API Documentation and Endpoints

### 1. Health Check
* **Endpoint**: `/api/health`
* **Method**: `GET`
* **Response**:
  ```json
  {
    "app": "Trade Doctor Backend API",
    "status": "healthy",
    "version": "1.0.0"
  }
  ```

### 2. Market Data & Technical Indicators
* **Endpoint**: `/api/market-data`
* **Method**: `GET`
* **Query Parameters**:
  * `ticker` (Optional): The stock or cryptocurrency symbol (e.g., `AAPL`, `BTC-USD`). Default is `AAPL`.
  * `period` (Optional): Historical time-horizon (e.g., `1d`, `5d`, `1mo`, `3mo`, `1y`). Default is `1mo`.
  * `interval` (Optional): Data frequency/interval (e.g., `1m`, `5m`, `1h`, `1d`). Default is `1d`.
* **Sample URL**: `http://localhost:5000/api/market-data?ticker=BTC-USD&period=3mo`
* **Response Structure**:
  ```json
  {
    "ticker": "BTC-USD",
    "period": "3mo",
    "interval": "1d",
    "realtime_details": {
      "ticker": "BTC-USD",
      "current_price": 98450.25,
      "open": 97800.00,
      "day_high": 99100.00,
      "day_low": 97350.00,
      "previous_close": 97790.00,
      "volume": 25400100000,
      "currency": "USD"
    },
    "history": [
      {
        "Date": "2023-11-01",
        "Open": 34500.0,
        "High": 35100.0,
        "Low": 34200.0,
        "Close": 34900.0,
        "Volume": 18500000000,
        "SMA_20": null,
        "SMA_50": null,
        "SMA_200": null,
        "EMA_20": 34900.0,
        "RSI_14": null,
        "MACD": 0.0,
        "MACD_Signal": 0.0,
        "MACD_Hist": 0.0
      }
      // ... more daily items with completed indicator values ...
    ]
  }
  ```

### 3. AI Signal Generator
* **Endpoint**: `/api/ai-signal`
* **Method**: `GET`
* **Query Parameters**:
  * `ticker` (Optional): The asset symbol to analyze (e.g., `AAPL`, `ETH-USD`). Default is `AAPL`.
* **Sample URL**: `http://localhost:5000/api/ai-signal?ticker=AAPL`
* **Response Structure**:
  ```json
  {
    "ticker": "AAPL",
    "signal": "BUY",
    "confidence": "High",
    "rationale": "RSI is near 35 showing strong support and MACD signal line is crossing upwards, indicating momentum is returning. Support at 200-day SMA is holding strong.",
    "indicator_snapshot": {
      "close_price": 182.52,
      "rsi_14": 35.4,
      "macd": 0.45,
      "macd_signal": 0.38,
      "sma_20": 185.2,
      "sma_50": 180.1,
      "sma_200": 178.5
    },
    "source": "Gemini AI"
  }
  ```

---

## Running the Tests

To run the complete unit test suite verifying technical calculations, mock data, and routing responses:
```bash
python -m unittest tests.py
```
