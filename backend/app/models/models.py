import datetime
import json
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, default="trader_alpha")
    email = Column(String, default="trader@simulator.ai")
    risk_tolerance = Column(String, default="Moderate") # Conservative, Moderate, Aggressive
    investment_horizon = Column(String, default="Medium-term") # Short-term, Medium-term, Long-term
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="user", uselist=False, cascade="all, delete-orphan")
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    memory_facts = relationship("UserMemoryFact", back_populates="user", cascade="all, delete-orphan")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    cash_balance = Column(Float, default=1000000.0)
    realized_pnl = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="portfolio")
    positions = relationship("Position", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("TradeTransaction", back_populates="portfolio", cascade="all, delete-orphan")

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)
    symbol = Column(String, index=True)
    company_name = Column(String, default="")
    quantity = Column(Float, default=0.0)
    average_buy_price = Column(Float, default=0.0)
    total_cost_basis = Column(Float, default=0.0)
    asset_class = Column(String, default="Equities")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="positions")

class TradeTransaction(Base):
    __tablename__ = "trade_transactions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)
    symbol = Column(String, index=True)
    action = Column(String) # BUY, SELL
    quantity = Column(Float)
    price = Column(Float)
    total_amount = Column(Float)
    status = Column(String, default="EXECUTED") # PENDING_APPROVAL, EXECUTED, REJECTED, CANCELLED
    order_type = Column(String, default="MARKET") # MARKET, LIMIT, AI_PROPOSED
    ai_rationale = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)

    portfolio = relationship("Portfolio", back_populates="transactions")

class Watchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    name = Column(String, default="Primary Watchlist")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="watchlists")
    items = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")

class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlists.id"), index=True)
    symbol = Column(String, index=True)
    notes = Column(String, nullable=True)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

    watchlist = relationship("Watchlist", back_populates="items")

class AgentReport(Base):
    __tablename__ = "agent_reports"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    company_name = Column(String, default="")
    overall_rating = Column(String) # STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
    target_price = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    risk_score = Column(Integer, default=50) # 1 to 100
    confidence_score = Column(Integer, default=80) # 1 to 100
    summary = Column(Text)
    
    # Detailed section results stored as JSON or stringified dicts
    technical_analysis = Column(JSON, nullable=True)
    fundamental_analysis = Column(JSON, nullable=True)
    sentiment_analysis = Column(JSON, nullable=True)
    risk_analysis = Column(JSON, nullable=True)
    portfolio_recommendation = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    role = Column(String) # user, assistant, system
    content = Column(Text)
    tool_calls = Column(JSON, nullable=True)
    trade_proposal = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")

class UserMemoryFact(Base):
    __tablename__ = "user_memory_facts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    category = Column(String) # preference, goal, observation
    fact = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="memory_facts")
