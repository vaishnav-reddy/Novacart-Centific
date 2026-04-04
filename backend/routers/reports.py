from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import Optional
from database import get_db
from models.transaction import Transaction, TransactionItem, Return
from models.product import Product
from models.store import Store
from models.inventory import Inventory
from routers.auth import get_current_user
from models.user import User
from datetime import datetime, timedelta

router = APIRouter(prefix="/reports", tags=["reports"])

def get_period_start(period: str) -> datetime:
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)
    return datetime.utcnow() - timedelta(days=days)

@router.get("/dashboard")
def dashboard_report(
    store_id: Optional[str] = Query(None),
    period: str = Query("30d"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    start = get_period_start(period)
    
    effective_store_id = store_id
    if not effective_store_id and current_user.role not in ["admin", "executive"]:
        effective_store_id = str(current_user.store_id) if current_user.store_id else None

    base_q = db.query(Transaction).filter(Transaction.created_at >= start)
    if effective_store_id:
        base_q = base_q.filter(Transaction.store_id == effective_store_id)

    total_revenue = base_q.with_entities(func.sum(Transaction.total)).scalar() or 0
    total_txns = base_q.with_entities(func.count(Transaction.txn_id)).scalar() or 0
    avg_basket = float(total_revenue) / total_txns if total_txns > 0 else 0

    # Top products
    top_q = db.query(
        Product.name,
        func.sum(TransactionItem.qty).label("qty_sold"),
        func.sum(TransactionItem.qty * TransactionItem.unit_price).label("revenue")
    ).join(TransactionItem, Product.product_id == TransactionItem.product_id
    ).join(Transaction, TransactionItem.txn_id == Transaction.txn_id
    ).filter(Transaction.created_at >= start)
    if effective_store_id:
        top_q = top_q.filter(Transaction.store_id == effective_store_id)
    top_products = top_q.group_by(Product.name).order_by(func.sum(TransactionItem.qty).desc()).limit(5).all()

    # Daily revenue
    daily_q = db.query(
        cast(Transaction.created_at, Date).label("date"),
        func.sum(Transaction.total).label("revenue")
    ).filter(Transaction.created_at >= start)
    if effective_store_id:
        daily_q = daily_q.filter(Transaction.store_id == effective_store_id)
    daily_revenue = daily_q.group_by(cast(Transaction.created_at, Date)).order_by(cast(Transaction.created_at, Date)).all()

    # Category breakdown
    cat_q = db.query(
        Product.category,
        func.sum(TransactionItem.qty * TransactionItem.unit_price).label("revenue")
    ).join(TransactionItem, Product.product_id == TransactionItem.product_id
    ).join(Transaction, TransactionItem.txn_id == Transaction.txn_id
    ).filter(Transaction.created_at >= start)
    if effective_store_id:
        cat_q = cat_q.filter(Transaction.store_id == effective_store_id)
    cat_data = cat_q.group_by(Product.category).all()
    cat_total = sum(float(c.revenue) for c in cat_data) or 1

    # Low stock
    low_stock_q = db.query(func.count(Inventory.id)).filter(Inventory.quantity < Inventory.reorder_level)
    if effective_store_id:
        low_stock_q = low_stock_q.filter(Inventory.store_id == effective_store_id)
    low_stock_count = low_stock_q.scalar() or 0

    # Pending returns
    ret_q = db.query(func.count(Return.return_id)).filter(Return.status == "pending")
    if effective_store_id:
        ret_q = ret_q.filter(Return.store_id == effective_store_id)
    pending_returns = ret_q.scalar() or 0

    return {
        "total_revenue": round(float(total_revenue), 2),
        "total_transactions": total_txns,
        "avg_basket_size": round(avg_basket, 2),
        "store_name": db.query(Store.name).filter(Store.store_id == effective_store_id).scalar() if effective_store_id else "All Stores",
        "top_products": [{"name": p.name, "qty_sold": p.qty_sold, "revenue": round(float(p.revenue), 2)} for p in top_products],
        "daily_revenue": [{"date": str(d.date), "revenue": round(float(d.revenue), 2)} for d in daily_revenue],
        "category_breakdown": [
            {"category": c.category, "revenue": round(float(c.revenue), 2), "percentage": round(float(c.revenue) / cat_total * 100, 1)}
            for c in cat_data
        ],
        "low_stock_count": low_stock_count,
        "pending_returns_count": pending_returns
    }

@router.get("/store-comparison")
def store_comparison(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "executive"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    stores = db.query(Store).filter(Store.is_active == True).all()
    result = []
    for store in stores:
        revenue = db.query(func.sum(Transaction.total)).filter(Transaction.store_id == store.store_id).scalar() or 0
        txns = db.query(func.count(Transaction.txn_id)).filter(Transaction.store_id == store.store_id).scalar() or 0

        top_cat = db.query(
            Product.category,
            func.sum(TransactionItem.qty).label("qty")
        ).join(TransactionItem, Product.product_id == TransactionItem.product_id
        ).join(Transaction, TransactionItem.txn_id == Transaction.txn_id
        ).filter(Transaction.store_id == store.store_id
        ).group_by(Product.category).order_by(func.sum(TransactionItem.qty).desc()).first()

        result.append({
            "store_name": store.name,
            "store_id": str(store.store_id),
            "revenue": round(float(revenue), 2),
            "transactions": txns,
            "top_category": top_cat.category if top_cat else "N/A"
        })
    return result
