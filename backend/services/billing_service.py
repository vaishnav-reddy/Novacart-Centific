from sqlalchemy.orm import Session
from models.transaction import Transaction, TransactionItem
from models.inventory import Inventory
from models.product import Product
from datetime import datetime
import uuid

def process_checkout(db: Session, store_id: str, staff_id: str, items: list, payment_type: str, discount_percent: float = 0):
    subtotal = 0
    tax_total = 0
    receipt_items = []

    for item in items:
        product = db.query(Product).filter(Product.product_id == item["product_id"]).first()
        if not product:
            raise ValueError(f"Product {item['product_id']} not found")

        inv = db.query(Inventory).filter(
            Inventory.product_id == item["product_id"],
            Inventory.store_id == store_id
        ).first()
        if not inv or inv.quantity < item["qty"]:
            raise ValueError(f"Insufficient stock for {product.name}")

        line_total = float(item["unit_price"]) * item["qty"]
        discount_amt = line_total * (discount_percent / 100)
        line_after_discount = line_total - discount_amt
        tax = line_after_discount * (float(product.tax_rate) / 100)

        subtotal += line_after_discount
        tax_total += tax

        inv.quantity -= item["qty"]
        inv.last_updated = datetime.utcnow()

        receipt_items.append({
            "product_id": str(item["product_id"]),
            "product_name": product.name,
            "qty": item["qty"],
            "unit_price": float(item["unit_price"]),
            "discount": discount_percent,
            "line_total": round(line_after_discount + tax, 2)
        })

    total = round(subtotal + tax_total, 2)

    txn = Transaction(
        store_id=store_id,
        staff_id=staff_id,
        total=total,
        tax_amount=round(tax_total, 2),
        payment_type=payment_type,
        status="completed"
    )
    db.add(txn)
    db.flush()

    for item in items:
        ti = TransactionItem(
            txn_id=txn.txn_id,
            product_id=item["product_id"],
            qty=item["qty"],
            unit_price=item["unit_price"],
            discount=discount_percent
        )
        db.add(ti)

    db.commit()
    db.refresh(txn)

    return {
        "txn_id": str(txn.txn_id),
        "total": total,
        "tax": round(tax_total, 2),
        "subtotal": round(subtotal, 2),
        "items": receipt_items,
        "payment_type": payment_type,
        "created_at": txn.created_at.isoformat()
    }
