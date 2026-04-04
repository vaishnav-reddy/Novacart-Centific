from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.transaction import Transaction, TransactionItem
from models.product import Product
from models.inventory import Inventory
from datetime import datetime, timedelta
import os

def get_store_context(db: Session) -> str:
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    total_revenue = db.query(func.sum(Transaction.total)).filter(
        Transaction.created_at >= seven_days_ago
    ).scalar() or 0

    total_txns = db.query(func.count(Transaction.txn_id)).filter(
        Transaction.created_at >= seven_days_ago
    ).scalar() or 0

    top_products = db.query(
        Product.name,
        func.sum(TransactionItem.qty).label("qty_sold")
    ).join(TransactionItem, Product.product_id == TransactionItem.product_id
    ).join(Transaction, TransactionItem.txn_id == Transaction.txn_id
    ).filter(Transaction.created_at >= seven_days_ago
    ).group_by(Product.name
    ).order_by(func.sum(TransactionItem.qty).desc()
    ).limit(5).all()

    low_stock_count = db.query(func.count(Inventory.id)).filter(
        Inventory.quantity < Inventory.reorder_level
    ).scalar() or 0

    top_str = ", ".join([f"{p.name} ({p.qty_sold} units)" for p in top_products])
    
    return (
        f"Last 7 days: Revenue=₹{float(total_revenue):,.2f}, "
        f"Transactions={total_txns}, "
        f"Top products: {top_str}, "
        f"Low stock items: {low_stock_count}"
    )

def query_ai(db: Session, question: str) -> str:
    from dotenv import load_dotenv
    from pathlib import Path
    load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=True)
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_api_key or groq_api_key in ("your_groq_api_key_here", ""):
        return "AI service not configured. Please set GROQ_API_KEY in backend/.env (free at console.groq.com)"

    store_context = get_store_context(db)
    today = datetime.utcnow().strftime("%Y-%m-%d")

    system_prompt = f"""You are NovaCart's AI business assistant for a consumer electronics retail chain with 74 stores across India.
You help store managers and supervisors understand their sales, inventory, and performance data.
Today's date: {today}.
Store context: {store_context}.
Be concise, use numbers, and format data clearly. Use ₹ for currency."""

    llm = ChatGroq(
        groq_api_key=groq_api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.3
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=question)
    ]

    response = llm.invoke(messages)
    return response.content

def get_recommendations(db: Session, product_id: str, store_id: str) -> list:
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        return []

    recs = db.query(Product, Inventory).join(
        Inventory, Product.product_id == Inventory.product_id
    ).filter(
        Product.category == product.category,
        Product.product_id != product_id,
        Inventory.store_id == store_id,
        Inventory.quantity > 0,
        Product.is_active == True
    ).limit(3).all()

    return [
        {
            "product_id": str(p.product_id),
            "name": p.name,
            "price": float(p.price),
            "category": p.category,
            "stock": inv.quantity
        }
        for p, inv in recs
    ]

def detect_anomalies(db: Session) -> list:
    anomalies = []
    last_24h = datetime.utcnow() - timedelta(hours=24)

    avg_total = db.query(func.avg(Transaction.total)).filter(
        Transaction.created_at >= last_24h
    ).scalar() or 0

    if avg_total > 0:
        high_txns = db.query(Transaction).filter(
            Transaction.created_at >= last_24h,
            Transaction.total > avg_total * 3
        ).all()
        for t in high_txns:
            anomalies.append({
                "type": "high_value_transaction",
                "description": f"Transaction ₹{float(t.total):,.2f} is 3x above average (₹{float(avg_total):,.2f})",
                "severity": "high",
                "timestamp": t.created_at.isoformat()
            })

    from models.transaction import Return
    from models.user import User
    staff_returns = db.query(
        Return.processed_by,
        func.count(Return.return_id).label("cnt")
    ).filter(
        Return.created_at >= last_24h
    ).group_by(Return.processed_by).having(func.count(Return.return_id) > 3).all()

    for sr in staff_returns:
        user = db.query(User).filter(User.user_id == sr.processed_by).first()
        name = user.name if user else "Unknown"
        anomalies.append({
            "type": "excessive_returns",
            "description": f"Staff member {name} processed {sr.cnt} returns in last 24h",
            "severity": "medium",
            "timestamp": datetime.utcnow().isoformat()
        })

    return anomalies
