from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.transaction import Return, Transaction, TransactionItem
from models.inventory import Inventory
from models.product import Product
from models.store import Store
from routers.auth import get_current_user
from models.user import User
from datetime import datetime

router = APIRouter(prefix="/returns", tags=["returns"])

class ReturnRequest(BaseModel):
    txn_id: str
    reason: str
    refund_amount: float

@router.post("")
def create_return(req: ReturnRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    txn = db.query(Transaction).filter(Transaction.txn_id == req.txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    ret = Return(
        txn_id=req.txn_id,
        store_id=txn.store_id,
        reason=req.reason,
        refund_amount=req.refund_amount,
        status="pending"
    )
    db.add(ret)
    db.commit()
    db.refresh(ret)
    return {"return_id": str(ret.return_id), "status": ret.status}

@router.get("")
def list_returns(
    store_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Return, Transaction).join(Transaction, Return.txn_id == Transaction.txn_id)

    if current_user.role == "admin":
        # Admin sees all stores, optionally filtered
        if store_id:
            query = query.filter(Return.store_id == store_id)
    else:
        # Everyone else (supervisor, associate, warehouse) only sees their own store
        if current_user.store_id:
            query = query.filter(Return.store_id == current_user.store_id)

    if status:
        query = query.filter(Return.status == status)

    results = query.order_by(Return.created_at.desc()).all()

    return [
        {
            "return_id": str(r.return_id),
            "txn_id": str(r.txn_id),
            "store_id": str(r.store_id),
            "reason": r.reason,
            "status": r.status,
            "refund_amount": float(r.refund_amount) if r.refund_amount else 0,
            "created_at": r.created_at.isoformat(),
            "transaction_total": float(t.total) if t.total else 0
        }
        for r, t in results
    ]

@router.patch("/{return_id}/approve")
def approve_return(return_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    ret = db.query(Return).filter(Return.return_id == return_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")

    # Supervisor can only approve returns from their own store
    if current_user.role == "supervisor" and str(ret.store_id) != str(current_user.store_id):
        raise HTTPException(status_code=403, detail="You can only approve returns from your own store")

    ret.status = "approved"
    ret.processed_by = current_user.user_id

    # Re-stock items
    items = db.query(TransactionItem).filter(TransactionItem.txn_id == ret.txn_id).all()
    for item in items:
        inv = db.query(Inventory).filter(
            Inventory.product_id == item.product_id,
            Inventory.store_id == ret.store_id
        ).first()
        if inv:
            inv.quantity += item.qty
            inv.last_updated = datetime.utcnow()

    db.commit()
    return {"message": "Return approved", "return_id": return_id}

@router.patch("/{return_id}/reject")
def reject_return(return_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    ret = db.query(Return).filter(Return.return_id == return_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")

    # Supervisor can only reject returns from their own store
    if current_user.role == "supervisor" and str(ret.store_id) != str(current_user.store_id):
        raise HTTPException(status_code=403, detail="You can only reject returns from your own store")

    ret.status = "rejected"
    ret.processed_by = current_user.user_id
    db.commit()
    return {"message": "Return rejected", "return_id": return_id}
