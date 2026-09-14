import os
import re
import json
from typing import Optional, Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from backend.app.config import settings

def extract_text_content(content: Any) -> str:
    """Safely extracts text content from LLM response whether it is str, list of blocks, or dict."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for part in content:
            if isinstance(part, str):
                texts.append(part)
            elif isinstance(part, dict) and "text" in part:
                texts.append(str(part["text"]))
            elif hasattr(part, "text"):
                texts.append(str(part.text))
        return "\n".join(texts)
    if hasattr(content, "text"):
        return str(content.text)
    return str(content)

ACTIVE_GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-flash-latest"
]

def get_llm(model_name: Optional[str] = None, temperature: float = 0.2):
    """
    Returns an LLM instance based on available environment variables:
    1. Gemini (langchain-google-genai) with active working model
    2. OpenAI (langchain-openai) with gpt-4o-mini
    3. None if both fail or credentials are missing
    """
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
    
    if gemini_key:
        models_to_try = [model_name] if model_name else ACTIVE_GEMINI_MODELS
        for m in models_to_try:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                return ChatGoogleGenerativeAI(
                    model=m,
                    google_api_key=gemini_key,
                    temperature=temperature
                )
            except Exception:
                continue
            
    if openai_key:
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model="gpt-4o-mini",
                openai_api_key=openai_key,
                temperature=temperature
            )
        except Exception as e:
            print(f"Error initializing OpenAI: {e}")

    return None

def invoke_llm_text(prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
    """
    Invokes the active LLM with optional system instruction and returns cleaned text.
    Automatically retries across active Gemini models and OpenAI fallback if rate limit occurs.
    """
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    openai_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")

    messages = []
    if system_prompt:
        messages.append(SystemMessage(content=system_prompt))
    messages.append(HumanMessage(content=prompt))

    # Try active Gemini models in sequence
    if gemini_key:
        for m in ACTIVE_GEMINI_MODELS:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                llm = ChatGoogleGenerativeAI(model=m, google_api_key=gemini_key, temperature=0.2)
                res = llm.invoke(messages)
                return extract_text_content(res.content).strip()
            except Exception as e:
                # If rate limited (429) or model issue, attempt next model in pool
                print(f"Gemini model {m} failed ({type(e).__name__}); attempting fallback...")
                continue

    # Fallback to OpenAI if Gemini pool exhausted
    if openai_key:
        try:
            from langchain_openai import ChatOpenAI
            fb_llm = ChatOpenAI(model="gpt-4o-mini", openai_api_key=openai_key, temperature=0.2)
            res = fb_llm.invoke(messages)
            return extract_text_content(res.content).strip()
        except Exception as fb_err:
            print(f"Fallback to OpenAI also failed: {fb_err}")

    return None

def invoke_llm_json(prompt: str, system_prompt: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Invokes the active LLM, parses the returned text into a JSON dictionary.
    Handles Markdown backticks (```json ... ```) and loose formatting.
    Returns None if invocation or parsing fails.
    """
    text = invoke_llm_text(prompt, system_prompt)
    if not text:
        return None
    
    # Clean possible markdown blocks
    cleaned = text.strip()
    if "```" in cleaned:
        # Extract content between first ``` and last ```
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', cleaned, re.IGNORECASE)
        if match:
            cleaned = match.group(1).strip()
            
    # Try finding outer JSON object {...}
    brace_match = re.search(r'\{[\s\S]*\}', cleaned)
    if brace_match:
        cleaned = brace_match.group(0)
        
    try:
        return json.loads(cleaned, strict=False)
    except Exception:
        # Fallback: remove unescaped newlines/tabs inside string literals
        try:
            sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', ' ', cleaned)
            return json.loads(sanitized, strict=False)
        except Exception as e:
            print(f"Failed to parse LLM JSON response: {e}\nRaw response was:\n{text[:300]}")
            return None

