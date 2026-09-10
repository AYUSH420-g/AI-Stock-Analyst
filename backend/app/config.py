import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Stock Market Simulator & Research Platform"
    API_V1_STR: str = "/api"
    # SQLite by default for zero-setup execution, or PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stock_market.db")
    
    # AI API Keys (Supports Gemini, OpenAI, Anthropic, or fallback mock engine)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Virtual Portfolio initial cash balance in INR (₹10,00,000 / 10 Lakhs)
    INITIAL_CASH_BALANCE: float = 1000000.00
    CURRENCY: str = "INR"
    CURRENCY_SYMBOL: str = "₹"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
