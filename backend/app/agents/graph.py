import json
from typing import Dict, Any, List
from langgraph.graph import StateGraph, START, END
from backend.app.agents.state import AgentState
from backend.app.agents.llm_factory import invoke_llm_json
from backend.app.services.market_data import (
    get_stock_quote,
    get_technical_indicators,
    get_financial_metrics,
    get_company_news,
    normalize_symbol
)

# =========================================================================
# Node 1: Technical Analyst (LLM Powered)
# =========================================================================
def technical_analyst_node(state: AgentState) -> Dict[str, Any]:
    quote = state["quote"]
    tech = state["technical_data"]
    price = quote.get("price") or 100.0
    rsi = tech.get("rsi") if tech.get("rsi") is not None else 50.0
    sma20 = tech.get("sma20") or price
    sma50 = tech.get("sma50") or price
    sma200 = tech.get("sma200") or price
    macd = tech.get("macd") if tech.get("macd") is not None else 0.0
    macd_signal = tech.get("macd_signal") if tech.get("macd_signal") is not None else 0.0
    macd_hist = tech.get("macd_hist") if tech.get("macd_hist") is not None else 0.0
    upper_band = tech.get("upper_band") or (price * 1.06)
    lower_band = tech.get("lower_band") or (price * 0.94)
    sym = state["symbol"]
    company = quote.get("company_name") or sym

    prompt = f"""You are a Chartered Senior Technical Analyst examining {company} ({sym}).
Current Market Data:
- Price: ₹{price:,.2f}
- SMA 20: ₹{sma20:,.2f} | SMA 50: ₹{sma50:,.2f} | SMA 200: ₹{sma200:,.2f}
- 14-Day RSI: {rsi:.1f}
- MACD Line: {macd:.3f} | Signal Line: {macd_signal:.3f} | Histogram: {macd_hist:.3f}
- Bollinger Bands: Upper ₹{upper_band:,.2f} | Lower ₹{lower_band:,.2f}

Provide your expert technical assessment as a JSON object with EXACTLY these keys:
- "trend": string ("Bullish", "Bearish", or "Neutral")
- "rsi_signal": string ("Overbought", "Oversold", or "Neutral")
- "ma_alignment": string describing moving average alignment (e.g. "Bullish crossover above 20 & 50 SMAs")
- "key_support": float (price level for dynamic support)
- "key_resistance": float (price level for overhead resistance)
- "score": integer between 10 and 95 (technical bullishness score)
- "bullet_points": list of 4 concrete, professional analytical bullet strings explaining momentum, trend structure, key price levels, and oscillator dynamics.

Output ONLY valid JSON."""

    system_prompt = "You are an elite quantitative technical analyst. Provide accurate, professional technical market evaluations strictly in JSON format."
    llm_res = invoke_llm_json(prompt, system_prompt)

    used_llm = False
    if llm_res and isinstance(llm_res, dict) and "score" in llm_res:
        try:
            report = {
                "trend": str(llm_res.get("trend", "Bullish" if price > sma20 else "Bearish")),
                "rsi_signal": str(llm_res.get("rsi_signal", "Neutral")),
                "ma_alignment": str(llm_res.get("ma_alignment", "Moving averages aligned")),
                "key_support": round(float(llm_res.get("key_support", lower_band)), 2),
                "key_resistance": round(float(llm_res.get("key_resistance", upper_band)), 2),
                "score": int(max(10, min(95, llm_res.get("score", 50)))),
                "bullet_points": [str(b) for b in llm_res.get("bullet_points", [])][:4]
            }
            if len(report["bullet_points"]) >= 3:
                used_llm = True
        except Exception:
            used_llm = False

    if not used_llm:
        trend = "Bullish" if price > sma20 else "Bearish"
        rsi_signal = "Overbought" if rsi > 70 else ("Oversold" if rsi < 30 else "Neutral")
        ma_alignment = "Bullish crossover (Above SMA 20 & 50)" if price > sma20 and price > sma50 else "Testing moving average support"
        score = 50
        if trend == "Bullish": score += 20
        if 40 < rsi < 60: score += 10
        if rsi < 35: score += 15
        if macd > macd_signal: score += 10
        score = max(10, min(95, score))
        support = lower_band or round(price * 0.94, 2)
        resistance = upper_band or round(price * 1.06, 2)
        report = {
            "trend": trend,
            "rsi_signal": rsi_signal,
            "ma_alignment": ma_alignment,
            "key_support": round(support, 2),
            "key_resistance": round(resistance, 2),
            "score": score,
            "bullet_points": [
                f"Price is trading at ₹{price:,.2f}, indicating a {trend.lower()} near-term chart pattern.",
                f"RSI (14-day) stands at {rsi:.1f}, currently reflecting {rsi_signal.lower()} conditions.",
                f"Key dynamic support identified around ₹{support:,.2f}, resistance at ₹{resistance:,.2f}.",
                f"MACD histogram momentum is {'positive and expanding' if macd > macd_signal else 'softening'}."
            ]
        }

    logs = list(state.get("agent_logs", []))
    engine_tag = "LLM" if used_llm else "Heuristic Fallback"
    logs.append(f"[Technical Analyst ({engine_tag})] Completed chart pattern & indicator analysis for {state['symbol']} (Score: {report['score']}/100)")
    return {"technical_report": report, "agent_logs": logs}

# =========================================================================
# Node 2: Fundamental Analyst (LLM Powered)
# =========================================================================
def fundamental_analyst_node(state: AgentState) -> Dict[str, Any]:
    funds = state["fundamental_data"]
    quote = state["quote"]
    sym = state["symbol"]
    company = quote.get("company_name") or sym
    price = quote.get("price") or 100.0
    pe = funds.get("pe_ratio") or 25.0
    forward_pe = funds.get("forward_pe") or pe
    pb = funds.get("pb_ratio") or 3.5
    eps = funds.get("eps") or (price / pe if pe else 5.0)
    margins = funds.get("profit_margins") if funds.get("profit_margins") is not None else 0.15
    roe = funds.get("roe") if funds.get("roe") is not None else 0.18
    fcf = funds.get("free_cash_flow") or 1000000000.0
    debt_equity = funds.get("debt_to_equity") if funds.get("debt_to_equity") is not None else 40.0
    div_yield = funds.get("dividend_yield") if funds.get("dividend_yield") is not None else 0.01

    prompt = f"""You are a Wall Street & Dalal Street Senior Equity Research Analyst examining {company} ({sym}).
Fundamental Financial Metrics:
- Current Price: ₹{price:,.2f}
- P/E Ratio: {pe:.2f}x | Forward P/E: {forward_pe:.2f}x | P/B Ratio: {pb:.2f}x
- EPS: ₹{eps:,.2f}
- Net Profit Margin: {margins * 100:.1f}% | Return on Equity (ROE): {roe * 100:.1f}%
- Debt-to-Equity Ratio: {debt_equity:.2f}
- Annual Free Cash Flow: ₹{fcf:,.2f}
- Dividend Yield: {div_yield * 100:.2f}%

Provide your fundamental valuation and balance sheet verdict as a JSON object with EXACTLY these keys:
- "valuation_verdict": string ("Undervalued", "Fairly Valued", or "Overvalued")
- "growth_health": string ("Robust", "Stable", or "Weak")
- "balance_sheet": string ("Pristine", "Acceptable", or "Leveraged")
- "score": integer between 15 and 95 (fundamental quality score)
- "bullet_points": list of 4 in-depth, rigorous analytical bullet strings addressing earnings multiples, margin sustainability, debt health, and cash flow durability.

Output ONLY valid JSON."""

    system_prompt = "You are a seasoned fundamental equity analyst. Evaluate enterprise valuation, profitability, balance sheet safety, and free cash flows strictly in JSON format."
    llm_res = invoke_llm_json(prompt, system_prompt)

    used_llm = False
    if llm_res and isinstance(llm_res, dict) and "score" in llm_res:
        try:
            report = {
                "valuation_verdict": str(llm_res.get("valuation_verdict", "Fairly Valued")),
                "growth_health": str(llm_res.get("growth_health", "Stable")),
                "balance_sheet": str(llm_res.get("balance_sheet", "Acceptable")),
                "score": int(max(15, min(95, llm_res.get("score", 55)))),
                "bullet_points": [str(b) for b in llm_res.get("bullet_points", [])][:4]
            }
            if len(report["bullet_points"]) >= 3:
                used_llm = True
        except Exception:
            used_llm = False

    if not used_llm:
        val_verdict = "Undervalued" if pe < 18 else ("Overvalued" if pe > 40 else "Fairly Valued")
        growth = "Robust" if margins > 0.18 else ("Stable" if margins > 0.08 else "Weak")
        balance_sheet = "Pristine" if debt_equity < 30 else ("Acceptable" if debt_equity < 80 else "Leveraged")
        score = 55
        if val_verdict == "Undervalued": score += 20
        elif val_verdict == "Fairly Valued": score += 10
        if growth == "Robust": score += 15
        if balance_sheet == "Pristine": score += 10
        score = max(15, min(95, score))
        report = {
            "valuation_verdict": val_verdict,
            "growth_health": growth,
            "balance_sheet": balance_sheet,
            "score": score,
            "bullet_points": [
                f"P/E ratio stands at {pe:.1f}x, suggesting the company is {val_verdict.lower()} against broader sector benchmarks.",
                f"Net profit margins estimated at {margins * 100:.1f}%, highlighting {growth.lower()} operational efficiency.",
                f"Capital structure reflects a Debt-to-Equity ratio of {debt_equity:.1f}, assessed as {balance_sheet.lower()}.",
                f"Annualized free cash flow generation provides strong reinvestment and shareholder return buffers."
            ]
        }

    logs = list(state.get("agent_logs", []))
    engine_tag = "LLM" if used_llm else "Heuristic Fallback"
    logs.append(f"[Fundamental Analyst ({engine_tag})] Evaluated balance sheet, multiples, and cash flow for {state['symbol']} (Score: {report['score']}/100)")
    return {"fundamental_report": report, "agent_logs": logs}

# =========================================================================
# Node 3: News & Sentiment Analyst (LLM Powered)
# =========================================================================
def sentiment_analyst_node(state: AgentState) -> Dict[str, Any]:
    news = state.get("news_data", [])
    sym = state["symbol"]
    company = state["quote"].get("company_name") or sym

    news_items = [f"- Title: {n.get('title')} (Publisher: {n.get('publisher')}, Tag: {n.get('sentiment')})" for n in news[:6]]
    news_text = "\n".join(news_items) if news_items else "No recent major breaking news headlines recorded."

    prompt = f"""You are a Senior Financial Media & Sentiment Analyst evaluating {company} ({sym}).
Recent Market Headlines & Coverage:
{news_text}

Provide your media and market sentiment assessment as a JSON object with EXACTLY these keys:
- "sentiment": string ("Positive", "Neutral", or "Negative")
- "news_momentum": string ("High", "Moderate", or "Low")
- "score": integer between 20 and 90 (market sentiment score, 50=neutral, >65=bullish, <45=bearish)
- "bullet_points": list of 3 insightful, concise analytical bullet strings evaluating news catalysts, public sentiment, and institutional perception.

Output ONLY valid JSON."""

    system_prompt = "You are a financial sentiment intelligence specialist. Synthesize news sentiment, catalysts, and public buzz strictly in JSON format."
    llm_res = invoke_llm_json(prompt, system_prompt)

    used_llm = False
    if llm_res and isinstance(llm_res, dict) and "score" in llm_res:
        try:
            report = {
                "sentiment": str(llm_res.get("sentiment", "Neutral")),
                "news_momentum": str(llm_res.get("news_momentum", "Moderate")),
                "score": int(max(10, min(95, llm_res.get("score", 60)))),
                "bullet_points": [str(b) for b in llm_res.get("bullet_points", [])][:3]
            }
            if len(report["bullet_points"]) >= 2:
                used_llm = True
        except Exception:
            used_llm = False

    if not used_llm:
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

        report = {
            "sentiment": sentiment,
            "news_momentum": "High" if len(news) > 3 else "Moderate",
            "score": score,
            "bullet_points": [
                f"Analyzed {len(news)} recent headlines; media coverage is broadly {sentiment.lower()}.",
                f"Positive catalysts identified in operational developments and sector sentiment.",
                f"Institutional flow indicators show steady positioning with low headline shock risk."
            ]
        }

    logs = list(state.get("agent_logs", []))
    engine_tag = "LLM" if used_llm else "Heuristic Fallback"
    logs.append(f"[Sentiment Analyst ({engine_tag})] Scanned recent news feeds & public market sentiment for {state['symbol']} (Score: {report['score']}/100)")
    return {"sentiment_report": report, "agent_logs": logs}

# =========================================================================
# Node 4: Risk Analyst (LLM Powered)
# =========================================================================
def risk_analyst_node(state: AgentState) -> Dict[str, Any]:
    quote = state["quote"]
    funds = state["fundamental_data"]
    tech = state["technical_data"]
    sym = state["symbol"]
    company = quote.get("company_name") or sym
    price = quote.get("price") or 100.0
    beta = funds.get("beta") or 1.1
    debt_equity = funds.get("debt_to_equity") if funds.get("debt_to_equity") is not None else 40.0
    risk_tol = state.get("user_risk_tolerance") or "Moderate"
    lower_band = tech.get("lower_band") or (price * 0.92)

    prompt = f"""You are a Chief Quantitative Risk Officer assessing downside volatility and tail risk for {company} ({sym}).
Risk Parameters:
- Current Market Price: ₹{price:,.2f}
- Stock Beta: {beta:.2f} (market benchmark = 1.0)
- Debt-to-Equity: {debt_equity:.2f}
- User Investor Risk Profile: {risk_tol}
- Bollinger Lower Support: ₹{lower_band:,.2f}

Provide your risk quantification and stop-loss recommendation as a JSON object with EXACTLY these keys:
- "risk_tier": string ("Low", "Moderate", or "High")
- "volatility_assessment": string summarizing the asset's volatility profile
- "suggested_stop_loss": float (realistic protective stop-loss price level, typically 5-10% below current price based on technical support)
- "risk_score": integer between 15 and 90 (where higher score means HIGHER risk/volatility, 30=low risk, 55=moderate risk, 80=high risk)
- "bullet_points": list of 3 concise, analytical bullet strings evaluating beta sensitivity, capital preservation, downside tail risks, and stop-loss placement.

Output ONLY valid JSON."""

    system_prompt = "You are a quantitative risk management executive. Quantify downside risk, drawdown exposure, and stop loss levels strictly in JSON format."
    llm_res = invoke_llm_json(prompt, system_prompt)

    used_llm = False
    if llm_res and isinstance(llm_res, dict) and "risk_score" in llm_res:
        try:
            suggested_sl = float(llm_res.get("suggested_stop_loss", round(price * 0.92, 2)))
            if suggested_sl >= price or suggested_sl <= price * 0.7:
                suggested_sl = round(price * 0.92, 2)
            report = {
                "risk_tier": str(llm_res.get("risk_tier", "Moderate")),
                "volatility_assessment": str(llm_res.get("volatility_assessment", f"Beta {beta:.2f} volatility")),
                "suggested_stop_loss": round(suggested_sl, 2),
                "risk_score": int(max(10, min(95, llm_res.get("risk_score", 50)))),
                "bullet_points": [str(b) for b in llm_res.get("bullet_points", [])][:3]
            }
            if len(report["bullet_points"]) >= 2:
                used_llm = True
        except Exception:
            used_llm = False

    if not used_llm:
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
        report = {
            "risk_tier": tier,
            "volatility_assessment": f"{tier} beta exposure",
            "suggested_stop_loss": stop_loss,
            "risk_score": risk_score,
            "bullet_points": [
                f"Equity Beta of {beta:.2f} implies volatility {('above' if beta > 1.0 else 'below')} broader market movements.",
                f"Recommended protective stop-loss level placed at ₹{stop_loss:,.2f} (~8% downside buffer).",
                f"Tail risk factors include broader macroeconomic tightening and potential margin pressure."
            ]
        }

    logs = list(state.get("agent_logs", []))
    engine_tag = "LLM" if used_llm else "Heuristic Fallback"
    logs.append(f"[Risk Analyst ({engine_tag})] Quantified drawdown vulnerability and stop-loss levels for {state['symbol']} (Risk Tier: {report['risk_tier']})")
    return {"risk_report": report, "agent_logs": logs}

# =========================================================================
# Node 5: Portfolio Manager (LLM Powered Synthesis)
# =========================================================================
def portfolio_manager_node(state: AgentState) -> Dict[str, Any]:
    quote = state["quote"]
    tech = state["technical_report"]
    fund = state["fundamental_report"]
    sent = state["sentiment_report"]
    risk = state["risk_report"]
    risk_tol = state.get("user_risk_tolerance") or "Moderate"
    price = quote.get("price") or 100.0
    sym = state["symbol"]
    company = quote.get("company_name") or sym

    prompt = f"""You are the Chief Investment Officer (CIO) and Portfolio Manager synthesizing multi-agent research on {company} ({sym}).
User Risk Profile: {risk_tol}
Current Share Price: ₹{price:,.2f}

Specialist Agent Reports:
1. Technical Analyst:
   - Trend: {tech['trend']} | RSI: {tech['rsi_signal']} | Alignment: {tech['ma_alignment']}
   - Key Resistance: ₹{tech['key_resistance']} | Key Support: ₹{tech['key_support']} | Score: {tech['score']}/100
2. Fundamental Analyst:
   - Valuation: {fund['valuation_verdict']} | Growth: {fund['growth_health']} | Balance Sheet: {fund['balance_sheet']} | Score: {fund['score']}/100
3. Sentiment Analyst:
   - Sentiment: {sent['sentiment']} | News Momentum: {sent['news_momentum']} | Score: {sent['score']}/100
4. Risk Analyst:
   - Risk Tier: {risk['risk_tier']} | Volatility: {risk['volatility_assessment']} | Risk Score: {risk['risk_score']}/100 | Recommended Stop Loss: ₹{risk['suggested_stop_loss']}

Synthesize these four reports into a coherent institutional consensus as a JSON object with EXACTLY these keys:
- "overall_rating": string (Must be one of: "STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL")
- "target_price": float (12-month upside/downside price target in ₹ based on fundamental and technical upside)
- "confidence_score": integer between 60 and 95 (overall consensus confidence percent)
- "summary": string (A rich, analytical 3-4 sentence executive summary detailing the investment thesis, catalyst, and risk balance)
- "portfolio_fit": string (1-2 sentences explaining how this fits an investor with {risk_tol} risk tolerance)
- "suggested_max_allocation_pct": float (suggested max portfolio allocation percentage, e.g. 3.0 to 10.0)
- "trade_rationale": string (1 sentence explaining rationale for execution)

Output ONLY valid JSON."""

    system_prompt = "You are a Chief Investment Officer. Synthesize multiple agent reports into an authoritative, professional investment decision strictly in JSON format."
    llm_res = invoke_llm_json(prompt, system_prompt)

    used_llm = False
    if llm_res and isinstance(llm_res, dict) and "overall_rating" in llm_res:
        try:
            rating_candidate = str(llm_res.get("overall_rating", "")).upper()
            if rating_candidate in ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]:
                rating = rating_candidate
            else:
                rating = "HOLD"

            target_price = round(float(llm_res.get("target_price", price * 1.08)), 2)
            if target_price <= 0 or target_price > price * 3.0:
                target_price = round(price * 1.10, 2)

            confidence = int(max(55, min(95, llm_res.get("confidence_score", 75))))
            summary = str(llm_res.get("summary", "")).strip()
            portfolio_fit = str(llm_res.get("portfolio_fit", f"Suitable for {risk_tol} investors seeking equity exposure.")).strip()
            suggested_alloc = round(float(llm_res.get("suggested_max_allocation_pct", 5.0)), 1)
            trade_rationale = str(llm_res.get("trade_rationale", f"Consensus {rating} with target ₹{target_price:,.2f}.")).strip()

            if len(summary) > 40:
                used_llm = True
        except Exception:
            used_llm = False

    if not used_llm:
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
        suggested_alloc = 8.0 if risk_tol == "Aggressive" else (5.0 if risk_tol == "Moderate" else 3.0)
        portfolio_fit = f"Suitable for {risk_tol} investors seeking core equity exposure."
        trade_rationale = f"Multi-agent consensus ({rating}) with {confidence}% confidence and upside target ₹{target_price:,.2f}."
        summary = (
            f"Consensus multi-agent rating for {company} ({sym}) is {rating} "
            f"with a target price of ₹{target_price:,.2f} and stop-loss at ₹{risk['suggested_stop_loss']:,.2f}. "
            f"Fundamental metrics show {fund['valuation_verdict'].lower()} valuation, supported by {tech['trend'].lower()} "
            f"technical momentum and {sent['sentiment'].lower()} news sentiment."
        )

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
            "rationale": trade_rationale,
            "risk_level": "Moderate",
            "status": "PENDING_APPROVAL"
        }

    recommendation = {
        "suggested_action": rating,
        "portfolio_fit": portfolio_fit,
        "suggested_max_allocation_pct": suggested_alloc,
        "proposed_trade": proposed_trade
    }

    final_report = {
        "symbol": sym,
        "company_name": company,
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
    engine_tag = "LLM" if used_llm else "Heuristic Fallback"
    logs.append(f"[Portfolio Manager ({engine_tag})] Finalized multi-agent synthesis: {rating} rating, Target ₹{target_price:,.2f} (Confidence: {confidence}%)")
    return {"portfolio_recommendation": recommendation, "final_report": final_report, "agent_logs": logs}

# =========================================================================
# LangGraph Workflow Definition & Execution
# =========================================================================
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
