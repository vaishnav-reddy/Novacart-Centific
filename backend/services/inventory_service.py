from sqlalchemy.orm import Session
from models.inventory import Inventory
from models.product import Product
from models.transaction import AuditLog
from datetime import datetime
import uuid

def get_stock_status(qty: int, reorder_level: int) -> str:
    if qty == 0:
        return "out"
    elif qty < reorder_level / 2:
        return "critical"
    elif qty < reorder_level:
        return "low"
    return "ok"

def adjust_inventory(db: Session, product_id: str, store_id: str, quantity_change: int, reason: str, user_id: str):
    inv = db.query(Inventory).filter(
        Inventory.product_id == product_id,
        Inventory.store_id == store_id
    ).first()
    if not inv:
        raise ValueError("Inventory record not found")
    
    new_qty = inv.quantity + quantity_change
    if new_qty < 0:
        raise ValueError("Insufficient stock")
    
    inv.quantity = new_qty
    inv.last_updated = datetime.utcnow()

    log = AuditLog(
        user_id=user_id,
        action="inventory_adjust",
        entity_type="inventory",
        entity_id=inv.id,
        details=f"Adjusted by {quantity_change}. Reason: {reason}. New qty: {new_qty}"
    )
    db.add(log)
    db.commit()
    db.refresh(inv)
    return inv
