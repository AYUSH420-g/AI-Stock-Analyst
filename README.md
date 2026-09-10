# AlphaAgent - AI Stock Market Simulator & Research Platform

A modern, full-stack **AI Stock Market Simulator and Research Platform** built with **React, TypeScript, Python, FastAPI, PostgreSQL (with SQLite zero-config fallback), and LangGraph multi-agent orchestration**.

> ⚠️ **Educational & Paper-Trading Platform**: All trades, portfolio values, and multi-agent recommendations are virtual simulations. This software is designed strictly for research, educational, and decision-support demonstration purposes and does not execute real-world financial transactions.

---

## 🌟 Key Architecture & Features

### 1. Multi-Agent AI Research Committee (LangGraph)
A coordinated 5-agent state graph pipeline that analyzes any stock symbol and generates structured Pydantic research reports:
1. **Technical Analyst Agent**: Evaluates price trends, RSI momentum (oversold/overbought), SMA 20/50/200 crossovers, MACD momentum, and Bollinger Bands support/resistance.
2. **Fundamental Analyst Agent**: Analyzes valuation multiples (P/E, P/B, EPS), profit margins, balance sheet health (Debt-to-Equity), and free cash flow generation.
3. **News & Sentiment Analyst Agent**: Scans recent news headlines, media coverage, and institutional momentum sentiment.
4. **Risk & Volatility Analyst Agent**: Quantifies equity Beta, downside vulnerability, tail risk, and calculates dynamic stop-loss levels.
5. **Portfolio Manager Agent**: Synthesizes the committee findings into an overall rating (`STRONG_BUY`, `BUY`, `HOLD`, `SELL`, `STRONG_SELL`), 12-month target price, confidence score, and tailored portfolio allocation limit.

### 2. Conversational AI Advisor with Memory & Tool Calling
- **Short-Term Conversational Memory**: Retains multi-turn dialogue context across recent interactions.
- **Persistent Long-Term Memory**: Remembers user risk profile (`Conservative`, `Moderate`, `Aggressive`), investment horizon, open portfolio positions, and past inquiries.
- **Controlled Tool Calling**: Invokes functions to retrieve live stock quotes, technical indicators, fundamental ratios, news headlines, and portfolio status.
- **Human-in-the-Loop (HITL) Trade Proposals**: When an AI agent recommends a trade, it outputs a structured **Trade Action Proposal Card** in chat requiring explicit user approval before execution into the virtual portfolio.

### 3. Virtual Portfolio & Paper Trading Engine
- **$100,000 Virtual Starting Cash**: Zero-risk trading simulation with instant cash balance accounting.
- **Order Execution**: Market and Limit orders with buying power verification, weighted average cost basis accounting, and realized/unrealized P&L tracking.
- **Asset Allocation**: Multi-segment visual portfolio breakdown and position weight limits.
- **Audit Logging**: Complete immutable transaction history with status tracking (`EXECUTED`, `REJECTED`, `AI_PROPOSED`).
- **1-Click Reset**: Reset cash balance and positions back to \$100,000 anytime.

### 4. Interactive Stock Explorer
- Search and analyze both **Global** (e.g. `AAPL`, `NVDA`, `MSFT`, `GOOGL`, `TSLA`) and **Indian Bluechips** (e.g. `TCS.NS`, `RELIANCE.NS`, `INFY.NS`, `HDFCBANK.NS`).
- Interactive Recharts price area chart with timeframe filters (`1D`, `1W`, `1M`, `6M`, `1Y`, `5Y`).
- Real-time technical gauges (RSI 14, SMA 20/50/200, MACD, Bollinger Bands).
- Company news feed with automated sentiment classification.
- 1-click Watchlist management.

### 5. Clean, Professional Light-Theme UI
- Built with React 18, TypeScript, Tailwind CSS, Lucide Icons, and Recharts.
- Fintech aesthetic: crisp slate-50 canvas, pure white card containers, clear contrast, and responsive layout for desktop, tablet, and mobile.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Python >= 3.10

### 1. Backend Setup
```bash
# Navigate to backend and create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Add API Keys in backend/.env for external LLM reasoning
# GEMINI_API_KEY=your_key_here or OPENAI_API_KEY=your_key_here
# If omitted, an intelligent built-in quantitative heuristic engine operates seamlessly!

# Run the FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
FastAPI interactive Swagger docs will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
# In another terminal, navigate to frontend
cd frontend

# Install dependencies and start Vite dev server
npm install
npm run dev
```
Open your browser at `http://localhost:5173` to access the simulator!

### 3. Docker Compose (Optional)
To run with PostgreSQL in containerized mode:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🧪 Testing
Run the backend test suite:
```bash
PYTHONPATH=. backend/venv/bin/pytest tests/test_backend.py -v
```
All 7 integration and unit tests cover market data fetching, technical indicator calculations, paper trade execution, LangGraph multi-agent orchestration, and human-in-the-loop chat proposals.
