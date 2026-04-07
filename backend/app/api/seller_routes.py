from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Part, PartStatusEnum, Order, OrderStatusEnum
from pydantic import BaseModel

router = APIRouter()

class PartCreate(BaseModel):
    name: str
    description: str
    price: float

@router.post("/listings")
def create_listing(part_data: PartCreate, db: Session = Depends(get_db)):
    # Seller lists a part. It requires admin approval.
    new_part = Part(
        seller_id=2, # Mock ID, use auth token in prod
        name=part_data.name,
        description=part_data.description,
        price=part_data.price,
        status=PartStatusEnum.PENDING
    )
    db.add(new_part)
    db.commit()
    db.refresh(new_part)
    return {"message": "Listing created and pending admin approval", "part": new_part}

@router.get("/listings")
def get_my_listings(db: Session = Depends(get_db)):
    # get listings for the logged-in seller
    parts = db.query(Part).filter(Part.seller_id == 2).all()
    return parts

@router.get("/orders")
def get_my_orders(db: Session = Depends(get_db)):
    # Orders containing parts from this seller
    orders = db.query(Order).join(Part).filter(Part.seller_id == 2).all()
    return orders

@router.put("/orders/{order_id}/mark_shipped")
def mark_order_shipped(order_id: int, tracking_number: str, db: Session = Depends(get_db)):
    order = db.query(Order).join(Part).filter(Order.id == order_id).filter(Part.seller_id == 2).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not owned by seller")
    
    order.status = OrderStatusEnum.SHIPPED
    db.commit()
    db.refresh(order)
    return {"message": "Order marked as shipped", "tracking": tracking_number, "order": order}

@router.post("/orders/{order_id}/withdraw")
def withdraw_funds(order_id: int, db: Session = Depends(get_db)):
    # Simulates seller withdrawal of released funds
    order = db.query(Order).filter(Order.id == order_id, Part.seller_id == 2).join(Part).first()
    if not order or order.status not in [OrderStatusEnum.CONFIRMED, OrderStatusEnum.FUNDS_RELEASED]:
        raise HTTPException(status_code=400, detail="Funds not available for withdrawal yet")
    
    # Process payout...
    return {"message": "Funds successfully withdrawn to your bank account", "amount": order.amount_paid}
