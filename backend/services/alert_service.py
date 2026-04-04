from sqlalchemy.orm import Session
from sqlalchemy import func
from models.inventory import Inventory
from models.product import Product
from models.store import Store
from models.transaction import Return
from services.inventory_service import get_stock_status

def get_alerts(db: Session, store_id: str = None):
    query = db.query(Inventory, Product, Store).join(
        Product, Inventory.product_id == Product.product_id
    ).join(Store, Inventory.store_id == Store.store_id)

    if store_id:
        query = query.filter(Inventory.store_id == store_id)

    records = query.all()

    low_stock = []
    critical_stock = []
    out_of_stock = []

    for inv, product, store in records:
        status = get_stock_status(inv.quantity, inv.reorder_level)
        item = {
            "product_name": product.name,
            "store": store.name,
            "quantity": inv.quantity,
            "reorder_level": inv.reorder_level
        }
        if status == "out":
            out_of_stock.append(item)
        elif status == "critical":
            critical_stock.append(item)
        elif status == "low":
            low_stock.append(item)

    returns_query = db.query(Return).filter(Return.status == "pending")
    if store_id:
        returns_query = returns_query.filter(Return.store_id == store_id)
    pending_returns = returns_query.all()

    return {
        "low_stock": low_stock,
        "critical_stock": critical_stock,
        "out_of_stock": out_of_stock,
        "pending_returns": [
            {
                "return_id": str(r.return_id),
                "reason": r.reason,
                "amount": float(r.refund_amount) if r.refund_amount else 0
            }
            for r in pending_returns
        ]
    }
