from typing import TypedDict, Optional, List, Dict, Any

class AgentState(TypedDict):
    symbol: str
    user_risk_tolerance: str
    quote: Dict[str, Any]
    technical_data: Dict[str, Any]
    fundamental_data: Dict[str, Any]
    news_data: List[Dict[str, Any]]
    
    # Analyst reports
    technical_report: Optional[Dict[str, Any]]
    fundamental_report: Optional[Dict[str, Any]]
    sentiment_report: Optional[Dict[str, Any]]
    risk_report: Optional[Dict[str, Any]]
    portfolio_recommendation: Optional[Dict[str, Any]]
    
    # Final synthesized output
    final_report: Optional[Dict[str, Any]]
    agent_logs: List[str]
