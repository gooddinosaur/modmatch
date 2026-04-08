from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Part, PartStatusEnum, Order, OrderStatusEnum, User
from ..domain.auth_permission import require_admin  # NEW
from pydantic import BaseModel

router = APIRouter()

class PartStatusUpdate(BaseModel):
    status: PartStatusEnum

@router.get("/parts/pending")
def read_pending_parts(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Part).filter(Part.status == PartStatusEnum.PENDING).all()

@router.put("/parts/{part_id}/status")
def update_part_status(part_id: int, status_update: PartStatusUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    part.status = status_update.status
    db.commit()
    db.refresh(part)
    return {"message": "Part status updated", "part": part}

@router.get("/orders/reported")
def read_reported_orders(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.status == OrderStatusEnum.REPORTED).all()

@router.put("/orders/{order_id}/resolve")
def resolve_order(order_id: int, resolve_action: str, _: User = Depends(require_admin), db: Session = Depends(get_db)):
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
    return {"message": "Dispute resolved", "order": order}