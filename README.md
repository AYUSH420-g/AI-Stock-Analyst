# AlphaAgent — AI Stock Market Simulator & Research Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-FF6F00?style=flat)](https://github.com/langchain-ai/langgraph)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy_2.0-D71F00?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED?style=flat&logo=docker&logoColor=white)](docker-compose.yml)

An institutional-grade, full-stack **AI Stock Market Simulator and Quantitative Research Platform**. AlphaAgent combines real-time equity market data with a coordinated **5-agent LangGraph consensus committee**, a **conversational AI copilot with dual-layer memory**, and a **real-time paper trading engine** with strict **Human-in-the-Loop (HITL)** safeguards.

Designed for both **US Equities** (`AAPL`, `NVDA`, `MSFT`, etc.) and **Indian Bluechips (NSE)** (`TCS.NS`, `RELIANCE.NS`, `INFY.NS`, `HDFCBANK.NS`, etc.), the platform provides traders, quantitative researchers, and software engineers with a risk-free, transparent sandbox for autonomous financial intelligence.

---

> ⚠️ **Educational & Simulation Platform Disclaimer**  
> **Strictly Non-Financial Advice**: All market quotes, algorithmic ratings, target prices, stop-loss calculations, multi-agent committee findings, and portfolio executions within AlphaAgent are purely virtual simulations designed for educational, research, and technical demonstration purposes. AlphaAgent does not execute real-world orders or interface with live brokerage accounts. Always consult a licensed financial advisor before making actual investment decisions.

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [Core Features](#-core-features)
  - [1. Multi-Agent AI Research Committee (LangGraph)](#1-multi-agent-ai-research-committee-langgraph)
  - [2. Conversational AI Copilot & Dual-Layer Memory](#2-conversational-ai-copilot--dual-layer-memory)
  - [3. Human-in-the-Loop (HITL) Trade Proposals](#3-human-in-the-loop-hitl-trade-proposals)
  - [4. Real-Time Virtual Portfolio & Paper Trading Engine](#4-real-time-virtual-portfolio--paper-trading-engine)
  - [5. Interactive Stock Explorer & Technical Gauges](#5-interactive-stock-explorer--technical-gauges)
  - [6. Watchlist Management & Dynamic Risk Profiling](#6-watchlist-management--dynamic-risk-profiling)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Detailed Working of Every Subsystem](#-detailed-working-of-every-subsystem)
  - [Subsystem 1: Market Data & Quantitative Engineering](#subsystem-1-market-data--quantitative-engineering)
  - [Subsystem 2: LangGraph 5-Agent Consensus Committee](#subsystem-2-langgraph-5-agent-consensus-committee)
  - [Subsystem 3: Conversational Copilot & Memory Engine](#subsystem-3-conversational-copilot--memory-engine)
  - [Subsystem 4: Paper Trading & HITL Execution Engine](#subsystem-4-paper-trading--hitl-execution-engine)
  - [Subsystem 5: Database Schema & Entity Relationships](#subsystem-5-database-schema--entity-relationships)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Option A: Automated One-Click Script (Recommended)](#option-a-automated-one-click-script-recommended)
  - [Option B: Manual Local Setup](#option-b-manual-local-setup)
  - [Option C: Containerized with Docker Compose](#option-c-containerized-with-docker-compose)
- [Environment Configuration](#-environment-configuration)
- [REST API Reference](#-rest-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Design Philosophy & Safeguards](#-design-philosophy--safeguards)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [License](#-license)

---

## 🎯 Executive Summary

Modern algorithmic trading and equity research require synthesizing diverse data streams: chart momentum, fundamental accounting ratios, real-time news sentiment, and volatility metrics. While large language models (LLMs) excel at qualitative reasoning, unconstrained AI models can hallucinate prices, miscalculate risks, or trigger impulsive actions.

**AlphaAgent** solves this dilemma through three architectural pillars:
1. **Specialized Division of Labor**: Rather than relying on a monolithic prompt, analysis is distributed across five specialized LangGraph agents (Technical, Fundamental, Sentiment, Risk, and Portfolio Manager).
2. **Dual-Layer Memory Copilot**: A conversational assistant with short-term dialogue history and long-term user fact extraction that autonomously queries live quotes, indicators, news, and portfolio states via function calling.
3. **Mandatory Human Oversight (HITL)**: All agent-recommended trades are isolated into structured proposal objects. Capital can only be committed when a human trader physically clicks **Approve**.

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
   - Outputs a normalized Technical Score (10–95) with diagnostic bullet points.

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
   - Forecasts a 12-month target price, confidence score (10–95%), and tailored portfolio allocation ceiling based on the user's risk tolerance (*Conservative: 3%*, *Moderate: 5%*, *Aggressive: 8%*).

---

### 2. Conversational AI Copilot & Dual-Layer Memory

The conversational assistant provides context-aware portfolio advising, stock queries, and technical explanations:

- **Short-Term Conversational Memory**: Tracks multi-turn dialogue history stored per user session in the SQLite/PostgreSQL database.
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

### 4. Real-Time Virtual Portfolio & Paper Trading Engine

- **\$100,000 / ₹10,00,000 Virtual Starting Balance**: Risk-free capital environment with instant ledger accounting.
- **Real-Time Mark-to-Market**: Dynamic asset valuation reflecting live market price updates.
- **Position Tracking & Cost Basis**: Calculates average execution price, current market value, unrealized profit/loss (\$ and %), and total portfolio return.
- **Flexible Order Execution**: Supports both **Market** and **Limit** orders with automated buying power verification and share availability checks.
- **Immutable Transaction Ledger**: Complete history tracking transaction type (`BUY`, `SELL`), order mechanism (`MARKET`, `LIMIT`, `AI_PROPOSED`), execution price, total amount, timestamp, and audit status (`EXECUTED`, `REJECTED`).
- **1-Click Portfolio Reset**: Instantly clears all positions and restores the cash balance to ₹10,00,000 / \$100,000 anytime.

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
- **Fundamental Metric Cards**: P/E ratio, P/B ratio, EPS, dividend yield, Beta, profit margins, ROE, debt-to-equity, and free cash flow.
- **News Feed with Sentiment Badges**: Real-time articles tagged as Bullish, Bearish, or Neutral.

---

### 6. Watchlist Management & Dynamic Risk Profiling

- **1-Click Watchlist**: Add/remove tickers to monitor live prices, day change, and market cap.
- **Risk Tolerance Tuning**: Toggle between `Conservative`, `Moderate`, and `Aggressive` profiles; the multi-agent committee and chat advisor dynamically adjust suggested position sizes and stop-loss buffers accordingly.

---

## 🏛️ System Architecture & Data Flow

AlphaAgent follows a decoupled, clean-architecture design separating client presentation, API routing, agent orchestration, service calculation, and database persistence.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND (React 19 + TypeScript + Vite)                          │
│                                                                                                  │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐ ┌──────────────────────┐  │
│  │     Dashboard      │ │   Stock Explorer   │ │  Multi-Agent Hub   │ │   AI Chat Copilot    │  │
│  │   Portfolio KPIs   │ │ Recharts & Gauges  │ │ LangGraph Console  │ │  Memory & HITL Cards │  │
│  └─────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘ └──────────┬───────────┘  │
│            └──────────────────────┴───────────┬──────────┴───────────────────────┘              │
│                                               │ Axios HTTP Client                               │
└───────────────────────────────────────────────┼─────────────────────────────────────────────────┘
                                                │ REST API (JSON)
┌───────────────────────────────────────────────▼─────────────────────────────────────────────────┐
│                                 BACKEND (FastAPI + Pydantic v2)                                  │
│                                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ API Routers: /api/market  •  /api/portfolio  •  /api/analysis  •  /api/chat  •  /api/user    │  │
│  └──────────────────────────────┬────────────────────────────┬───────────────────────────────┘  │
│                                 │                            │                                  │
│                  ┌──────────────▼──────────────┐             │                                  │
│                  │        Services Layer       │             │                                  │
│                  │  • market_data.py           │             │                                  │
│                  │    - yfinance connector     │             │                                  │
│                  │    - 60s in-memory TTL      │             │                                  │
│                  │    - RSI, SMA, MACD, BB     │             │                                  │
│                  │  • portfolio_service.py     │             │                                  │
│                  │    - Ledger accounting      │             │                                  │
│                  │    - P&L & Mark-to-Market   │             │                                  │
│                  │    - Order verification     │             │                                  │
│                  └──────────────┬──────────────┘             │                                  │
│                                 │                            │                                  │
│                                 │         ┌──────────────────▼────────────────────┐             │
│                                 │         │          Multi-Agent Core             │             │
│                                 │         │  • LangGraph StateGraph (5 Nodes)     │             │
│                                 │         │  • chat_agent.py (Intent & Tools)     │             │
│                                 │         │  • llm_factory.py (Gemini/GPT/Claude) │             │
│                                 │         │  • Quantitative Heuristic Fallback    │             │
│                                 │         └──────────────────┬────────────────────┘             │
│                                 │                            │                                  │
│                                 └───────────────┬────────────┘                                  │
│                                                 │ SQLAlchemy 2.0 ORM                            │
└─────────────────────────────────────────────────┼───────────────────────────────────────────────┘
                                                  │
                      ┌───────────────────────────┴───────────────────────────┐
                      │                                                       │
         ┌────────────▼────────────┐                             ┌────────────▼────────────┐
         │ SQLite (Default Local)  │                             │ PostgreSQL 15 (Docker)  │
         │ stock_market.db         │                             │ Containerized Database  │
         └─────────────────────────┘                             └─────────────────────────┘
```

---

## 🔬 Detailed Working of Every Subsystem

### Subsystem 1: Market Data & Quantitative Engineering

The market data service ([`backend/app/services/market_data.py`](file:///Users/ayush/Desktop/AI_Stock_Market/backend/app/services/market_data.py)) handles data acquisition, symbol normalization, technical calculations, and headline sentiment analysis.

#### 1. Symbol Normalization & Multi-Market Aliases
Users can search or type tickers naturally without remembering market suffixes:
- Indian bluechips (`TCS`, `RELIANCE`, `INFY`, `HDFC`, `TATAMOTORS`, `SBI`, `ITC`, `AIRTEL`) automatically resolve to their NSE Yahoo Finance tickers (e.g., `TCS.NS`, `RELIANCE.NS`).
- US mega-caps (`AAPL`, `NVDA`, `MSFT`, `GOOGL`, `TSLA`, `AMZN`) map directly to USD assets.
- If an unrecognized symbol is provided without an exchange suffix, the normalizer intelligently assigns the `.NS` extension for Indian market compatibility.

#### 2. In-Memory TTL Cache (60-Second Window)
To prevent rate-limiting from Yahoo Finance when multiple agents or UI components request data simultaneously, an in-memory dictionary cache stores live quotes with a 60-second time-to-live (`CACHE_TTL_SECONDS = 60`). Subsequent calls within the TTL return cached data instantaneously.

#### 3. Quantitative Technical Indicator Mathematics
- **14-Day RSI (Relative Strength Index)**:
  $$\Delta = \text{Close}_t - \text{Close}_{t-1}$$
  $$\text{Gain} = \text{rolling\_mean}(\max(\Delta, 0), 14), \quad \text{Loss} = \text{rolling\_mean}(\max(-\Delta, 0), 14)$$
  $$\text{RS} = \frac{\text{Gain}}{\text{Loss}}, \quad \text{RSI} = 100 - \frac{100}{1 + \text{RS}}$$
- **Simple Moving Averages (SMA)**: Calculated across 20-day, 50-day, and 200-day rolling windows:
  $$\text{SMA}_k = \frac{1}{k} \sum_{i=0}^{k-1} \text{Close}_{t-i}$$
- **MACD (Moving Average Convergence Divergence)**:
  $$\text{MACD Line} = \text{EMA}_{12}(\text{Close}) - \text{EMA}_{26}(\text{Close})$$
  $$\text{Signal Line} = \text{EMA}_9(\text{MACD Line})$$
  $$\text{Histogram} = \text{MACD Line} - \text{Signal Line}$$
- **Bollinger Bands**:
  $$\text{Upper Band} = \text{SMA}_{20} + 2 \cdot \sigma_{20}, \quad \text{Lower Band} = \text{SMA}_{20} - 2 \cdot \sigma_{20}$$

#### 4. Automated News Sentiment Classification
Company headlines retrieved from the ticker stream are processed through a financial lexicon filter. Headwinds (*drop, fall, miss, plunge, risk, probe, selloff*) tag items as **Bearish**, while catalysts (*surge, growth, record, beat, profit, expansion, deal*) tag them as **Bullish**.

---

### Subsystem 2: LangGraph 5-Agent Consensus Committee

The research pipeline ([`backend/app/agents/graph.py`](file:///Users/ayush/Desktop/AI_Stock_Market/backend/app/agents/graph.py)) is implemented as a sequential state graph using **LangGraph**.

```
[START] 
   │
   ▼
[technical_analyst]     ──> Computes RSI, SMAs, MACD, BB; outputs trend & technical score (10-95)
   │
   ▼
[fundamental_analyst]   ──> Evaluates P/E, EPS, margins, D/E, FCF; outputs valuation & solvency
   │
   ▼
[sentiment_analyst]     ──> Ingests news; evaluates momentum, catalysts, headline risk score
   │
   ▼
[risk_analyst]          ──> Assesses Beta, downside volatility, stop-loss trigger price
   │
   ▼
[portfolio_manager]     ──> Computes weighted composite score; outputs rating & trade proposal
   │
   ▼
 [END]
```

#### The State Schema (`AgentState`)
Every node receives and returns the shared `AgentState` TypedDict:
```python
class AgentState(TypedDict):
    symbol: str
    user_risk_tolerance: str
    quote: Dict[str, Any]
    technical_data: Dict[str, Any]
    fundamental_data: Dict[str, Any]
    news_data: List[Dict[str, Any]]
    technical_report: Optional[Dict[str, Any]]
    fundamental_report: Optional[Dict[str, Any]]
    sentiment_report: Optional[Dict[str, Any]]
    risk_report: Optional[Dict[str, Any]]
    portfolio_recommendation: Optional[Dict[str, Any]]
    final_report: Optional[Dict[str, Any]]
    agent_logs: List[str]
```

#### Node Details
1. **Technical Analyst Node**: Evaluates indicator alignment. If the stock trades above its 20-day SMA with an RSI between 40–60 and positive MACD histogram, it assigns a high technical score.
2. **Fundamental Analyst Node**: Compares P/E against historical medians, checks whether profit margins are expanding, and verifies if free cash flow covers capital obligations.
3. **Sentiment Analyst Node**: Synthesizes headline sentiment into an aggregate score (10–95) and highlights operational catalysts.
4. **Risk Analyst Node**: Analyzes asset Beta. Computes a dynamic stop-loss buffer (defaulting to 8% downside) and calculates drawdown exposure.
5. **Portfolio Manager Node (Consensus Synthesizer)**:
   - Evaluates the **Weighted Composite Formula**:
     $$\text{Composite Score} = (0.30 \times S_{\text{tech}}) + (0.35 \times S_{\text{fund}}) + (0.15 \times S_{\text{sent}}) + (0.20 \times (100 - S_{\text{risk}}))$$
   - Maps the composite score to an actionable consensus:
     - $\ge 75$: `STRONG_BUY`
     - $\ge 60$: `BUY`
     - $\ge 40$: `HOLD`
     - $\ge 25$: `SELL`
     - $< 25$: `STRONG_SELL`
   - Calculates a 12-month target price:
     $$\text{Target Price} = \text{Price} \times \left(1 + \frac{\text{Composite} - 50}{250}\right)$$
   - Computes dynamic position sizing based on risk tolerance:
     - Conservative: Max 3% allocation
     - Moderate: Max 5% allocation
     - Aggressive: Max 8% allocation

#### Dual-Engine LLM Fallback Architecture
AlphaAgent is engineered with zero-dependency fallback resilience via [`backend/app/agents/llm_factory.py`](file:///Users/ayush/Desktop/AI_Stock_Market/backend/app/agents/llm_factory.py):
- **When API Keys are Configured**: Prompts the selected cloud LLM (`Gemini`, `GPT-4o`, `Claude 3`) with strict JSON schema instructions.
- **When No Keys are Present (Heuristic Engine)**: Executes a deterministic quantitative rule-engine that calculates mathematical scores and professional commentary locally. **The entire platform functions 100% out of the box without requiring paid LLM API keys.**

---

### Subsystem 3: Conversational Copilot & Memory Engine

The AI Copilot ([`backend/app/agents/chat_agent.py`](file:///Users/ayush/Desktop/AI_Stock_Market/backend/app/agents/chat_agent.py)) acts as a full-time portfolio research advisor.

```
[User Message] 
       │
       ▼
[Extract Entities] ──────────> Identifies symbols (e.g., 'AAPL', 'TCS', 'Reliance')
       │
       ▼
[Fetch Context] ─────────────> Live Quotes, Indicators, News, and Portfolio Ledger
       │
       ▼
[Detect Intent] ─────────────> Buy/Sell intent detected? Create TradeProposal object
       │
       ▼
[Construct System Prompt] ───> Injects short-term dialogue, memory facts & investor risk
       │
       ▼
[LLM / Heuristic Engine] ───> Formats rich markdown response + HITL trade card
       │
       ▼
[Persist in Database] ───────> Stored in chat_messages table
```

#### 1. Entity Extraction & Symbol Disambiguation
Incoming text is analyzed using regex and a curated financial dictionary. Common English words that resemble tickers (`CAN`, `FOR`, `NEW`, `LOW`, `BUY`, `SELL`) are filtered out, while ticker symbols (`$NVDA`, `AAPL`) and company names (`Infosys`, `Tata Consultancy`) are resolved to valid market tickers.

#### 2. Dual-Layer Memory
- **Short-Term Context**: Queries the last 6 messages from the `chat_messages` table and feeds the dialogue history into the prompt to preserve conversational flow.
- **Long-Term Memory**: The `user_memory_facts` table persists user preferences, such as preferred sectors ("Prefers blue-chip tech stocks with high FCF") and risk constraints ("Moderate risk, max 15% allocation in a single name").

#### 3. Tool Calling Dispatcher
When a user asks questions such as *"Why did my portfolio drop today?"* or *"Analyze TCS"*, the engine queries internal services:
- `get_stock_quote`
- `get_technical_indicators`
- `get_financial_metrics`
- `get_company_news`
- `get_portfolio_summary`
- `propose_simulated_trade`

---

### Subsystem 4: Paper Trading & HITL Execution Engine

The paper trading engine ([`backend/app/services/portfolio_service.py`](file:///Users/ayush/Desktop/AI_Stock_Market/backend/app/services/portfolio_service.py)) delivers institutional-grade trade simulation.

#### 1. Account Balance & Mark-to-Market Accounting
- Starts with ₹10,00,000 / \$100,000 in virtual cash.
- Positions maintain quantity, average buy price, and cost basis:
  $$\text{Market Value} = \text{Quantity} \times \text{Current Price}$$
  $$\text{Unrealized P\&L} = \text{Market Value} - \text{Total Cost Basis}$$
  $$\text{Unrealized P\&L \%} = \left(\frac{\text{Unrealized P\&L}}{\text{Total Cost Basis}}\right) \times 100$$
- Total Portfolio Value is calculated in real time:
  $$\text{Total Value} = \text{Cash Balance} + \sum \text{Market Value of All Positions}$$

#### 2. Order Execution Logic
- **BUY Order**: Verifies available cash. If adequate, deducts capital, updates position cost basis (or instantiates a new position), and appends an `EXECUTED` record to the transaction ledger.
- **SELL Order**: Verifies share ownership. Computes realized profit/loss:
  $$\text{Cost Basis Sold} = \text{Average Buy Price} \times \text{Quantity}$$
  $$\text{Realized Gain/Loss} = \text{Total Sale Amount} - \text{Cost Basis Sold}$$
  Credits cash balance, decrements or deletes the position, and logs the transaction.

#### 3. Human-in-the-Loop (HITL) Workflow
1. When an AI agent recommends a trade, it does **not** execute it. Instead, it emits a `TradeProposal` object:
   ```json
   {
     "symbol": "TCS.NS",
     "action": "BUY",
     "quantity": 10,
     "estimated_price": 3880.0,
     "total_estimated_cost": 38800.0,
     "rationale": "Bullish moving average crossover and oversold RSI inflection.",
     "risk_level": "Moderate",
     "status": "PENDING_APPROVAL"
   }
   ```
2. The frontend renders an interactive proposal card with **Approve** and **Decline** buttons.
3. If the user clicks **Approve**, the client sends a `POST` request to `/api/portfolio/approve-proposal` with `{"approved": true}`. The order executes immediately.
4. If the user clicks **Decline**, the client sends `{"approved": false}`. An audit record is created with status `REJECTED`, ensuring full traceability without spending capital.

---

### Subsystem 5: Database Schema & Entity Relationships

AlphaAgent utilizes **SQLAlchemy 2.0** with eight interconnected database tables:

```
┌─────────────────┐       1:1       ┌─────────────────┐       1:N       ┌─────────────────────┐
│      users      ├─────────────────┤   portfolios    ├─────────────────┤      positions      │
│─────────────────│                 │─────────────────│                 │─────────────────────│
│ id (PK)         │                 │ id (PK)         │                 │ id (PK)             │
│ username        │                 │ user_id (FK)    │                 │ portfolio_id (FK)   │
│ risk_tolerance  │                 │ cash_balance    │                 │ symbol              │
│ investment_horiz│                 │ realized_pnl    │                 │ quantity            │
│ created_at      │                 │ currency        │                 │ average_buy_price   │
└────────┬────────┘                 └────────┬────────┘                 │ total_cost_basis    │
         │                                   │                          └─────────────────────┘
         │ 1:N                               │ 1:N
         │                                   │
         │                          ┌────────▼────────────┐
         │                          │ trade_transactions  │
         │                          │─────────────────────│
         │                          │ id (PK)             │
         │                          │ portfolio_id (FK)   │
         │                          │ symbol, action      │
         │                          │ quantity, price     │
         │                          │ total_amount        │
         │                          │ status (EXECUTED/..)│
         │                          │ order_type, notes   │
         │                          └─────────────────────┘
         │
         ├─── 1:N ───> [watchlists] ─── 1:N ───> [watchlist_items]
         ├─── 1:N ───> [chat_messages] (stores message, tool_calls, trade_proposal)
         ├─── 1:N ───> [user_memory_facts] (stores categorized user preferences)
         └─── (ref) ─> [agent_reports] (stores LangGraph synthesized consensus reports)
```

---

## 💻 Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) | High-performance SPA with modern React primitives |
| **Styling & Icons** | [Tailwind CSS 3.4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [clsx](https://github.com/lukeed/clsx) | Clean, institutional-grade responsive styling |
| **Data Visualization** | [Recharts 3.x](https://recharts.org/) | Dynamic area price charts, technical oscillator gauges, asset breakdown bars |
| **Backend Framework** | [FastAPI 0.110+](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pydantic v2](https://docs.pydantic.dev/) | Asynchronous, typed REST API gateway |
| **Agent Orchestration**| [LangGraph](https://github.com/langchain-ai/langgraph), [LangChain Core](https://python.langchain.com/) | 5-agent state graph research committee |
| **LLM Integrations** | [Google GenAI (Gemini)](https://github.com/langchain-ai/langchain-google), [OpenAI (GPT-4o)](https://platform.openai.com/), Anthropic | Cloud LLM reasoning with automated quantitative heuristic fallback |
| **Financial Engine** | [yfinance](https://github.com/ranaroussi/yfinance), [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/) | Live market quotes, historical OHLCV data, technical indicators |
| **Database & ORM** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/), SQLite, [PostgreSQL 15](https://www.postgresql.org/) | Flexible relational persistence layer |
| **Testing & Quality** | [Pytest](https://docs.pytest.org/), [httpx](https://www.python-httpx.org/), [Oxlint](https://oxc.rs/) | End-to-end integration tests, type safety, and linting |
| **DevOps & Containers**| Docker, Docker Compose, Multi-stage Dockerfiles, Bash scripts | Reproducible local and containerized deployments |

---

## 📁 Repository Structure

```
AI_Stock_Market/
├── .gitignore                   # Root gitignore (Python, Node, DBs, OS artifacts, secrets)
├── docker-compose.yml           # Multi-container stack (PostgreSQL + FastAPI + Vite)
├── run.sh                       # All-in-one setup & run script (ports check, venv, npm, parallel launch)
├── start.sh                     # Lightweight dual-server launch script
├── README.md                    # Comprehensive platform documentation & technical reference
├── tests/                       # Backend test suite
│   └── test_backend.py          # Pytest integration tests (quotes, indicators, LangGraph, HITL)
├── backend/                     # FastAPI Backend application
│   ├── Dockerfile               # Production container definition for backend
│   ├── requirements.txt         # Pinned Python dependencies
│   ├── .env.example             # Template configuration file
│   └── app/
│       ├── main.py              # FastAPI app initialization, CORS, router mounting
│       ├── config.py            # Pydantic BaseSettings environment loader
│       ├── database.py          # SQLAlchemy engine, session generator, declarative Base
│       ├── models/
│       │   └── models.py        # SQLAlchemy models (User, Portfolio, Position, Transactions, Reports, Chat)
│       ├── schemas/
│       │   └── schemas.py       # Pydantic request/response validation schemas
│       ├── services/
│       │   ├── market_data.py   # yfinance integration, indicators, financial metrics, news scraper
│       │   └── portfolio_service.py # Paper trade execution, mark-to-market P&L, balance accounting
│       ├── agents/
│       │   ├── state.py         # LangGraph AgentState TypedDict schema
│       │   ├── graph.py         # 5-node LangGraph research pipeline builder
│       │   ├── chat_agent.py    # Conversational agent, intent parsing, memory integration
│       │   ├── tools.py         # LangChain function tools for copilot
│       │   └── llm_factory.py   # Model provider selector (Gemini, OpenAI, Claude, Heuristic)
│       └── routers/
│           ├── market.py        # /api/market endpoints (quotes, history, indicators, fundamentals)
│           ├── portfolio.py     # /api/portfolio endpoints (summary, trade, approve-proposal, reset)
│           ├── analysis.py      # /api/analysis endpoints (run LangGraph, list saved reports)
│           ├── chat.py          # /api/chat endpoints (send, history, clear)
│           ├── watchlist.py     # /api/watchlist endpoints (get, add, delete)
│           └── user.py          # /api/user endpoints (get profile, update risk tolerance)
└── frontend/                    # React 19 + TypeScript + Vite UI
    ├── Dockerfile               # Multi-stage production build (Node build -> Nginx serve)
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

## 🚀 Quick Start Guide

### Prerequisites

- **Python**: Version 3.10 or higher ([Download](https://www.python.org/))
- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **Git**: Installed and configured ([Download](https://git-scm.com/))
- **Docker & Docker Compose** *(Optional, for containerized run)*: ([Download](https://www.docker.com/))

---

### Option A: Automated One-Click Script (Recommended)

AlphaAgent includes an intelligent automation script that verifies dependencies, frees ports `8000` and `5173`, sets up the Python virtual environment and npm packages, and launches both services in parallel.

From the repository root:

```bash
chmod +x run.sh
./run.sh
```

Once started:
- **Frontend Web UI**: [`http://localhost:5173`](http://localhost:5173)
- **FastAPI Backend**: [`http://localhost:8000`](http://localhost:8000)
- **Interactive Swagger Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)

*Press `[Ctrl + C]` in the terminal at any time to terminate both servers cleanly.*

---

### Option B: Manual Local Setup

#### 1. Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Upgrade pip and install pinned dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Create environment file from template
cp .env.example .env

# 5. Launch the FastAPI server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend health by visiting [`http://localhost:8000/health`](http://localhost:8000/health).

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

To deploy the platform in isolated containers with a dedicated **PostgreSQL** database:

```bash
# Build and run Postgres, Backend, and Frontend
docker compose up --build
```

Access points:
- **Frontend UI**: [`http://localhost:3000`](http://localhost:3000)
- **Backend API**: [`http://localhost:8000`](http://localhost:8000)
- **PostgreSQL Database**: `localhost:5432` (`stockmarket`)

To run in the background:
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
INITIAL_CASH_BALANCE=1000000.00
```

### Environment Variables Guide

| Variable | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `PROJECT_NAME` | String | `"AI Stock Market..."` | Title displayed in server logs and Swagger UI. |
| `DATABASE_URL` | String | `"sqlite:///./stock_market.db"` | Database connection string. Supports SQLite and PostgreSQL. |
| `GEMINI_API_KEY` | String | `""` *(Optional)* | Google Gemini API key for cloud LLM reasoning. |
| `OPENAI_API_KEY` | String | `""` *(Optional)* | OpenAI API key for GPT-4o / GPT-3.5-turbo models. |
| `ANTHROPIC_API_KEY` | String | `""` *(Optional)* | Anthropic API key for Claude 3 models. |
| `INITIAL_CASH_BALANCE`| Float | `1000000.00` | Starting virtual cash balance credited to new accounts. |

> **💡 Zero-Config Fallback**: If no LLM API keys are provided, AlphaAgent automatically uses its built-in quantitative heuristic engine. All technical indicators, fundamental models, risk assessments, and consensus ratings calculate instantly and accurately without requiring paid API keys!

---

## 📡 REST API Reference

AlphaAgent provides an extensive, fully-documented OpenAPI/Swagger interface at [`http://localhost:8000/docs`](http://localhost:8000/docs).

### 1. Market Data (`/api/market`)

| Method | Endpoint | Query / Path Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/market/search` | `q`: string | Autocomplete search for global & Indian stock symbols. |
| `GET` | `/api/market/quote/{symbol}` | `symbol`: ticker | Real-time quote, price, day change, volume, high/low, P/E. |
| `GET` | `/api/market/history/{symbol}` | `timeframe`: `1D`, `1W`, `1M`, `6M`, `1Y`, `5Y` | Historical OHLCV candle/line chart data points. |
| `GET` | `/api/market/indicators/{symbol}` | `symbol`: ticker | Technical analysis data: RSI, SMA 20/50/200, MACD, Bollinger Bands. |
| `GET` | `/api/market/fundamentals/{symbol}` | `symbol`: ticker | Fundamental ratios: P/E, P/B, EPS, Beta, Debt/Equity, Margins, FCF. |
| `GET` | `/api/market/news/{symbol}` | `symbol`: ticker | Recent news headlines with publisher and sentiment classification. |

### 2. Virtual Portfolio (`/api/portfolio`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portfolio/summary` | *None* | Cash balance, total equity value, unrealized/realized P&L, positions list. |
| `POST` | `/api/portfolio/trade` | `TradeOrderCreate` | Places a Market or Limit order (`BUY` or `SELL`). |
| `POST` | `/api/portfolio/approve-proposal`| `TradeApprovalRequest` | Executes or declines an AI-proposed trade card (HITL). |
| `GET` | `/api/portfolio/transactions` | *None* | Chronological audit ledger of all executed and rejected orders. |
| `POST` | `/api/portfolio/reset` | *None* | Resets virtual portfolio to initial cash and liquidates positions. |

### 3. Multi-Agent Research (`/api/analysis`)

| Method | Endpoint | Query Params | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/analysis/run` | `symbol`: ticker | Executes full 5-agent LangGraph workflow and stores synthesized report. |
| `GET` | `/api/analysis/reports` | *None* | Lists the last 10 generated multi-agent research reports. |
| `GET` | `/api/analysis/report/{id}` | `id`: integer | Retrieves detailed report breakdown and agent logs by ID. |

### 4. Conversational AI Copilot (`/api/chat`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chat/history` | *None* | Fetches conversation thread for the active user. |
| `POST` | `/api/chat/send` | `{"message": "..."}` | Sends message to AI advisor; triggers tool calls and memory retrieval. |
| `DELETE`| `/api/chat/clear` | *None* | Purges current conversation history from database. |

### 5. Watchlist (`/api/watchlist`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/watchlist` | *None* | Retrieves all stocks on the user's active watchlist with live prices. |
| `POST` | `/api/watchlist/add` | `{"symbol": "...", "notes": "..."}` | Adds a stock symbol to the watchlist. |
| `DELETE`| `/api/watchlist/{symbol}`| `symbol`: ticker | Removes a symbol from the watchlist. |

### 6. User Profile (`/api/user`)

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

Expected test execution output:
```text
tests/test_backend.py::test_health PASSED                                [ 14%]
tests/test_backend.py::test_market_quote PASSED                          [ 28%]
tests/test_backend.py::test_market_indian_stock_quote PASSED             [ 42%]
tests/test_backend.py::test_technical_indicators PASSED                  [ 57%]
tests/test_backend.py::test_portfolio_summary_and_trade PASSED           [ 71%]
tests/test_backend.py::test_multi_agent_langgraph_analysis PASSED        [ 85%]
tests/test_backend.py::test_chat_interaction_and_proposal PASSED         [100%]

======================= 7 passed in ~7.0s =======================
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

## ❓ Troubleshooting & FAQ

#### 1. Port 8000 or 5173 is already in use
If you encounter an `EADDRINUSE` or `Address already in use` error:
- Running `./run.sh` automatically finds and terminates orphaned processes occupying these ports.
- Alternatively, free them manually:
  ```bash
  lsof -ti :8000 | xargs kill -9
  lsof -ti :5173 | xargs kill -9
  ```

#### 2. Yahoo Finance returns an empty response
When Yahoo Finance experiences temporary network latency or rate-limits an IP address:
- AlphaAgent's market data service includes automatic fallback logic that generates realistic prices and historical candles so the platform remains fully functional.
- The 60-second in-memory TTL cache prevents duplicate calls during rapid navigation.

#### 3. How do I switch to PostgreSQL?
1. Update `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/stockmarket"
   ```
2. Ensure PostgreSQL is running, or simply launch via Docker Compose:
   ```bash
   docker compose up --build
   ```

#### 4. Can I use Google Gemini, OpenAI, or Claude?
Yes! Add your respective API key to `backend/.env`:
```env
GEMINI_API_KEY="AIzaSy..."
# or
OPENAI_API_KEY="sk-..."
# or
ANTHROPIC_API_KEY="sk-ant-..."
```
The application will automatically detect the key and prioritize the cloud LLM for agent reasoning. If no keys are specified, it defaults to the local heuristic engine.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for AI researchers, quantitative analysts, and financial technology builders.</sub>
</div>
