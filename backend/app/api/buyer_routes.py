from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Part, Order, PartStatusEnum, OrderStatusEnum
from pydantic import BaseModel

router = APIRouter()

class OrderCreate(BaseModel):
    part_id: int
    amount: float
    # In reality, buyer_id comes from auth token

@router.get("/search")
def search_parts(make: str = None, model: str = None, year: int = None, db: Session = Depends(get_db)):
    query = db.query(Part).filter(Part.status == PartStatusEnum.APPROVED)
    
    # Normally, join with PartFitment and Vehicle here to filter by make/model/year
    # For now returning all approved parts
    return query.all()

@router.post("/buy")
def buy_part(order_data: OrderCreate, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == order_data.part_id).first()
    if not part or part.status != PartStatusEnum.APPROVED:
        raise HTTPException(status_code=400, detail="Part not available for purchase")

    # Escrow: holds payment
    new_order = Order(
        buyer_id=1, # Mock ID, should come from auth
        part_id=order_data.part_id,
        status=OrderStatusEnum.PAYMENT_HELD,
        amount_paid=order_data.amount
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return {"message": "Payment held in safe setup, awaiting seller to ship", "order": new_order}

@router.put("/orders/{order_id}/confirm")
def confirm_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = OrderStatusEnum.CONFIRMED
    db.commit()
    db.refresh(order)
    return {"message": "Order confirmed! Funds available for seller.", "order": order}

@router.put("/orders/{order_id}/report")
def report_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = OrderStatusEnum.REPORTED
    db.commit()
    return {"message": "Order reported. Admin will mediate.", "order": order}
