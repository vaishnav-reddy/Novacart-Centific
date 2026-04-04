from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    txn_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.store_id"))
    staff_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    total = Column(Numeric(10, 2))
    tax_amount = Column(Numeric(10, 2))
    payment_type = Column(String(20))
    status = Column(String(20), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    store = relationship("Store", back_populates="transactions")
    staff = relationship("User", back_populates="transactions")
    items = relationship("TransactionItem", back_populates="transaction")
    returns = relationship("Return", back_populates="transaction")


class TransactionItem(Base):
    __tablename__ = "transaction_items"

    item_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    txn_id = Column(UUID(as_uuid=True), ForeignKey("transactions.txn_id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id"))
    qty = Column(Integer)
    unit_price = Column(Numeric(10, 2))
    discount = Column(Numeric(5, 2), default=0)

    transaction = relationship("Transaction", back_populates="items")
    product = relationship("Product", back_populates="transaction_items")


class Return(Base):
    __tablename__ = "returns"

    return_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    txn_id = Column(UUID(as_uuid=True), ForeignKey("transactions.txn_id"))
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.store_id"))
    reason = Column(String)
    status = Column(String(20), default="pending")
    refund_amount = Column(Numeric(10, 2))
    processed_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="returns")
    store = relationship("Store", back_populates="returns")


class AuditLog(Base):
    __tablename__ = "audit_log"

    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    action = Column(String(100))
    entity_type = Column(String(50))
    entity_id = Column(UUID(as_uuid=True))
    details = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
