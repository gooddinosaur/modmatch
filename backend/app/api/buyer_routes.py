from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Part, Order, PartStatusEnum, OrderStatusEnum, User
from ..domain.auth_permission import require_buyer  # NEW
from pydantic import BaseModel

router = APIRouter()

class OrderCreate(BaseModel):
    part_id: int
    amount: float

@router.get("/search")
def search_parts(make: str = None, model: str = None, year: int = None, db: Session = Depends(get_db)):
    query = db.query(Part).filter(Part.status == PartStatusEnum.APPROVED)
    return query.all()

@router.post("/buy")
def buy_part(order_data: OrderCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == order_data.part_id).first()
    if not part or part.status != PartStatusEnum.APPROVED:
        raise HTTPException(status_code=400, detail="Part not available for purchase")
    new_order = Order(
        buyer_id=current_user.id,  # real user
        part_id=order_data.part_id,
        status=OrderStatusEnum.PAYMENT_HELD,
        amount_paid=order_data.amount
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return {"message": "Payment held in escrow, awaiting seller to ship", "order": new_order}

@router.put("/orders/{order_id}/confirm")
def confirm_order(order_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.buyer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = OrderStatusEnum.CONFIRMED
    db.commit()
    db.refresh(order)
    return {"message": "Order confirmed! Funds available for seller.", "order": order}

@router.put("/orders/{order_id}/report")
def report_order(order_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.buyer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = OrderStatusEnum.REPORTED
    db.commit()
    return {"message": "Order reported. Admin will mediate.", "order": order}