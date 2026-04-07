from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
import enum
import datetime
from .session import Base

class RoleEnum(str, enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"

class PartStatusEnum(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class OrderStatusEnum(str, enum.Enum):
    PAYMENT_HELD = "payment_held"
    SHIPPED = "shipped"
    CONFIRMED = "confirmed"
    FUNDS_RELEASED = "funds_released"
    REFUNDED = "refunded"
    REPORTED = "reported"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.BUYER)
    
    parts = relationship("Part", back_populates="seller")
    orders = relationship("Order", back_populates="buyer")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    make = Column(String, nullable=False)  # e.g., Honda
    model = Column(String, nullable=False) # e.g., Civic Type R
    year = Column(Integer, nullable=False) # e.g., 2018

    parts = relationship("PartFitment", back_populates="vehicle")


class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    status = Column(Enum(PartStatusEnum), default=PartStatusEnum.PENDING)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    seller = relationship("User", back_populates="parts")
    fitments = relationship("PartFitment", back_populates="part")
    orders = relationship("Order", back_populates="part")


class PartFitment(Base):
    """
    Many-to-many relationship mapping parts to the specific vehicles they fit.
    """
    __tablename__ = "part_fitments"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    verified_by_admin = Column(Boolean, default=False)

    part = relationship("Part", back_populates="fitments")
    vehicle = relationship("Vehicle", back_populates="parts")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    part_id = Column(Integer, ForeignKey("parts.id"))
    status = Column(Enum(OrderStatusEnum), default=OrderStatusEnum.PAYMENT_HELD)
    amount_paid = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    buyer = relationship("User", back_populates="orders")
    part = relationship("Part", back_populates="orders")
