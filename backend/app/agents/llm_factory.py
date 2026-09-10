import os
from typing import Optional
from backend.app.config import settings

def get_llm():
    """
    Returns an LLM instance based on available environment variables:
    1. Gemini (langchain-google-genai) if GEMINI_API_KEY is present
    2. OpenAI (langchain-openai) if OPENAI_API_KEY is present
    3. None (falls back to intelligent heuristic financial synthesizer)
    """
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
    
    if gemini_key:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            return ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=gemini_key,
                temperature=0.2
            )
        except Exception as e:
            print(f"Error initializing Gemini: {e}")
            
    if openai_key:
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model="gpt-4o-mini",
                openai_api_key=openai_key,
                temperature=0.2
            )
        except Exception as e:
            print(f"Error initializing OpenAI: {e}")

    return None
