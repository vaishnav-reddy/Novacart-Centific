from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id"))
    store_id = Column(UUID(as_uuid=True), ForeignKey("stores.store_id"))
    quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)
    last_updated = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("product_id", "store_id"),)

    product = relationship("Product", back_populates="inventory")
    store = relationship("Store", back_populates="inventory")
