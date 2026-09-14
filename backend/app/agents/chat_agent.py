import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.models import User, ChatMessage, UserMemoryFact
from backend.app.agents.llm_factory import invoke_llm_text
from backend.app.services.market_data import (
    get_stock_quote,
    get_technical_indicators,
    get_financial_metrics,
    get_company_news,
    normalize_symbol,
    POPULAR_STOCKS
)
from backend.app.services.portfolio_service import get_portfolio_summary

COMMON_ENGLISH_WORDS = {
    "WHY", "DID", "HOW", "WHAT", "CAN", "BUY", "SELL", "THE", "AND", "FOR", "NOT", "YES", 
    "YOU", "ARE", "ALL", "NEW", "TOP", "LOW", "P/E", "RSI", "SMA", "EMA", "HOLD", "SHARES", 
    "SHARE", "STOCK", "STOCKS", "UNITS", "UNIT", "ORDER", "ORDERS", "TRADE", "TRADES", "FALL", 
    "DROP", "PORTFOLIO", "BALANCE", "MONEY", "INVEST", "INVESTING", "INVESTMENT", "DIVERSIFY", 
    "DIVERSIFICATION", "TODAY", "DOWN", "P&L", "GAIN", "LOSS", "RECOMMEND", "SUGGEST", "ANALYZE", 
    "ANALYSIS", "COMPARE", "VERSUS", "SHOW", "TELL", "GIVE", "SHOULD", "COULD", "WOULD", "PLEASE",
    "HELP", "TELL", "ABOUT", "WITH", "FROM", "WILL", "LIKE", "SOME", "GOOD", "BEST", "KEY",
    "OF", "MY", "IN", "ON", "AT", "TO", "IT", "IS", "ME", "AS", "DO", "AN", "BE", "BY", "OR",
    "SO", "WE", "HE", "NO", "UP", "IF", "GO", "US", "AM", "SEE", "NOW", "RUN", "SET", "GET",
    "PUT", "OUT", "DAY", "TWO", "ONE", "BIG", "FIT", "NET", "MAX", "MIN", "LOOK", "MUCH",
    "GROWTH", "OUTLOOK", "INDICATOR", "INDICATORS", "PRICE", "PRICES", "COST", "RATE"
}

def extract_symbols(text: str) -> List[str]:
    raw_upper = text.upper()
    found: List[str] = []

    # Direct company name aliases
    aliases = {
        "TCS": "TCS.NS",
        "TATA CONSULTANCY": "TCS.NS",
        "RELIANCE": "RELIANCE.NS",
        "INFOSYS": "INFY.NS",
        "INFY": "INFY.NS",
        "HDFC": "HDFCBANK.NS",
        "HDFCBANK": "HDFCBANK.NS",
        "APPLE": "AAPL",
        "NVIDIA": "NVDA",
        "MICROSOFT": "MSFT",
        "ALPHABET": "GOOGL",
        "GOOGLE": "GOOGL",
        "AMAZON": "AMZN",
        "TESLA": "TSLA"
    }
    for alias, sym in aliases.items():
        if re.search(rf'\b{re.escape(alias)}\b', raw_upper):
            if sym not in found:
                found.append(sym)

    # Check matches against POPULAR_STOCKS symbols
    for stock in POPULAR_STOCKS:
        sym = stock["symbol"]
        base_sym = sym.split(".")[0]
        if re.search(rf'\b{re.escape(base_sym)}\b', raw_upper) or re.search(rf'\b{re.escape(sym)}\b', raw_upper):
            if sym not in found:
                found.append(sym)

    # Match explicit tickers (e.g. $AAPL, $NVDA or uppercase 2-10 letter symbols like AAPL, INFY.NS)
    # Check words that were already uppercase in the user's text
    original_words = re.findall(r'\b\$?[A-Z]{2,10}(?:\.[A-Z]{2})?\b', text)
    for w in original_words:
        cleaned = w.lstrip('$')
        if cleaned not in COMMON_ENGLISH_WORDS:
            norm = normalize_symbol(cleaned)
            # Avoid adding if already added or if base symbol matches an existing ticker
            if norm not in found and not any(norm in f or f in norm for f in found):
                found.append(norm)

    return found

def process_chat_message(db: Session, user: User, user_message: str) -> Dict[str, Any]:
    text = user_message.strip()
    
    # Save user message in DB
    user_msg_db = ChatMessage(
        user_id=user.id,
        role="user",
        content=text
    )
    db.add(user_msg_db)
    db.commit()

    # Retrieve portfolio state
    portfolio_sum = get_portfolio_summary(db, user.id)
    candidate_symbols = extract_symbols(text)
    
    tools_used = []
    market_context_snippets = []
    trade_proposal = None

    # Fetch live market data for referenced symbols
    for sym in candidate_symbols[:3]:
        try:
            quote = get_stock_quote(sym)
            tools_used.append({"tool": "get_stock_quote", "args": {"symbol": sym}})
            
            tech = get_technical_indicators(sym)
            tools_used.append({"tool": "get_technical_indicators", "args": {"symbol": sym}})
            
            funds = get_financial_metrics(sym)
            tools_used.append({"tool": "get_financial_metrics", "args": {"symbol": sym}})
            
            news = get_company_news(sym)
            tools_used.append({"tool": "get_company_news", "args": {"symbol": sym}})
            
            snippet = (
                f"--- LIVE DATA FOR {sym} ({quote.company_name}) ---\n"
                f"- Current Price: ₹{quote.price:,.2f} ({quote.change_percent:+.2f}% today, High: ₹{quote.high:,.2f}, Low: ₹{quote.low:,.2f})\n"
                f"- Technicals: Trend={tech.current_trend}, RSI={tech.rsi:.1f}, SMA20=₹{tech.sma20:,.2f}, Upper Band=₹{tech.upper_band:,.2f}, Lower Band=₹{tech.lower_band:,.2f}, Signal={tech.signal_summary}\n"
                f"- Fundamentals: P/E={f'{funds.pe_ratio:.1f}x' if funds.pe_ratio else 'N/A'}, EPS=₹{funds.eps or 0:,.2f}, Beta={funds.beta or 1.0:.2f}, Profit Margins={f'{funds.profit_margins * 100:.1f}%' if funds.profit_margins else 'N/A'}\n"
                f"- Recent Headlines: " + "; ".join([n.title for n in news[:3]])
            )
            market_context_snippets.append(snippet)
        except Exception as err:
            print(f"Error fetching data for symbol {sym}: {err}")

    # Detect trade intent (BUY or SELL)
    is_buy_intent = any(k in text.lower() for k in ["buy", "purchase", "accumulate"])
    is_sell_intent = any(k in text.lower() for k in ["sell", "liquidate", "exit"])
    
    if (is_buy_intent or is_sell_intent) and candidate_symbols:
        action = "BUY" if is_buy_intent else "SELL"
        trade_sym = candidate_symbols[0]
        try:
            q = get_stock_quote(trade_sym)
            qty_match = re.search(r'\b(\d+)\s*(?:shares|shs|units)?\b', text)
            qty = float(qty_match.group(1)) if qty_match else (10.0 if q.price > 100 else 50.0)
            total_est = round(q.price * qty, 2)
            
            trade_proposal = {
                "symbol": trade_sym,
                "action": action,
                "quantity": qty,
                "estimated_price": q.price,
                "total_estimated_cost": total_est,
                "rationale": f"User-requested {action} order for {trade_sym} ({q.company_name}) at current market price ₹{q.price:,.2f}.",
                "risk_level": "Medium" if total_est < 50000 else "High",
                "status": "PENDING_APPROVAL"
            }
            tools_used.append({"tool": "propose_simulated_trade", "args": {"symbol": trade_sym, "action": action, "quantity": qty}})
        except Exception as e:
            print(f"Error generating trade proposal: {e}")

    # Build portfolio summary text
    positions_text = ", ".join([
        f"{p.symbol} ({int(p.quantity)} shs @ avg ₹{p.average_buy_price:,.2f}, P&L: ₹{p.unrealized_pnl:,.2f} / {p.unrealized_pnl_percent:+.2f}%)"
        for p in portfolio_sum.positions
    ]) or "None (100% Cash reserves)"

    if any(k in text.lower() for k in ["portfolio", "fall", "drop", "holdings", "down", "p&l", "balance", "net worth", "diversify"]):
        tools_used.append({"tool": "get_portfolio_summary", "args": {"user_id": user.id}})

    # Retrieve recent chat history for multi-turn conversation
    recent_history = db.query(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.created_at.desc()).limit(6).all()
    recent_history.reverse()

    history_lines = []
    for m in recent_history[:-1]:  # exclude just-added user message
        history_lines.append(f"{m.role.upper()}: {m.content[:200]}")
    history_context = "\n".join(history_lines) if history_lines else "None"

    # Construct LLM System Prompt
    system_prompt = f"""You are an elite, highly intelligent AI Senior Stock Market Research Analyst & Virtual Portfolio Advisor for this platform.
Your goals:
1. Provide deep, accurate, institutional-grade equity analysis, market commentary, and portfolio advice.
2. Use precise facts and real numbers from the injected live data below.
3. Keep responses structured, professional, and readable (use markdown headers, bold values, bullet points, and comparative tables when relevant).
4. Address the user directly based on their risk profile.

Investor Profile:
- Risk Tolerance: {user.risk_tolerance}
- Investment Horizon: {user.investment_horizon or 'Medium Term (1-3 Years)'}
- Available Cash Balance: ₹{portfolio_sum.cash_balance:,.2f}
- Total Portfolio Value: ₹{portfolio_sum.total_portfolio_value:,.2f}
- Total Unrealized P&L: ₹{portfolio_sum.total_unrealized_pnl:,.2f} ({portfolio_sum.total_unrealized_pnl_percent:+.2f}%)
- Current Open Holdings: {positions_text}

Live Market Data Available:
{"\n\n".join(market_context_snippets) if market_context_snippets else "No specific stock symbol was detected or requested in this turn."}

Recent Conversation History:
{history_context}

Important Safety & Trading Guardrail:
- If a simulated paper trade proposal has been requested or generated, acknowledge the proposed order and clearly state that it requires their explicit human approval via the interactive confirmation card.
- Do not give disclaimers on every line, but maintain sound financial reasoning."""

    # Invoke the LLM
    llm_response = invoke_llm_text(text, system_prompt)

    if llm_response and len(llm_response.strip()) > 20:
        response_text = llm_response.strip()
        # If trade proposal was generated, ensure reminder is present
        if trade_proposal and "human approval" not in response_text.lower() and "confirm" not in response_text.lower():
            response_text += f"\n\n⚠️ **Simulated Paper Trade Generated**: I have created a trade proposal card for **{int(trade_proposal['quantity'])} shares of {trade_proposal['symbol']}** below. Please review and approve to execute."
    else:
        # Heuristic fallback if LLM is unreachable
        if trade_proposal:
            response_text = (
                f"I have prepared a simulated paper trade proposal for **{int(trade_proposal['quantity'])} shares of {trade_proposal['symbol']}** "
                f"at the estimated market price of **₹{trade_proposal['estimated_price']:,.2f}** (Total: **₹{trade_proposal['total_estimated_cost']:,.2f}**).\n\n"
                f"⚠️ **Human Approval Required**: As an AI safety guardrail, this paper trade will not be executed until you review and confirm it below."
            )
        elif candidate_symbols:
            s = candidate_symbols[0]
            q = get_stock_quote(s)
            t = get_technical_indicators(s)
            response_text = (
                f"### Market & Indicator Overview for **{s}** ({q.company_name})\n\n"
                f"- **Current Price**: ₹{q.price:,.2f} ({q.change_percent:+.2f}% today)\n"
                f"- **Technical Momentum**: **{t.current_trend}** (RSI: {t.rsi:.1f})\n"
                f"- **Key Support / Resistance**: ₹{t.lower_band:,.2f} / ₹{t.upper_band:,.2f}\n"
                f"- **Summary**: {t.signal_summary.upper()} based on short-term chart structure.\n\n"
                f"You can also run a 5-agent multi-agent research audit in the **Multi-Agent Hub** or ask me to propose a trade!"
            )
        else:
            response_text = (
                f"Hello! I am your **AI Market & Portfolio Research Advisor**. "
                f"I have active memory of your profile (**{user.risk_tolerance} risk**, **₹{portfolio_sum.cash_balance:,.2f} cash available**).\n\n"
                f"Here are questions you can ask me right now:\n"
                f"- *'Analyze TCS or AAPL'*\n"
                f"- *'Why did my portfolio fall today?'*\n"
                f"- *'Compare AAPL and MSFT'*\n"
                f"- *'Suggest how I should diversify my virtual portfolio'*\n"
                f"- *'Buy 10 shares of NVDA'* (generates a human-approval trade card)"
            )

    # Save assistant response in DB
    asst_msg_db = ChatMessage(
        user_id=user.id,
        role="assistant",
        content=response_text,
        tool_calls=tools_used if tools_used else None,
        trade_proposal=trade_proposal
    )
    db.add(asst_msg_db)
    db.commit()
    db.refresh(asst_msg_db)

    return {
        "id": asst_msg_db.id,
        "role": "assistant",
        "content": response_text,
        "tool_calls": tools_used,
        "trade_proposal": trade_proposal,
        "created_at": asst_msg_db.created_at
    }
