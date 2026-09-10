# AlphaAgent — AI Stock Market Simulator & Research Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-FF6F00?style=flat)](https://github.com/langchain-ai/langgraph)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED?style=flat&logo=docker&logoColor=white)](docker-compose.yml)

An institutional-grade, full-stack **AI Stock Market Simulator and Research Platform**. AlphaAgent combines real-time equity market data with a coordinated **5-agent LangGraph consensus committee**, a **conversational AI copilot with dual-layer memory**, and a **real-time paper trading engine** with strict **Human-in-the-Loop (HITL)** safeguards.

---

> ⚠️ **Educational & Simulation Platform Disclaimer**  
> **Strictly Non-Financial Advice**: All market quotes, algorithmic ratings, target prices, stop-loss calculations, multi-agent committee findings, and portfolio executions within AlphaAgent are purely virtual simulations designed for educational, research, and technical demonstration purposes. AlphaAgent does not execute real-world orders or interface with live brokerage accounts. Always consult a licensed financial advisor before making actual investment decisions.

---

## 📑 Table of Contents

- [Core Features](#-core-features)
  - [1. Multi-Agent AI Research Committee (LangGraph)](#1-multi-agent-ai-research-committee-langgraph)
  - [2. Conversational Copilot & Dual-Layer Memory](#2-conversational-copilot--dual-layer-memory)
  - [3. Human-in-the-Loop (HITL) Trade Proposals](#3-human-in-the-loop-hitl-trade-proposals)
  - [4. Virtual Portfolio & Paper Trading Engine](#4-virtual-portfolio--paper-trading-engine)
  - [5. Interactive Stock Explorer & Technical Gauges](#5-interactive-stock-explorer--technical-gauges)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Option A: Automated One-Click Script (Recommended)](#option-a-automated-one-click-script-recommended)
  - [Option B: Manual Local Setup](#option-b-manual-local-setup)
  - [Option C: Containerized with Docker Compose](#option-c-containerized-with-docker-compose)
- [Environment Configuration](#-environment-configuration)
- [REST API Reference](#-rest-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Design Philosophy & Safeguards](#-design-philosophy--safeguards)
- [License](#-license)

---

## 🌟 Core Features

### 1. Multi-Agent AI Research Committee (LangGraph)

AlphaAgent runs an automated state-graph committee orchestrated via **LangGraph**. When an equity symbol is analyzed, an immutable state dictionary passes sequentially through five specialized analytical nodes:

```
[START] ──> [Technical Analyst] ──> [Fundamental Analyst] ──> [Sentiment Analyst] ──> [Risk Analyst] ──> [Portfolio Manager] ──> [END]
```

1. **Technical Analyst Agent**:
   - Computes **Relative Strength Index (RSI 14-day)**, **SMA (20, 50, 200)** moving average alignments, **MACD** line & histogram momentum, and **Bollinger Bands** (20-day, 2 std dev).
   - Identifies trend direction (*Bullish*, *Bearish*, *Neutral*), overbought/oversold inflection zones, and dynamic support & resistance levels.
   - Outputs a normalized Technical Score (0–100) with diagnostic bullet points.

2. **Fundamental Analyst Agent**:
   - Evaluates **Price-to-Earnings (P/E)**, **Price-to-Book (P/B)**, **Earnings Per Share (EPS)**, and **Dividend Yield**.
   - Assesses capital efficiency and solvency: **Operating & Net Margins**, **Debt-to-Equity (D/E)** ratio, and **Free Cash Flow (FCF)**.
   - Assigns a valuation verdict (*Undervalued*, *Fairly Valued*, *Overvalued*) and balance sheet health rating (*Pristine*, *Acceptable*, *Leveraged*).

3. **News & Sentiment Analyst Agent**:
   - Ingests recent financial news headlines and company press releases.
   - Categorizes market sentiment into *Bullish*, *Bearish*, or *Neutral* momentum scores.
   - Identifies qualitative operational catalysts, regulatory updates, and headline shock risks.

4. **Risk & Volatility Analyst Agent**:
   - Measures asset **Beta (\(\beta\))** against broader market indices to categorize volatility tier (*Low*, *Moderate*, *High*).
   - Calculates dynamic stop-loss triggers tailored to stock volatility (typically an 8% downside buffer).
   - Generates downside tail-risk assessments and drawdown vulnerability scores.

5. **Portfolio Manager Agent (Consensus Synthesizer)**:
   - Aggregates the 4 specialized reports using an algorithmic weighted composite formula:
     $$\text{Composite} = 0.30 \cdot S_{\text{tech}} + 0.35 \cdot S_{\text{fund}} + 0.15 \cdot S_{\text{sent}} + 0.20 \cdot (100 - S_{\text{risk}})$$
   - Produces an actionable consensus rating: `STRONG_BUY`, `BUY`, `HOLD`, `SELL`, or `STRONG_SELL`.
   - Forecasts a 12-month target price, confidence score (0–100%), and tailored portfolio allocation ceiling based on the user's risk tolerance (*Conservative: 3%*, *Moderate: 5%*, *Aggressive: 8%*).

---

### 2. Conversational Copilot & Dual-Layer Memory

The conversational assistant provides context-aware portfolio advising, stock queries, and technical explanations:

- **Short-Term Conversational Memory**: Tracks multi-turn dialogue history stored per user session.
- **Long-Term Fact Extraction Memory**: Automatically records and retrieves user profile preferences, investment horizon, risk tolerance, and key holdings.
- **Autonomous Tool Calling**:
  - `get_stock_quote_tool`: Live quote retrieval for global and Indian equities.
  - `get_technical_indicators_tool`: Real-time technical oscillators and moving averages.
  - `get_company_fundamentals_tool`: P/E, EPS, balance sheet metrics, and cash flow.
  - `get_recent_news_tool`: Financial headlines and sentiment breakdown.
  - `get_portfolio_summary_tool`: Instant valuation of current holdings, cash, and P&L.
  - `propose_simulated_trade_tool`: Emits a structured trade proposal for user review.
- **Graceful Fallback**: Operates with external LLMs (Google Gemini, OpenAI, Claude) or seamlessly switches to a high-speed local quantitative heuristic engine when API keys are not configured.

---

### 3. Human-in-the-Loop (HITL) Trade Proposals

To maintain safety and institutional governance, **AI agents never execute trades autonomously**:

```
[Agent Recommendation] ──> [Interactive Proposal Card in Chat] ──> User Clicks [Approve] or [Reject]
                                                                        │                     │
                                                                 [Execute Trade]      [Audit Log: REJECTED]
```

- When the chat copilot or research committee detects an attractive entry point, it returns a structured **Trade Action Proposal Card** inside the chat feed.
- The proposal displays the stock symbol, direction (`BUY` / `SELL`), proposed quantity, estimated execution price, total capital allocation, and algorithmic rationale.
- The user can click **Approve** (which instantly submits the trade to the portfolio engine) or **Decline** (which logs a formal rejection audit entry).

---

### 4. Virtual Portfolio & Paper Trading Engine

- **\$100,000 Virtual Starting Balance**: Risk-free capital environment with instant ledger accounting.
- **Real-Time Mark-to-Market**: Dynamic asset valuation reflecting live market price updates.
- **Position Tracking & Cost Basis**: Calculates average execution price, current market value, unrealized profit/loss (\$ and %), and total portfolio return.
- **Flexible Order Execution**: Supports both **Market** and **Limit** orders with automated buying power verification and share availability checks.
- **Immutable Transaction Ledger**: Complete history tracking transaction type (`BUY`, `SELL`), order mechanism (`MARKET`, `LIMIT`, `AI_PROPOSED`), execution price, total amount, timestamp, and audit status (`EXECUTED`, `REJECTED`).
- **1-Click Portfolio Reset**: Instantly clears all positions and restores the cash balance to \$100,000 anytime.

---

### 5. Interactive Stock Explorer & Technical Gauges

- **Cross-Market Coverage**:
  - **US & Global Equities**: `AAPL`, `NVDA`, `MSFT`, `GOOGL`, `TSLA`, `AMZN`, `META`, etc.
  - **Indian Bluechips (NSE)**: `TCS.NS`, `RELIANCE.NS`, `INFY.NS`, `HDFCBANK.NS`, `ICICIBANK.NS`, `TATAMOTORS.NS`, etc.
- **Interactive Price Area Charts**: Rendered with **Recharts** with time-range filtering (`1D`, `1W`, `1M`, `6M`, `1Y`, `5Y`).
- **Technical Gauge Dashboard**:
  - Visual meter for 14-day RSI (Oversold < 30, Neutral 30–70, Overbought > 70).
  - Trend indicator bar (SMA 20, 50, 200).
  - MACD signal and histogram readout.
  - Bollinger Band volatility boundary visualization.
- **Watchlist Engine**: 1-click watchlist addition/removal with live price change indicators.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React 19 + TypeScript + Vite)             │
│                                                                        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────┐  │
│  │   Dashboard   │ │ Stock Explorer│ │ Multi-Agent   │ │ AI Chat    │  │
│  │   & Metrics   │ │  & Recharts   │ │ Research Hub │ │ & HITL UI  │  │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └─────┬──────┘  │
│          └─────────────────┴────────┬────────┴───────────────┘         │
│                                     │ Axios REST Client                │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ HTTP / JSON
┌─────────────────────────────────────▼──────────────────────────────────┐
│                   BACKEND API (FastAPI + Pydantic v2)                 │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Routers: /market  /portfolio  /analysis  /chat  /watchlist  /user│  │
│  └───────────────────┬───────────────────────────────┬──────────────┘  │
│                      │                               │                 │
│         ┌────────────▼────────────┐     ┌────────────▼────────────┐    │
│         │ Services Layer          │     │ Multi-Agent Engine      │    │
│         │ • market_data.py        │     │ • LangGraph StateGraph  │    │
│         │ • portfolio_service.py  │     │ • chat_agent.py         │    │
│         │ • yfinance connector    │     │ • tools.py & llm_factory│    │
│         └────────────┬────────────┘     └────────────┬────────────┘    │
│                      │                               │                 │
│                      └──────────────┬────────────────┘                 │
│                                     │ SQLAlchemy 2.0 ORM               │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
         ┌────────────────────────────┴───────────────────────────┐
         │                                                        │
┌────────▼────────────────┐                            ┌──────────▼───────────────┐
│ SQLite (Default Local)  │                            │ PostgreSQL 15 (Docker)   │
│ stock_market.db         │                            │ Containerized Production │
└─────────────────────────┘                            └──────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS 3.4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [clsx](https://github.com/lukeed/clsx) |
| **Data Visualization** | [Recharts 3.x](https://recharts.org/) (Interactive area charts, gauges, distribution bars) |
| **Backend API** | [FastAPI 0.110+](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pydantic v2](https://docs.pydantic.dev/) |
| **Multi-Agent AI** | [LangGraph](https://github.com/langchain-ai/langgraph), [LangChain Core](https://python.langchain.com/), [Google GenAI](https://github.com/langchain-ai/langchain-google), [OpenAI](https://platform.openai.com/) |
| **Market Data** | [yfinance](https://github.com/ranaroussi/yfinance), [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/) |
| **Database & ORM** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/), SQLite (Zero-config default), [PostgreSQL 15](https://www.postgresql.org/) |
| **Testing & Tooling** | [Pytest](https://docs.pytest.org/), [httpx](https://www.python-httpx.org/), [Oxlint](https://oxc.rs/) |
| **DevOps & Containers**| Docker, Docker Compose, Multi-stage Dockerfiles, Bash automation scripts |

---

## 📁 Repository Structure

```
AI_Stock_Market/
├── .gitignore                   # Root gitignore (Python, Node, DBs, OS artifacts, secrets)
├── docker-compose.yml           # Full containerized stack (PostgreSQL + FastAPI + Vite)
├── run.sh                       # All-in-one setup & run script (ports check, venv, npm, parallel launch)
├── start.sh                     # Lightweight dual-server launch script
├── README.md                    # Platform documentation and architecture reference
├── tests/                       # Backend test suite
│   └── test_backend.py          # Pytest unit & integration tests (market, agents, HITL, portfolio)
├── backend/                     # FastAPI Backend application
│   ├── Dockerfile               # Production container definition for backend
│   ├── requirements.txt         # Pinned Python dependencies
│   ├── .env.example             # Template configuration file
│   └── app/
│       ├── main.py              # Application entry point, CORS, routers mount
│       ├── config.py            # Pydantic BaseSettings environment loader
│       ├── database.py          # SQLAlchemy engine, declarative base, session generator
│       ├── models/
│       │   └── models.py        # Database models (User, Portfolio, Position, Transaction, Report, Chat)
│       ├── schemas/
│       │   └── schemas.py       # Pydantic request/response validation schemas
│       ├── services/
│       │   ├── market_data.py   # yfinance integration, indicators, financial metrics, news
│       │   └── portfolio_service.py # Paper trade execution engine, P&L, balance accounting
│       ├── agents/
│       │   ├── state.py         # LangGraph AgentState TypedDict schema
│       │   ├── graph.py         # 5-node LangGraph research pipeline builder
│       │   ├── chat_agent.py    # Conversational agent, intent parsing, memory integration
│       │   ├── tools.py         # LangChain function tools for copilot
│       │   └── llm_factory.py   # Model provider selector (Gemini, OpenAI, Anthropic, Heuristic)
│       └── routers/
│           ├── market.py        # /api/market endpoints (quotes, history, indicators, fundamentals)
│           ├── portfolio.py     # /api/portfolio endpoints (summary, trade, approve-proposal, reset)
│           ├── analysis.py      # /api/analysis endpoints (run LangGraph, list saved reports)
│           ├── chat.py          # /api/chat endpoints (send, history, clear)
│           ├── watchlist.py     # /api/watchlist endpoints (get, add, delete)
│           └── user.py          # /api/user endpoints (get profile, update risk tolerance)
└── frontend/                    # React 19 + TypeScript + Vite UI
    ├── Dockerfile               # Production multi-stage build (Node build -> Nginx serve)
    ├── package.json             # Frontend dependencies and npm scripts
    ├── vite.config.ts           # Vite development server configuration
    ├── tailwind.config.js       # Tailwind CSS design system configuration
    ├── tsconfig.json            # TypeScript project configuration
    └── src/
        ├── main.tsx             # Application bootstrap
        ├── App.tsx              # Root component, tab state, modal controllers
        ├── types.ts             # TypeScript interfaces matching backend schemas
        ├── api/
        │   └── client.ts        # Typed Axios API client for all backend routes
        ├── utils/
        │   └── format.ts        # Currency (₹/$), percentage, and timestamp formatters
        └── components/
            ├── Navbar.tsx             # Top navigation, portfolio balance preview, risk settings
            ├── Dashboard.tsx          # Overview cards, market movers, quick trade links
            ├── StockExplorer.tsx      # Symbol lookup, Recharts price graph, technical gauges
            ├── MultiAgentHub.tsx      # LangGraph research console, agent tabs, consensus cards
            ├── AIChatInterface.tsx    # Conversational copilot, memory badges, HITL trade cards
            ├── VirtualPortfolio.tsx   # Asset allocation breakdown, open positions, trade history
            ├── TradeModal.tsx         # Manual buy/sell paper trading dialog
            ├── RiskSettingsModal.tsx  # Investor risk profile & time horizon preferences
            └── DisclaimerBanner.tsx   # Top educational compliance disclaimer
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **Python**: Version 3.10 or higher ([Download](https://www.python.org/))
- **Git**: Installed and configured ([Download](https://git-scm.com/))

---

### Option A: Automated One-Click Script (Recommended)

AlphaAgent includes a zero-config automation script that:
1. Validates Python 3 and Node.js installations.
2. Frees up ports `8000` (FastAPI) and `5173` (Vite) if previously occupied.
3. Automatically provisions `backend/venv` and installs dependencies.
4. Generates `backend/.env` from `.env.example` if not already present.
5. Installs `frontend/node_modules`.
6. Concurrently launches both the FastAPI backend and Vite frontend with graceful shutdown handling.

Run directly from the root directory:

```bash
chmod +x run.sh
./run.sh
```

Once started:
- **Frontend Web UI**: [`http://localhost:5173`](http://localhost:5173)
- **FastAPI Backend**: [`http://localhost:8000`](http://localhost:8000)
- **Interactive Swagger Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)

*Press `[Ctrl + C]` anytime in the terminal to stop all running processes cleanly.*

---

### Option B: Manual Local Setup

#### 1. Backend Setup

```bash
# 1. Open a terminal and navigate to backend
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Create local environment file
cp .env.example .env

# 5. Launch the FastAPI server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend health: Open [`http://localhost:8000/health`](http://localhost:8000/health) in your browser.

#### 2. Frontend Setup

```bash
# 1. In a separate terminal, navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

Open [`http://localhost:5173`](http://localhost:5173) in your browser.

---

### Option C: Containerized with Docker Compose

To deploy the platform in a containerized environment with a dedicated **PostgreSQL** database:

```bash
# Build and spin up all three services: Postgres, Backend, Frontend
docker compose up --build
```

Access points:
- **Frontend UI**: [`http://localhost:3000`](http://localhost:3000)
- **Backend API**: [`http://localhost:8000`](http://localhost:8000)
- **PostgreSQL Database**: `localhost:5432` (`stockmarket`)

To run in detached background mode:
```bash
docker compose up -d
```

To stop containers:
```bash
docker compose down
```

---

## ⚙️ Environment Configuration

Backend configuration is loaded via Pydantic settings from `backend/.env`. A complete template is provided in `backend/.env.example`:

```env
PROJECT_NAME="AI Stock Market Simulator & Research Platform"
DATABASE_URL="sqlite:///./stock_market.db" # or postgresql://user:password@localhost:5432/stockmarket
GEMINI_API_KEY=""                        # Optional: Google Gemini API key
OPENAI_API_KEY=""                        # Optional: OpenAI API key
ANTHROPIC_API_KEY=""                     # Optional: Anthropic Claude API key
INITIAL_CASH_BALANCE=100000.00
```

### Environment Variables Guide

| Variable | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `PROJECT_NAME` | String | `"AI Stock Market..."` | Title displayed in logs and Swagger documentation. |
| `DATABASE_URL` | String | `"sqlite:///./stock_market.db"` | Database connection string. Supports SQLite and PostgreSQL. |
| `GEMINI_API_KEY` | String | `""` *(Optional)* | Google Gemini API key for cloud LLM reasoning. |
| `OPENAI_API_KEY` | String | `""` *(Optional)* | OpenAI API key for GPT-4o / GPT-3.5-turbo models. |
| `ANTHROPIC_API_KEY` | String | `""` *(Optional)* | Anthropic API key for Claude 3 models. |
| `INITIAL_CASH_BALANCE`| Float | `100000.00` | Starting paper cash balance credited to new accounts. |

> **💡 Zero-Config Fallback**: If no LLM API keys are provided, AlphaAgent automatically uses its built-in quantitative heuristic engine. All technical indicators, fundamental models, risk assessments, and consensus ratings calculate instantly and accurately without requiring paid API keys!

---

## 📡 REST API Reference

Interactive API documentation and schema explorers are accessible at [`http://localhost:8000/docs`](http://localhost:8000/docs) (Swagger UI) and [`http://localhost:8000/redoc`](http://localhost:8000/redoc) (ReDoc).

### Market Data Endpoints (`/api/market`)

| Method | Endpoint | Query / Path Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/market/search` | `q`: string | Autocomplete search for global & Indian stock symbols. |
| `GET` | `/api/market/quote/{symbol}` | `symbol`: ticker | Real-time quote, price, day change, volume, high/low. |
| `GET` | `/api/market/history/{symbol}` | `timeframe`: `1D`, `1W`, `1M`, `6M`, `1Y`, `5Y` | Historical OHLCV candle/line chart data points. |
| `GET` | `/api/market/indicators/{symbol}` | `symbol`: ticker | Technical analysis data: RSI, SMA 20/50/200, MACD, Bollinger Bands. |
| `GET` | `/api/market/fundamentals/{symbol}` | `symbol`: ticker | Fundamental ratios: P/E, P/B, EPS, Beta, Debt/Equity, Margins. |
| `GET` | `/api/market/news/{symbol}` | `symbol`: ticker | Recent news headlines with publisher and sentiment classification. |

### Virtual Portfolio Endpoints (`/api/portfolio`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portfolio/summary` | *None* | Cash balance, total equity value, unrealized/realized P&L, positions list. |
| `POST` | `/api/portfolio/trade` | `TradeOrderCreate` | Places a Market or Limit order (`BUY` or `SELL`). |
| `POST` | `/api/portfolio/approve-proposal`| `TradeApprovalRequest` | Executes or declines an AI-proposed trade card (HITL). |
| `GET` | `/api/portfolio/transactions` | *None* | Chronological audit ledger of all executed and rejected orders. |
| `POST` | `/api/portfolio/reset` | *None* | Resets virtual portfolio to \$100,000 cash and liquidates positions. |

### Multi-Agent Research Endpoints (`/api/analysis`)

| Method | Endpoint | Query Params | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/analysis/run` | `symbol`: ticker | Executes full 5-agent LangGraph workflow and stores synthesized report. |
| `GET` | `/api/analysis/reports` | *None* | Lists the last 10 generated multi-agent research reports. |
| `GET` | `/api/analysis/report/{id}` | `id`: integer | Retrieves detailed report breakdown and agent logs by ID. |

### Conversational AI Copilot Endpoints (`/api/chat`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chat/history` | *None* | Fetches conversation thread for the active user. |
| `POST` | `/api/chat/send` | `{"message": "..."}` | Sends message to AI advisor; triggers tool calls and memory retrieval. |
| `DELETE`| `/api/chat/clear` | *None* | Purges current conversation history from database. |

### Watchlist Endpoints (`/api/watchlist`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/watchlist` | *None* | Retrieves all stocks on the user's active watchlist with live prices. |
| `POST` | `/api/watchlist/add` | `{"symbol": "...", "notes": "..."}` | Adds a stock symbol to the watchlist. |
| `DELETE`| `/api/watchlist/{symbol}`| `symbol`: ticker | Removes a symbol from the watchlist. |

### User Profile Endpoints (`/api/user`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/profile` | *None* | Returns investor risk tolerance, horizon, and stored memory facts. |
| `PUT` | `/api/user/profile` | `{"risk_tolerance": "...", ...}` | Updates risk profile (`Conservative`, `Moderate`, `Aggressive`). |

---

## 🧪 Testing & Quality Assurance

### Running Backend Pytest Suite

The backend includes a comprehensive integration and unit test suite covering health checks, market data pipelines, Indian stock symbol normalization, technical indicators, virtual paper trade execution, LangGraph multi-agent execution, and Human-in-the-Loop chat proposals:

```bash
# Run pytest with verbose output
PYTHONPATH=. backend/venv/bin/pytest tests/test_backend.py -v
```

Expected output:
```text
tests/test_backend.py::test_health PASSED                                [ 14%]
tests/test_backend.py::test_market_quote PASSED                          [ 28%]
tests/test_backend.py::test_market_indian_stock_quote PASSED             [ 42%]
tests/test_backend.py::test_technical_indicators PASSED                  [ 57%]
tests/test_backend.py::test_portfolio_summary_and_trade PASSED           [ 71%]
tests/test_backend.py::test_multi_agent_langgraph_analysis PASSED        [ 85%]
tests/test_backend.py::test_chat_interaction_and_proposal PASSED         [100%]

======================== 7 passed in 7.09s ========================
```

### Running Frontend Typecheck & Build

Verify frontend TypeScript types and build bundle integrity:

```bash
cd frontend
npm run build
```

Verify code style and quality with Oxlint:

```bash
cd frontend
npm run lint
```

---

## 🛡️ Design Philosophy & Safeguards

1. **Human-in-the-Loop (HITL) First**:
   Autonomous systems in finance require strict human oversight. AlphaAgent's AI agents are strictly advisory. Orders generated via chat or multi-agent consensus are returned as **approval requests**, ensuring that no virtual capital is committed without manual user authorization.

2. **Zero-Config Developer Experience**:
   Developers should be able to clone the repository and begin interacting immediately. The SQLite database is created automatically on first launch, market data requires no paid API keys, and the AI agents gracefully run a high-fidelity quantitative rule-engine if no LLM API key is specified.

3. **Dual-Market Compatibility**:
   Unlike platforms limited to US markets, AlphaAgent treats US tickers (e.g. `AAPL`, `MSFT`) and Indian NSE tickers (e.g. `TCS.NS`, `RELIANCE.NS`) as first-class citizens, handling currency symbols (₹ and \$), symbol suffixes, and exchange quirks transparently.

4. **Clean Fintech Ergonomics**:
   Built with a clean light-mode financial interface: neutral slate-50 background, white container cards, clear visual hierarchy, accessible contrast ratios, and color-coded indicators (emerald for bullish/gains, rose for bearish/losses, amber for neutral warnings).

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for AI researchers, quantitative analysts, and financial technology builders.</sub>
</div>
