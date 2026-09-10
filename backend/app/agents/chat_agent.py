import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.models import User, ChatMessage, UserMemoryFact
from backend.app.agents.llm_factory import get_llm
from backend.app.services.market_data import (
    get_stock_quote,
    get_technical_indicators,
    get_company_news,
    normalize_symbol,
    POPULAR_STOCKS
)
from backend.app.services.portfolio_service import get_portfolio_summary

STOP_WORDS = {
    "WHY", "DID", "HOW", "WHAT", "CAN", "BUY", "SELL", "THE", "AND", "FOR", "NOT", "YES", 
    "YOU", "ARE", "ALL", "NEW", "TOP", "LOW", "P/E", "RSI", "SMA", "EMA", "HOLD", "SHARES", 
    "SHARE", "STOCK", "STOCKS", "UNITS", "UNIT", "ORDER", "ORDERS", "TRADE", "TRADES", "FALL", 
    "DROP", "PORTFOLIO", "BALANCE", "MONEY", "INVEST", "INVESTING", "INVESTMENT", "DIVERSIFY", 
    "DIVERSIFICATION", "TODAY", "DOWN", "P&L", "GAIN", "LOSS", "RECOMMEND", "SUGGEST", "ANALYZE", 
    "ANALYSIS", "COMPARE", "VERSUS", "SHOW", "TELL", "GIVE", "SHOULD", "COULD", "WOULD", "PLEASE"
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

    # General ticker regex (e.g. MSFT, AAPL, NVDA, TSLA, etc.)
    potential = re.findall(r'\b[A-Z]{1,5}(?:\.[A-Z]{2})?\b', raw_upper)
    for p in potential:
        if p not in STOP_WORDS and len(p) >= 2:
            norm = normalize_symbol(p)
            if norm not in found:
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

    portfolio_sum = get_portfolio_summary(db, user.id)
    candidate_symbols = extract_symbols(text)
    target_symbol = candidate_symbols[0] if candidate_symbols else None

    tools_used = []
    trade_proposal = None
    response_text = ""

    # Detect intent
    is_portfolio_query = any(k in text.lower() for k in ["portfolio", "fall", "drop", "holdings", "down", "p&l", "balance", "net worth"]) and not any(k in text.lower() for k in ["buy", "sell"])
    is_diversify_query = any(k in text.lower() for k in ["diversify", "allocation", "rebalance", "spread"])
    is_buy_intent = any(k in text.lower() for k in ["buy", "purchase", "acquire"])
    is_compare_query = any(k in text.lower() for k in ["compare", "vs", "versus"]) and len(candidate_symbols) >= 2

    if is_buy_intent and target_symbol:
        sym = normalize_symbol(target_symbol)
        quote = get_stock_quote(sym)
        tech = get_technical_indicators(sym)

        qty_match = re.search(r'\b(\d+)\s*(?:shares|shs|units)?\b', text)
        qty = float(qty_match.group(1)) if qty_match else (10.0 if quote.price > 100 else 50.0)
        total_est = round(quote.price * qty, 2)
        
        tools_used.append({"tool": "propose_simulated_trade", "args": {"symbol": sym, "action": "BUY", "quantity": qty}})
        trade_proposal = {
            "symbol": sym,
            "action": "BUY",
            "quantity": qty,
            "estimated_price": quote.price,
            "total_estimated_cost": total_est,
            "rationale": f"User-requested allocation for {sym}. Technical indicators show {tech.current_trend} momentum (RSI: {tech.rsi:.1f}).",
            "risk_level": "Medium" if total_est < 25000 else "High",
            "status": "PENDING_APPROVAL"
        }
        response_text = (
            f"I have prepared a simulated paper trade proposal for **{int(qty)} shares of {sym}** ({quote.company_name}) "
            f"at the market price of **₹{quote.price:,.2f}** (Total: **₹{total_est:,.2f}**).\n\n"
            f"⚠️ **Human Approval Required**: As an AI safety measure, this trade will NOT be executed until you review and confirm it below."
        )

    elif is_compare_query:
        sym1, sym2 = candidate_symbols[0], candidate_symbols[1]
        tools_used.append({"tool": "get_stock_quote", "args": {"symbol": sym1}})
        tools_used.append({"tool": "get_stock_quote", "args": {"symbol": sym2}})
        q1 = get_stock_quote(sym1)
        q2 = get_stock_quote(sym2)
        
        response_text = (
            f"### Comparative Analysis: **{q1.symbol}** vs **{q2.symbol}**\n\n"
            f"| Metric | **{q1.symbol}** ({q1.company_name}) | **{q2.symbol}** ({q2.company_name}) |\n"
            f"|---|---|---|\n"
            f"| **Price** | ₹{q1.price:,.2f} ({q1.change_percent:+.2f}%) | ₹{q2.price:,.2f} ({q2.change_percent:+.2f}%) |\n"
            f"| **P/E Ratio** | {f'{q1.pe_ratio:.1f}x' if q1.pe_ratio else 'N/A'} | {f'{q2.pe_ratio:.1f}x' if q2.pe_ratio else 'N/A'} |\n"
            f"| **52W High** | ${q1.fifty_two_week_high or 0:,.2f} | ${q2.fifty_two_week_high or 0:,.2f} |\n"
            f"| **Sector** | {q1.sector} | {q2.sector} |\n\n"
            f"**Summary**: Both assets offer distinct risk/reward profiles. "
            f"**{q1.symbol}** displays {'higher momentum' if q1.change_percent > q2.change_percent else 'relative consolidation'} "
            f"compared to **{q2.symbol}**."
        )

    elif is_portfolio_query:
        tools_used.append({"tool": "get_portfolio_summary", "args": {"user_id": user.id}})
        positions_str = ", ".join([f"{p.symbol} ({int(p.quantity)} shs, {p.unrealized_pnl_percent:+.2f}%)" for p in portfolio_sum.positions]) or "No active stock positions (100% Cash)."
        
        response_text = (
            f"### Portfolio Health Check & Daily Attribution\n\n"
            f"- **Total Portfolio Value**: ₹{portfolio_sum.total_portfolio_value:,.2f}\n"
            f"- **Available Cash Balance**: ₹{portfolio_sum.cash_balance:,.2f}\n"
            f"- **Unrealized P&L**: ₹{portfolio_sum.total_unrealized_pnl:,.2f} ({portfolio_sum.total_unrealized_pnl_percent:+.2f}%)\n"
            f"- **Active Holdings**: {positions_str}\n\n"
            f"**Why did your portfolio move?**\n"
            f"Broad market volatility and recent tech sector rotations impacted open equity positions. "
            f"With your **{user.risk_tolerance}** profile, maintaining a cash reserve of ₹{portfolio_sum.cash_balance:,.2f} "
            f"provides defensive stability while allowing opportunistic buying during pullbacks."
        )

    elif is_diversify_query:
        tools_used.append({"tool": "get_portfolio_summary", "args": {"user_id": user.id}})
        response_text = (
            f"### Strategic Diversification Roadmap for {user.risk_tolerance} Profile\n\n"
            f"Currently, your virtual portfolio has **₹{portfolio_sum.cash_balance:,.2f}** in liquid cash "
            f"and **₹{portfolio_sum.total_equity:,.2f}** in active equity holdings.\n\n"
            f"**Recommended Target Asset Allocation**:\n"
            f"1. **Core Blue-Chip Equities (40%)**: Established leaders (e.g. `AAPL`, `MSFT`, `TCS.NS`) with resilient cash flows.\n"
            f"2. **High-Growth & AI Innovators (25%)**: Secular tech leaders (e.g. `NVDA`) with high margins.\n"
            f"3. **Defensive / Value Equities (20%)**: Energy & Consumer Conglomerates (e.g. `RELIANCE.NS`, Financials) for dividend yields.\n"
            f"4. **Cash Reserve (15%)**: Buffer for tactical rebalancing and risk mitigation.\n\n"
            f"Would you like me to prepare a simulated allocation plan for any specific sector?"
        )

    elif target_symbol:
        sym = normalize_symbol(target_symbol)
        tools_used.append({"tool": "get_stock_quote", "args": {"symbol": sym}})
        tools_used.append({"tool": "get_technical_indicators", "args": {"symbol": sym}})
        quote = get_stock_quote(sym)
        tech = get_technical_indicators(sym)

        response_text = (
            f"### Market & Technical Overview for **{sym}** ({quote.company_name})\n\n"
            f"- **Current Price**: ₹{quote.price:,.2f} ({quote.change_percent:+.2f}% today)\n"
            f"- **Technical Trend**: **{tech.current_trend}** (Signal: {tech.signal_summary})\n"
            f"- **RSI (14-Day)**: {tech.rsi:.1f} ({'Oversold' if tech.rsi < 30 else ('Overbought' if tech.rsi > 70 else 'Neutral')})\n"
            f"- **SMA 20 / 50**: ₹{tech.sma20:,.2f} / ₹{tech.sma50 or 0:,.2f}\n"
            f"- **Bollinger Resistance / Support**: ₹{tech.upper_band:,.2f} / ₹{tech.lower_band:,.2f}\n\n"
            f"**Recommendation**: {tech.signal_summary.upper()} based on short-term chart patterns. "
            f"You can also run a full 5-agent multi-agent audit in the **Multi-Agent Hub** or ask me to propose a trade!"
        )
    else:
        response_text = (
            f"Hello! I am your **AI Market & Portfolio Research Advisor**. "
            f"I have active memory of your profile (**{user.risk_tolerance} risk**, **₹{portfolio_sum.cash_balance:,.2f} cash available**).\n\n"
            f"Here are questions you can ask me right now:\n"
            f"- *\"Analyze TCS or AAPL\"*\n"
            f"- *\"Why did my portfolio fall today?\"*\n"
            f"- *\"Compare AAPL and MSFT\"*\n"
            f"- *\"Suggest how I should diversify my virtual portfolio\"*\n"
            f"- *\"Buy 10 shares of NVDA\"* (generates a human-approval trade card)"
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
