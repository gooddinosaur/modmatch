from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from ..db.models import Part, PartStatusEnum, Order, OrderStatusEnum

router = APIRouter()

# Schema for updating part status
from pydantic import BaseModel
class PartStatusUpdate(BaseModel):
    status: PartStatusEnum

@router.get("/parts/pending")
def read_pending_parts(db: Session = Depends(get_db)):
    parts = db.query(Part).filter(Part.status == PartStatusEnum.PENDING).all()
    return parts

@router.put("/parts/{part_id}/status")
def update_part_status(part_id: int, status_update: PartStatusUpdate, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    part.status = status_update.status
    db.commit()
    db.refresh(part)
    return {"message": "Part status updated successfully", "part": part}

@router.get("/orders/reported")
def read_reported_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.status == OrderStatusEnum.REPORTED).all()
    return orders

@router.put("/orders/{order_id}/resolve")
def resolve_order(order_id: int, resolve_action: str, db: Session = Depends(get_db)):
    # resolve_action can be "refund" or "release_funds" depending on evidence
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if resolve_action == "refund":
        order.status = OrderStatusEnum.REFUNDED
    elif resolve_action == "release":
        order.status = OrderStatusEnum.FUNDS_RELEASED
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    db.commit()
    db.refresh(order)
    return {"message": "Order dispute resolved", "order": order}
