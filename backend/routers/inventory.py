from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.inventory import Inventory
from models.product import Product
from models.store import Store
from services.inventory_service import get_stock_status, adjust_inventory
from routers.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/inventory", tags=["inventory"])

class AdjustRequest(BaseModel):
    product_id: str
    store_id: str
    quantity_change: int
    reason: str

@router.get("")
def list_inventory(
    store_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Inventory, Product, Store).join(
        Product, Inventory.product_id == Product.product_id
    ).join(Store, Inventory.store_id == Store.store_id)

    if store_id:
        query = query.filter(Inventory.store_id == store_id)
    elif current_user.role not in ["admin", "executive"] and current_user.store_id:
        query = query.filter(Inventory.store_id == current_user.store_id)

    if category:
        query = query.filter(Product.category == category)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    results = query.all()
    return [
        {
            "inventory_id": str(inv.id),
            "product_id": str(product.product_id),
            "product_name": product.name,
            "category": product.category,
            "brand": product.brand,
            "barcode": product.barcode,
            "price": float(product.price),
            "store_id": str(store.store_id),
            "store_name": store.name,
            "quantity": inv.quantity,
            "reorder_level": inv.reorder_level,
            "status": get_stock_status(inv.quantity, inv.reorder_level),
            "last_updated": inv.last_updated.isoformat()
        }
        for inv, product, store in results
    ]

@router.get("/sku/{barcode}")
def get_by_barcode(barcode: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.barcode == barcode).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    inv = db.query(Inventory).filter(
        Inventory.product_id == product.product_id,
        Inventory.store_id == current_user.store_id
    ).first()

    return {
        "product_id": str(product.product_id),
        "name": product.name,
        "category": product.category,
        "brand": product.brand,
        "price": float(product.price),
        "barcode": product.barcode,
        "quantity": inv.quantity if inv else 0,
        "status": get_stock_status(inv.quantity if inv else 0, inv.reorder_level if inv else 10)
    }

@router.post("/adjust")
def adjust_stock(req: AdjustRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "supervisor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    try:
        inv = adjust_inventory(db, req.product_id, req.store_id, req.quantity_change, req.reason, str(current_user.user_id))
        return {"message": "Stock adjusted", "new_quantity": inv.quantity}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
