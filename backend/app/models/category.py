from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from enum import Enum as PyEnum

class TransactionTypeEnum(PyEnum):
    INCOME = "income"
    EXPENSE = "expense" 
    TRANSFER = "transfer"

class Category(Base):
    __tablename__ = "categories"
    
    # Campos primários
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # NULL para categorias sistema
    
    # Dados da categoria
    name = Column(String(100), nullable=False)
    type = Column(Enum(TransactionTypeEnum), nullable=False)
    icon = Column(String(50), nullable=True)
    color = Column(String(7), nullable=True)
    
    # Hierarquia (subcategorias)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=True)
    
    # Metadados
    is_system = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="categories")
    parent = relationship("Category", back_populates="subcategories", remote_side=[id])
    subcategories = relationship("Category", back_populates="parent", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="category", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="category")
    
    def __repr__(self):
        return f"<Category(name='{self.name}', type='{self.type}')>"
