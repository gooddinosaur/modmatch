from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..repositories.admin_repo import AdminRepository
from ..db.models import PartStatusEnum, OrderStatusEnum

class AdminService:
    @staticmethod
    def get_stats(db: Session):
        return {
            "pending_listings": AdminRepository.get_pending_parts_count(db),
            "active_listings": AdminRepository.get_active_parts_count(db),
            "disputed_orders": AdminRepository.get_disputed_orders_count(db),
            "active_orders": AdminRepository.get_active_orders_count(db)
        }

    @staticmethod
    def get_active_parts(db: Session):
        parts = AdminRepository.get_parts_by_status(db, PartStatusEnum.APPROVED)
        return [p.to_dict() for p in parts]

    @staticmethod
    def delete_part(db: Session, part_id: int):
        part = AdminRepository.get_part_by_id(db, part_id)
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")
        AdminRepository.delete_part(db, part)
        return {"message": "Part deleted"}

    @staticmethod
    def get_parts_log(db: Session):
        parts = AdminRepository.get_parts_log(db)
        orders = AdminRepository.get_orders_log(db)
        
        log = []
        for p in parts:
            log.append({
                "type": "part",
                "id": p.id,
                "name": p.name,
                "status": p.status,
                "created_at": p.created_at
            })
        for o in orders:
            part_name = o.part.name if o.part else f"Part #{o.part_id}"
            log.append({
                "type": "order",
                "id": o.id,
                "name": part_name,
                "status": o.status,
                "created_at": o.created_at
            })
        
        log.sort(key=lambda x: x["created_at"], reverse=True)
        return log

    @staticmethod
    def get_pending_parts(db: Session):
        parts = AdminRepository.get_pending_parts(db)
        return [p.to_dict() for p in parts]

    @staticmethod
    def update_part_status(db: Session, part_id: int, status: PartStatusEnum):
        part = AdminRepository.get_part_by_id(db, part_id)
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")
        updated_part = AdminRepository.update_part_status(db, part, status)
        return {"message": "Part status updated", "part": updated_part}

    @staticmethod
    def get_reported_orders(db: Session):
        orders = AdminRepository.get_reported_orders(db)
        result = []
        for o in orders:
            buyer_name = o.buyer.display_name or o.buyer.email if o.buyer else f"User #{o.buyer_id}"
            part_name = o.part.name if o.part else f"Part #{o.part_id}"
            result.append({
                "id": o.id,
                "status": o.status,
                "amount_paid": o.amount_paid,
                "quantity": o.quantity,
                "created_at": o.created_at,
                "buyer_id": o.buyer_id,
                "buyer_name": buyer_name,
                "part_id": o.part_id,
                "part_name": part_name,
                "dispute_reason": o.dispute_reason,
                "dispute_message": o.dispute_message
            })
        return result

    @staticmethod
    def resolve_order(db: Session, order_id: int, resolve_action: str):
        order = AdminRepository.get_order_by_id(db, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if resolve_action == "refund":
            new_status = OrderStatusEnum.REFUNDED
        elif resolve_action == "release":
            new_status = OrderStatusEnum.FUNDS_RELEASED
        else:
            raise HTTPException(status_code=400, detail="Invalid action")
            
        updated_order = AdminRepository.update_order_status(db, order, new_status)
        return {"message": "Dispute resolved", "order": updated_order}