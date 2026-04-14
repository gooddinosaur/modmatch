from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import PartStatusEnum, User
from ..domain.auth_permission import require_admin
from pydantic import BaseModel
from ..services.admin_service import AdminService

router = APIRouter()

class PartStatusUpdate(BaseModel):
    status: PartStatusEnum

@router.get("/stats")
def read_admin_stats(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return AdminService.get_stats(db)

@router.get("/parts/active")
def read_active_parts(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return AdminService.get_active_parts(db)

@router.delete("/parts/{part_id}")
def delete_part(part_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    return AdminService.delete_part(db, part_id)

@router.get("/parts/log")
def read_parts_log(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return AdminService.get_parts_log(db)

@router.get("/parts/pending")
def read_pending_parts(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return AdminService.get_pending_parts(db)

@router.put("/parts/{part_id}/status")
def update_part_status(part_id: int, status_update: PartStatusUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    return AdminService.update_part_status(db, part_id, status_update.status)

@router.get("/orders/reported")
def read_reported_orders(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return AdminService.get_reported_orders(db)

@router.put("/orders/{order_id}/resolve")
def resolve_order(order_id: int, resolve_action: str, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    return AdminService.resolve_order(db, order_id, resolve_action)
