import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List

# Find backend/.env or root .env
_current_dir = Path(__file__).resolve().parent
_backend_dir = _current_dir.parent
_root_dir = _backend_dir.parent

_env_candidates = [
    _backend_dir / ".env",
    _root_dir / ".env",
    Path(".env")
]

for env_path in _env_candidates:
    if env_path.exists():
        load_dotenv(env_path, override=False)

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Stock Market Simulator & Research Platform"
    API_V1_STR: str = "/api"
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
        extra = "allow"

settings = Settings()

