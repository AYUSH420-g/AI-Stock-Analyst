from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from backend.app.database import get_db
from backend.app.schemas.schemas import MultiAgentReportOut
from backend.app.models.models import AgentReport
from backend.app.agents.graph import run_multi_agent_analysis
from backend.app.services.portfolio_service import get_or_create_user_and_portfolio

router = APIRouter(prefix="/analysis", tags=["Multi-Agent Research"])

@router.post("/run", response_model=Dict[str, Any])
def run_analysis(symbol: str = Query(..., description="Stock symbol, e.g. TCS, AAPL, NVDA"), db: Session = Depends(get_db)):
    user = get_or_create_user_and_portfolio(db)
    try:
        result = run_multi_agent_analysis(symbol, user.risk_tolerance)
        rep = result["report"]
        
        # Persist report in database
        db_rep = AgentReport(
            symbol=rep["symbol"],
            company_name=rep["company_name"],
            overall_rating=rep["overall_rating"],
            target_price=rep["target_price"],
            stop_loss=rep["stop_loss"],
            risk_score=rep["risk_score"],
            confidence_score=rep["confidence_score"],
            summary=rep["summary"],
            technical_analysis=rep["technical"],
            fundamental_analysis=rep["fundamental"],
            sentiment_analysis=rep["sentiment"],
            risk_analysis=rep["risk"],
            portfolio_recommendation=rep["recommendation"],
            created_at=datetime.utcnow()
        )
        db.add(db_rep)
        db.commit()
        db.refresh(db_rep)

        rep["id"] = db_rep.id
        rep["created_at"] = db_rep.created_at

        return {
            "report": rep,
            "agent_logs": result["logs"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-agent analysis failed: {str(e)}")

@router.get("/reports", response_model=List[Dict[str, Any]])
def list_reports(db: Session = Depends(get_db)):
    reps = db.query(AgentReport).order_by(AgentReport.created_at.desc()).limit(10).all()
    out = []
    for r in reps:
        out.append({
            "id": r.id,
            "symbol": r.symbol,
            "company_name": r.company_name,
            "overall_rating": r.overall_rating,
            "target_price": r.target_price,
            "risk_score": r.risk_score,
            "confidence_score": r.confidence_score,
            "summary": r.summary,
            "created_at": r.created_at
        })
    return out

@router.get("/report/{report_id}", response_model=Dict[str, Any])
def get_report(report_id: int, db: Session = Depends(get_db)):
    r = db.query(AgentReport).filter(AgentReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": r.id,
        "symbol": r.symbol,
        "company_name": r.company_name,
        "overall_rating": r.overall_rating,
        "target_price": r.target_price,
        "stop_loss": r.stop_loss,
        "risk_score": r.risk_score,
        "confidence_score": r.confidence_score,
        "summary": r.summary,
        "technical": r.technical_analysis,
        "fundamental": r.fundamental_analysis,
        "sentiment": r.sentiment_analysis,
        "risk": r.risk_analysis,
        "recommendation": r.portfolio_recommendation,
        "created_at": r.created_at
    }
