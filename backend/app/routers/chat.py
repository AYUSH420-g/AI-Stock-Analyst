from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.app.schemas.schemas import ChatMessageCreate, ChatMessageOut
from backend.app.models.models import ChatMessage
from backend.app.agents.chat_agent import process_chat_message
from backend.app.services.portfolio_service import get_or_create_user_and_portfolio

router = APIRouter(prefix="/chat", tags=["AI Chat Advisor"])

@router.get("/history", response_model=List[ChatMessageOut])
def get_history(db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.created_at.asc()).all()
    return messages

@router.post("/send", response_model=ChatMessageOut)
def send_message(msg_in: ChatMessageCreate, db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    try:
        reply = process_chat_message(db, user, msg_in.message)
        return reply
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat agent error: {str(e)}")

@router.delete("/clear")
def clear_history(db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    db.query(ChatMessage).filter(ChatMessage.user_id == user.id).delete()
    db.commit()
    return {"message": "Chat history cleared successfully."}
