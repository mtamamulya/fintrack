from sqlalchemy import Column, String, Numeric, Boolean, SmallInteger, Date, Text, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid as _uuid


class User(Base):
    __tablename__ = "users"
    id            = Column(UUID(as_uuid=True), primary_key=True, default=_uuid.uuid4)
    email         = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    full_name     = Column(String(100))
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    wallets       = relationship("Wallet", back_populates="user", cascade="all, delete-orphan")
    transactions  = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    id        = Column(UUID(as_uuid=True), primary_key=True, default=_uuid.uuid4)
    user_id   = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name      = Column(String(100), nullable=False)
    icon      = Column(String(50))
    color     = Column(String(7))
    type      = Column(String(10), nullable=False)
    is_system = Column(Boolean, default=False)


class Wallet(Base):
    __tablename__ = "wallets"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=_uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name        = Column(String(100), nullable=False)
    wallet_type = Column(String(50), nullable=False)
    balance     = Column(Numeric(15, 2), nullable=False, default=0)
    currency    = Column(String(3), nullable=False, default="IDR")
    color       = Column(String(7))
    icon        = Column(String(50))
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    user         = relationship("User", back_populates="wallets")
    transactions = relationship("Transaction", foreign_keys="Transaction.wallet_id", back_populates="wallet")


class Transaction(Base):
    __tablename__ = "transactions"
    id               = Column(UUID(as_uuid=True), primary_key=True, default=_uuid.uuid4)
    user_id          = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wallet_id        = Column(UUID(as_uuid=True), ForeignKey("wallets.id"), nullable=False)
    category_id      = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    type             = Column(String(10), nullable=False)
    amount           = Column(Numeric(15, 2), nullable=False)
    description_enc  = Column(Text)
    transaction_date = Column(Date, nullable=False)
    to_wallet_id     = Column(UUID(as_uuid=True), ForeignKey("wallets.id"), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    user     = relationship("User", back_populates="transactions")
    wallet   = relationship("Wallet", foreign_keys=[wallet_id], back_populates="transactions")
    category = relationship("Category")


class Budget(Base):
    __tablename__ = "budgets"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=_uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id  = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    amount_limit = Column(Numeric(15, 2), nullable=False)
    period_month = Column(SmallInteger, nullable=False)
    period_year  = Column(SmallInteger, nullable=False)
    warning_pct  = Column(SmallInteger, nullable=False, default=20)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    category     = relationship("Category")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=_uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(Text, nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
