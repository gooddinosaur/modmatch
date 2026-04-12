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
    display_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    description = Column(String, nullable=True)
    line_id = Column(String, nullable=True)
    facebook = Column(String, nullable=True)
    specialties = Column(String, nullable=True)
    
    parts = relationship("Part", back_populates="seller")
    orders = relationship("Order", back_populates="buyer")
    addresses = relationship("UserAddress", back_populates="user")
    user_vehicles = relationship("UserVehicle", back_populates="user")
    
class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label = Column(String)
    is_default = Column(Boolean, default=False)
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String)
    address_line1 = Column(String)
    address_line2 = Column(String)
    city = Column(String)
    province = Column(String)
    postal_code = Column(String)

    user = relationship("User", back_populates="addresses")

class UserVehicle(Base):
    __tablename__ = "user_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(String, nullable=False)
    sub_model = Column(String)

    user = relationship("User", back_populates="user_vehicles")


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
    quantity = Column(Integer, default=1)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    status = Column(Enum(PartStatusEnum), default=PartStatusEnum.PENDING)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    seller = relationship("User", back_populates="parts")
    fitments = relationship("PartFitment", back_populates="part")
    orders = relationship("Order", back_populates="part")

    def to_dict(self):
        d = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        if self.seller:
            d["seller_name"] = self.seller.display_name or f"Seller #{self.seller_id}"
            d["seller_email"] = self.seller.email
            d["seller"] = d["seller_name"] # For convenience
        return d


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
