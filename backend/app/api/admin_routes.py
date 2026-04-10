from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Part, PartStatusEnum, Order, OrderStatusEnum, User
from ..domain.auth_permission import require_admin  # NEW
from pydantic import BaseModel

router = APIRouter()

class PartStatusUpdate(BaseModel):
    status: PartStatusEnum

@router.get("/stats")
def read_admin_stats(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    pending_count = db.query(Part).filter(Part.status == PartStatusEnum.PENDING).count()
    active_listings_count = db.query(Part).filter(Part.status == PartStatusEnum.APPROVED).count()
    disputed_count = db.query(Order).filter(Order.status == OrderStatusEnum.REPORTED).count()
    active_orders_count = db.query(Order).filter(Order.status.in_([OrderStatusEnum.PAYMENT_HELD, OrderStatusEnum.SHIPPED])).count()
    
    return {
        "pending_listings": pending_count,
        "active_listings": active_listings_count,
        "disputed_orders": disputed_count,
        "active_orders": active_orders_count
    }

@router.get("/parts/active")
def read_active_parts(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    parts = db.query(Part).filter(Part.status == PartStatusEnum.APPROVED).order_by(Part.created_at.desc()).all()
    return [p.to_dict() for p in parts]

@router.delete("/parts/{part_id}")
def delete_part(part_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    db.delete(part)
    db.commit()
    return {"message": "Part deleted"}

@router.get("/parts/log")
def read_parts_log(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    parts = db.query(Part).filter(Part.status.in_([PartStatusEnum.APPROVED, PartStatusEnum.REJECTED])).order_by(Part.id.desc()).all()
    return [p.to_dict() for p in parts]

@router.get("/parts/pending")
def read_pending_parts(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    parts = db.query(Part).filter(Part.status == PartStatusEnum.PENDING).all()
    return [p.to_dict() for p in parts]

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