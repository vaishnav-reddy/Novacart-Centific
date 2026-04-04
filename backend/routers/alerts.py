from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from services.alert_service import get_alerts
from routers.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("")
def alerts(
    store_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    effective_store_id = store_id
    if not effective_store_id and current_user.role not in ["admin", "executive"]:
        effective_store_id = str(current_user.store_id) if current_user.store_id else None
    return get_alerts(db, effective_store_id)
