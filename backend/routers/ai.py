from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.ai_service import query_ai, get_recommendations, detect_anomalies
from routers.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/ai", tags=["ai"])

class QueryRequest(BaseModel):
    question: str

class RecommendRequest(BaseModel):
    product_id: str
    store_id: str

@router.post("/query")
def ai_query(req: QueryRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        answer = query_ai(db, req.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend")
def recommend(req: RecommendRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recs = get_recommendations(db, req.product_id, req.store_id)
    return {"recommendations": recs}

@router.post("/anomalies")
def anomalies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = detect_anomalies(db)
    return {"anomalies": result}
