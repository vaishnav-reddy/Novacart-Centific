"""
Run this once to populate the database with demo data.
Usage: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent / ".env", override=True)

from database import SessionLocal, engine, Base
import models  # noqa
from models.store import Store
from models.user import User
from models.product import Product
from models.inventory import Inventory
from models.transaction import Transaction, TransactionItem, Return, AuditLog
from services.auth_service import get_password_hash
import uuid
import random
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def clear_data():
    db.query(AuditLog).delete()
    db.query(Return).delete()
    db.query(TransactionItem).delete()
    db.query(Transaction).delete()
    db.query(Inventory).delete()
    db.query(User).delete()
    db.query(Product).delete()
    db.query(Store).delete()
    db.commit()
    print("Cleared existing data.")

def seed():
    clear_data()

    # --- Stores ---
    stores = [
        Store(name="Hyderabad Central", region="South", city="Hyderabad"),
        Store(name="Mumbai West", region="West", city="Mumbai"),
        Store(name="Bangalore North", region="South", city="Bangalore"),
    ]
    db.add_all(stores)
    db.flush()
    print(f"Created {len(stores)} stores.")

    # --- Users ---
    users = [
        User(name="Arjun Sharma", email="admin@novacart.com", hashed_password=get_password_hash("Demo@123"), role="admin", store_id=None),  # admin sees all stores
        User(name="Priya Nair", email="supervisor@novacart.com", hashed_password=get_password_hash("Demo@123"), role="supervisor", store_id=stores[0].store_id),  # Hyderabad
        User(name="Rahul Verma", email="associate@novacart.com", hashed_password=get_password_hash("Demo@123"), role="associate", store_id=stores[1].store_id),  # Mumbai
        User(name="Sneha Patel", email="warehouse@novacart.com", hashed_password=get_password_hash("Demo@123"), role="warehouse", store_id=stores[2].store_id),  # Bangalore
        User(name="Vikram Reddy", email="executive@novacart.com", hashed_password=get_password_hash("Demo@123"), role="executive", store_id=None),  # executive sees all
    ]
    db.add_all(users)
    db.flush()
    print(f"Created {len(users)} users.")

    # --- Products ---
    products_data = [
        ("Samsung Galaxy S24", "Smartphones", "Samsung", 74999.00, "BAR001"),
        ("Apple MacBook Air M2", "Laptops", "Apple", 114900.00, "BAR002"),
        ("Sony WH-1000XM5 Headphones", "Audio", "Sony", 29990.00, "BAR003"),
        ("iPad Pro 12.9", "Tablets", "Apple", 112900.00, "BAR004"),
        ('LG 55" 4K TV', "Televisions", "LG", 54990.00, "BAR005"),
        ("Logitech MX Master 3 Mouse", "Accessories", "Logitech", 9995.00, "BAR006"),
        ("Dell XPS 15 Laptop", "Laptops", "Dell", 159990.00, "BAR007"),
        ("OnePlus 12 5G", "Smartphones", "OnePlus", 64999.00, "BAR008"),
        ("JBL Charge 5 Speaker", "Audio", "JBL", 16999.00, "BAR009"),
        ("Canon EOS R50 Camera", "Cameras", "Canon", 74995.00, "BAR010"),
        ("HP LaserJet Printer", "Printers", "HP", 18999.00, "BAR011"),
        ("Apple Watch Series 9", "Wearables", "Apple", 41900.00, "BAR012"),
        ('Samsung 65" QLED TV', "Televisions", "Samsung", 129990.00, "BAR013"),
        ("Bose QuietComfort 45", "Audio", "Bose", 24990.00, "BAR014"),
        ("Mi Band 8", "Wearables", "Xiaomi", 3499.00, "BAR015"),
    ]
    products = []
    for name, cat, brand, price, barcode in products_data:
        p = Product(name=name, category=cat, brand=brand, price=price, barcode=barcode, tax_rate=18.0)
        products.append(p)
    db.add_all(products)
    db.flush()
    print(f"Created {len(products)} products.")

    # --- Inventory ---
    inventory_records = []
    for product in products:
        for store in stores:
            qty = random.randint(5, 100)
            inv = Inventory(
                product_id=product.product_id,
                store_id=store.store_id,
                quantity=qty,
                reorder_level=10
            )
            inventory_records.append(inv)
    db.add_all(inventory_records)
    db.flush()
    print(f"Created {len(inventory_records)} inventory records.")

    # --- Transactions: spread across stores with different volumes ---
    payment_types = ["cash", "upi", "card"]
    staff_users = [u for u in users if u.role in ["associate", "supervisor"]]

    # Give each store a different transaction count so dashboards differ
    store_txn_counts = {
        stores[0].store_id: 14,  # Hyderabad — highest volume
        stores[1].store_id: 10,  # Mumbai — medium
        stores[2].store_id: 6,   # Bangalore — lower
    }

    for store, count in store_txn_counts.items():
        store_staff = [u for u in staff_users if str(u.store_id) == str(store)]
        if not store_staff:
            store_staff = staff_users  # fallback

        for i in range(count):
            days_ago = random.randint(0, 29)
            txn_date = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 8))
            staff = random.choice(store_staff)
            num_items = random.randint(1, 4)
            selected_products = random.sample(products, num_items)

            subtotal = 0
            tax_total = 0
            txn_items = []

            for prod in selected_products:
                qty = random.randint(1, 3)
                unit_price = float(prod.price)
                line = unit_price * qty
                tax = line * 0.18
                subtotal += line
                tax_total += tax
                txn_items.append((prod, qty, unit_price))

            total = round(subtotal + tax_total, 2)
            txn = Transaction(
                store_id=store,
                staff_id=staff.user_id,
                total=total,
                tax_amount=round(tax_total, 2),
                payment_type=random.choice(payment_types),
                status="completed",
                created_at=txn_date
            )
            db.add(txn)
            db.flush()

            for prod, qty, unit_price in txn_items:
                ti = TransactionItem(
                    txn_id=txn.txn_id,
                    product_id=prod.product_id,
                    qty=qty,
                    unit_price=unit_price,
                    discount=0
                )
                db.add(ti)

    db.flush()
    print("Created 30 demo transactions.")

    db.commit()
    print("\n✅ Seed complete! NovaCart is demo-ready.")
    print("\nDemo credentials (password: Demo@123):")
    print("  admin@novacart.com")
    print("  supervisor@novacart.com")
    print("  associate@novacart.com")
    print("  warehouse@novacart.com")
    print("  executive@novacart.com")

if __name__ == "__main__":
    seed()
    db.close()
