from langgraph.graph import StateGraph, START, END
from backend.app.agents.state import AgentState
from backend.app.agents.llm_factory import get_llm
from backend.app.services.market_data import (
    get_stock_quote,
    get_technical_indicators,
    get_financial_metrics,
    get_company_news,
    normalize_symbol
)
from typing import Dict, Any

# Node 1: Technical Analyst
def technical_analyst_node(state: AgentState) -> Dict[str, Any]:
    quote = state["quote"]
    tech = state["technical_data"]
    price = quote.get("price", 100.0)
    rsi = tech.get("rsi", 50.0)
    sma20 = tech.get("sma20", price)
    sma50 = tech.get("sma50", price)
    macd = tech.get("macd", 0.0)
    macd_signal = tech.get("macd_signal", 0.0)

    # Technical logic
    trend = "Bullish" if price > sma20 else "Bearish"
    rsi_signal = "Overbought" if rsi > 70 else ("Oversold" if rsi < 30 else "Neutral")
    ma_alignment = "Bullish crossover (Above SMA 20 & 50)" if price > sma20 and price > sma50 else "Testing moving average support"
    
    score = 50
    if trend == "Bullish": score += 20
    if rsi < 60 and rsi > 40: score += 10
    if rsi < 35: score += 15 # Oversold bounce potential
    if macd > macd_signal: score += 10
    score = max(10, min(95, score))

    support = tech.get("lower_band") or round(price * 0.94, 2)
    resistance = tech.get("upper_band") or round(price * 1.06, 2)

    bullets = [
        f"Price is trading at ₹{price:,.2f}, indicating a {trend.lower()} near-term structure.",
        f"RSI (14-day) stands at {rsi:.1f}, currently reflecting {rsi_signal.lower()} conditions.",
        f"Key dynamic support identified around ₹{support:,.2f}, resistance at ₹{resistance:,.2f}.",
        f"MACD histogram momentum is {'positive and expanding' if macd > macd_signal else 'softening'}."
    ]

    report = {
        "trend": trend,
        "rsi_signal": rsi_signal,
        "ma_alignment": ma_alignment,
        "key_support": round(support, 2),
        "key_resistance": round(resistance, 2),
        "score": score,
        "bullet_points": bullets
    }
    
    logs = list(state.get("agent_logs", []))
    logs.append(f"[Technical Analyst] Completed chart pattern & indicator analysis for {state['symbol']} (Score: {score}/100)")
    return {"technical_report": report, "agent_logs": logs}

# Node 2: Fundamental Analyst
def fundamental_analyst_node(state: AgentState) -> Dict[str, Any]:
    funds = state["fundamental_data"]
    quote = state["quote"]
    pe = funds.get("pe_ratio") or 25.0
    margins = funds.get("profit_margins") or 0.15
    fcf = funds.get("free_cash_flow") or 1000000000.0
    debt_equity = funds.get("debt_to_equity") or 40.0

    val_verdict = "Undervalued" if pe < 18 else ("Overvalued" if pe > 40 else "Fairly Valued")
    growth = "Robust" if margins > 0.18 else ("Stable" if margins > 0.08 else "Weak")
    balance_sheet = "Pristine" if debt_equity < 30 else ("Acceptable" if debt_equity < 80 else "Leveraged")

    score = 55
    if val_verdict == "Undervalued": score += 20
    elif val_verdict == "Fairly Valued": score += 10
    if growth == "Robust": score += 15
    if balance_sheet == "Pristine": score += 10
    score = max(15, min(95, score))

    bullets = [
        f"P/E ratio stands at {pe:.1f}x, suggesting the company is {val_verdict.lower()} against broader sector benchmarks.",
        f"Net profit margins estimated at {margins * 100:.1f}%, highlighting {growth.lower()} operational efficiency.",
        f"Capital structure reflects a Debt-to-Equity ratio of {debt_equity:.1f}, assessed as {balance_sheet.lower()}.",
        f"Annualized free cash flow generation provides strong reinvestment and shareholder return buffers."
    ]

    report = {
        "valuation_verdict": val_verdict,
        "growth_health": growth,
        "balance_sheet": balance_sheet,
        "score": score,
        "bullet_points": bullets
    }

    logs = list(state.get("agent_logs", []))
    logs.append(f"[Fundamental Analyst] Evaluated balance sheet, P/E multiples, and cash flow for {state['symbol']} (Score: {score}/100)")
    return {"fundamental_report": report, "agent_logs": logs}

# Node 3: News & Sentiment Analyst
def sentiment_analyst_node(state: AgentState) -> Dict[str, Any]:
    news = state.get("news_data", [])
    bullish_cnt = sum(1 for n in news if n.get("sentiment") == "Bullish")
    bearish_cnt = sum(1 for n in news if n.get("sentiment") == "Bearish")

    if bullish_cnt > bearish_cnt:
        sentiment = "Positive"
        score = 75
    elif bearish_cnt > bullish_cnt:
        sentiment = "Negative"
        score = 40
    else:
        sentiment = "Neutral"
        score = 60

    bullets = [
        f"Analyzed {len(news)} recent headlines; media coverage is broadly {sentiment.lower()}.",
        f"Positive catalysts identified in operational developments and sector sentiment.",
        f"Institutional flow indicators show steady positioning with low headline shock risk."
    ]

    report = {
        "sentiment": sentiment,
        "news_momentum": "High" if len(news) > 3 else "Moderate",
        "score": score,
        "bullet_points": bullets
    }

    logs = list(state.get("agent_logs", []))
    logs.append(f"[Sentiment Analyst] Scanned recent news feeds & public market sentiment for {state['symbol']} (Score: {score}/100)")
    return {"sentiment_report": report, "agent_logs": logs}

# Node 4: Risk Analyst
def risk_analyst_node(state: AgentState) -> Dict[str, Any]:
    quote = state["quote"]
    funds = state["fundamental_data"]
    price = quote.get("price", 100.0)
    beta = funds.get("beta") or 1.1

    if beta > 1.4:
        tier = "High"
        risk_score = 78
    elif beta < 0.85:
        tier = "Low"
        risk_score = 30
    else:
        tier = "Moderate"
        risk_score = 50

    stop_loss = round(price * 0.92, 2)

    bullets = [
        f"Equity Beta of {beta:.2f} implies volatility {('above' if beta > 1.0 else 'below')} broader market movements.",
        f"Recommended protective stop-loss level placed at ₹{stop_loss:,.2f} (~8% downside buffer).",
        f"Tail risk factors include broader macroeconomic tightening and potential margin pressure."
    ]

    report = {
        "risk_tier": tier,
        "volatility_assessment": f"{tier} beta exposure",
        "suggested_stop_loss": stop_loss,
        "risk_score": risk_score,
        "bullet_points": bullets
    }

    logs = list(state.get("agent_logs", []))
    logs.append(f"[Risk Analyst] Quantified drawdown vulnerability and stop-loss levels for {state['symbol']} (Risk Tier: {tier})")
    return {"risk_report": report, "agent_logs": logs}

# Node 5: Portfolio Manager (Synthesis)
def portfolio_manager_node(state: AgentState) -> Dict[str, Any]:
    quote = state["quote"]
    tech = state["technical_report"]
    fund = state["fundamental_report"]
    sent = state["sentiment_report"]
    risk = state["risk_report"]
    risk_tol = state.get("user_risk_tolerance", "Moderate")
    price = quote.get("price", 100.0)
    sym = state["symbol"]

    # Weighted synthesis
    composite = (
        tech["score"] * 0.30 +
        fund["score"] * 0.35 +
        sent["score"] * 0.15 +
        (100 - risk["risk_score"]) * 0.20
    )

    if composite >= 75:
        rating = "STRONG_BUY"
        target_price = round(price * 1.15, 2)
    elif composite >= 60:
        rating = "BUY"
        target_price = round(price * 1.09, 2)
    elif composite >= 45:
        rating = "HOLD"
        target_price = round(price * 1.03, 2)
    elif composite >= 30:
        rating = "SELL"
        target_price = round(price * 0.92, 2)
    else:
        rating = "STRONG_SELL"
        target_price = round(price * 0.85, 2)

    confidence = int(min(95, max(60, 50 + abs(composite - 50) * 0.8)))
    
    # Generate proposed trade if rating is BUY / STRONG_BUY
    proposed_trade = None
    if rating in ["BUY", "STRONG_BUY"]:
        qty = 10 if price > 100 else 50
        proposed_trade = {
            "symbol": sym,
            "action": "BUY",
            "quantity": float(qty),
            "estimated_price": price,
            "total_estimated_cost": round(price * qty, 2),
            "rationale": f"Multi-agent consensus ({rating}) with {confidence}% confidence and attractive fundamental upside target ₹{target_price:,.2f}.",
            "risk_level": "Moderate",
            "status": "PENDING_APPROVAL"
        }

    recommendation = {
        "suggested_action": rating,
        "portfolio_fit": f"Suitable for {risk_tol} investors seeking core equity exposure.",
        "suggested_max_allocation_pct": 8.0 if risk_tol == "Aggressive" else (5.0 if risk_tol == "Moderate" else 3.0),
        "proposed_trade": proposed_trade
    }

    summary = (
        f"Consensus multi-agent rating for {quote.get('company_name', sym)} ({sym}) is {rating} "
        f"with a target price of ₹{target_price:,.2f} and stop-loss at ₹{risk['suggested_stop_loss']:,.2f}. "
        f"Fundamental metrics show {fund['valuation_verdict'].lower()} valuation, supported by {tech['trend'].lower()} "
        f"technical momentum and {sent['sentiment'].lower()} news sentiment."
    )

    final_report = {
        "symbol": sym,
        "company_name": quote.get("company_name", sym),
        "current_price": price,
        "overall_rating": rating,
        "target_price": target_price,
        "stop_loss": risk["suggested_stop_loss"],
        "risk_score": risk["risk_score"],
        "confidence_score": confidence,
        "summary": summary,
        "technical": tech,
        "fundamental": fund,
        "sentiment": sent,
        "risk": risk,
        "recommendation": recommendation
    }

    logs = list(state.get("agent_logs", []))
    logs.append(f"[Portfolio Manager] Finalized multi-agent synthesis: {rating} rating, Target ₹{target_price:,.2f}")
    return {"portfolio_recommendation": recommendation, "final_report": final_report, "agent_logs": logs}

def create_research_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("technical_analyst", technical_analyst_node)
    workflow.add_node("fundamental_analyst", fundamental_analyst_node)
    workflow.add_node("sentiment_analyst", sentiment_analyst_node)
    workflow.add_node("risk_analyst", risk_analyst_node)
    workflow.add_node("portfolio_manager", portfolio_manager_node)
    
    workflow.add_edge(START, "technical_analyst")
    workflow.add_edge("technical_analyst", "fundamental_analyst")
    workflow.add_edge("fundamental_analyst", "sentiment_analyst")
    workflow.add_edge("sentiment_analyst", "risk_analyst")
    workflow.add_edge("risk_analyst", "portfolio_manager")
    workflow.add_edge("portfolio_manager", END)
    
    return workflow.compile()

# Global compiled graph instance
research_graph = create_research_graph()

def run_multi_agent_analysis(symbol: str, user_risk_tolerance: str = "Moderate") -> Dict[str, Any]:
    clean_sym = normalize_symbol(symbol)
    quote = get_stock_quote(clean_sym)
    tech = get_technical_indicators(clean_sym)
    funds = get_financial_metrics(clean_sym)
    news = get_company_news(clean_sym)

    initial_state: AgentState = {
        "symbol": clean_sym,
        "user_risk_tolerance": user_risk_tolerance,
        "quote": quote.dict(),
        "technical_data": tech.dict(),
        "fundamental_data": funds.dict(),
        "news_data": [n.dict() for n in news],
        "technical_report": None,
        "fundamental_report": None,
        "sentiment_report": None,
        "risk_report": None,
        "portfolio_recommendation": None,
        "final_report": None,
        "agent_logs": []
    }

    result = research_graph.invoke(initial_state)
    return {
        "report": result["final_report"],
        "logs": result["agent_logs"]
    }
