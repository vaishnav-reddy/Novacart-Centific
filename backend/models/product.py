from sqlalchemy import Column, String, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Product(Base):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    category = Column(String(100))
    brand = Column(String(100))
    price = Column(Numeric(10, 2), nullable=False)
    barcode = Column(String(50), unique=True)
    tax_rate = Column(Numeric(5, 2), default=18.0)
    is_active = Column(Boolean, default=True)

    inventory = relationship("Inventory", back_populates="product")
    transaction_items = relationship("TransactionItem", back_populates="product")
