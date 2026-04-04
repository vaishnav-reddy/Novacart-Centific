from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models.transaction import Transaction, TransactionItem
from models.product import Product
from services.billing_service import process_checkout
from routers.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/billing", tags=["billing"])

class CheckoutItem(BaseModel):
    product_id: str
    qty: int
    unit_price: float

class CheckoutRequest(BaseModel):
    store_id: str
    items: List[CheckoutItem]
    payment_type: str
    discount_percent: Optional[float] = 0

@router.post("/checkout")
def checkout(req: CheckoutRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        result = process_checkout(
            db,
            req.store_id,
            str(current_user.user_id),
            [i.dict() for i in req.items],
            req.payment_type,
            req.discount_percent or 0
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transactions/lookup")
def lookup_transaction(
    txn_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lookup a single transaction by full UUID or last-8 short ID."""
    import uuid as uuid_lib
    txn_id_clean = txn_id.strip().lstrip('#').upper()

    t = None

    # Try full UUID
    if len(txn_id_clean) == 36:
        try:
            t = db.query(Transaction).filter(
                Transaction.txn_id == uuid_lib.UUID(txn_id_clean)
            ).first()
        except Exception:
            pass

    # Fall back to short ID scan (last 8 hex chars of UUID without dashes)
    if not t:
        recent = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(500).all()
        t = next((
            x for x in recent
            if str(x.txn_id).replace('-', '').upper()[-8:] == txn_id_clean
            or str(x.txn_id).upper() == txn_id_clean
        ), None)

    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")

    items = db.query(TransactionItem, Product).join(
        Product, TransactionItem.product_id == Product.product_id
    ).filter(TransactionItem.txn_id == t.txn_id).all()

    return {
        "txn_id": str(t.txn_id),
        "store_id": str(t.store_id),
        "total": float(t.total),
        "tax_amount": float(t.tax_amount),
        "payment_type": t.payment_type,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
        "items": [
            {"product_name": p.name, "qty": ti.qty, "unit_price": float(ti.unit_price), "discount": float(ti.discount)}
            for ti, p in items
        ]
    }

def get_transactions(
    store_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    query = db.query(Transaction)

    if store_id:
        query = query.filter(Transaction.store_id == store_id)
    elif current_user.role not in ["admin", "executive"] and current_user.store_id:
        query = query.filter(Transaction.store_id == current_user.store_id)

    if date_from:
        query = query.filter(Transaction.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Transaction.created_at <= datetime.fromisoformat(date_to))

    txns = query.order_by(Transaction.created_at.desc()).limit(100).all()

    result = []
    for t in txns:
        items = db.query(TransactionItem, Product).join(
            Product, TransactionItem.product_id == Product.product_id
        ).filter(TransactionItem.txn_id == t.txn_id).all()

        result.append({
            "txn_id": str(t.txn_id),
            "store_id": str(t.store_id),
            "total": float(t.total),
            "tax_amount": float(t.tax_amount),
            "payment_type": t.payment_type,
            "status": t.status,
            "created_at": t.created_at.isoformat(),
            "items": [
                {
                    "product_name": p.name,
                    "qty": ti.qty,
                    "unit_price": float(ti.unit_price),
                    "discount": float(ti.discount)
                }
                for ti, p in items
            ]
        })
    return result
