import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.app.services.market_data import get_stock_quote, get_technical_indicators, get_company_news
from backend.app.agents.graph import run_multi_agent_analysis

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_market_quote():
    quote = get_stock_quote("AAPL")
    assert quote.symbol == "AAPL"
    assert quote.price > 0
    assert quote.currency == "USD"

def test_market_indian_stock_quote():
    quote = get_stock_quote("TCS")
    assert quote.symbol == "TCS.NS"
    assert quote.price > 0
    assert quote.currency == "INR"

def test_technical_indicators():
    indicators = get_technical_indicators("AAPL")
    assert indicators.rsi is not None
    assert indicators.current_trend in ["Bullish", "Bearish", "Neutral"]

def test_portfolio_summary_and_trade():
    # Fetch initial portfolio summary
    res = client.get("/api/portfolio/summary")
    assert res.status_code == 200
    data = res.json()
    assert "cash_balance" in data
    assert data["cash_balance"] > 0

    # Place a paper buy order
    buy_res = client.post("/api/portfolio/trade", json={
        "symbol": "AAPL",
        "action": "BUY",
        "quantity": 5,
        "order_type": "MARKET"
    })
    assert buy_res.status_code == 200
    tx = buy_res.json()
    assert tx["action"] == "BUY"
    assert tx["quantity"] == 5
    assert tx["status"] == "EXECUTED"

    # Verify positions updated
    summary_res = client.get("/api/portfolio/summary")
    assert summary_res.status_code == 200
    updated_summary = summary_res.json()
    aapl_pos = next((p for p in updated_summary["positions"] if p["symbol"] == "AAPL"), None)
    assert aapl_pos is not None
    assert aapl_pos["quantity"] >= 5

def test_multi_agent_langgraph_analysis():
    result = run_multi_agent_analysis("AAPL", "Moderate")
    assert "report" in result
    rep = result["report"]
    assert rep["symbol"] == "AAPL"
    assert rep["overall_rating"] in ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]
    assert rep["technical"]["trend"] is not None
    assert rep["fundamental"]["valuation_verdict"] is not None
    assert rep["risk"]["risk_score"] > 0
    assert len(result["logs"]) >= 5

def test_chat_interaction_and_proposal():
    # Test chat with portfolio query
    chat_res = client.post("/api/chat/send", json={"message": "Why did my portfolio fall today?"})
    assert chat_res.status_code == 200
    body = chat_res.json()
    assert body["role"] == "assistant"
    assert len(body["content"]) > 0

    # Test buy query generating human-approval trade proposal
    buy_chat_res = client.post("/api/chat/send", json={"message": "Buy 10 shares of NVDA"})
    assert buy_chat_res.status_code == 200
    buy_body = buy_chat_res.json()
    assert buy_body["trade_proposal"] is not None
    assert buy_body["trade_proposal"]["symbol"] == "NVDA"
    assert buy_body["trade_proposal"]["status"] == "PENDING_APPROVAL"
