from sqlalchemy.orm import Session
from ..db.models import Part, PartStatusEnum, Order, OrderStatusEnum

class AdminRepository:
    @staticmethod
    def get_pending_parts_count(db: Session) -> int:
        return db.query(Part).filter(Part.status == PartStatusEnum.PENDING).count()

    @staticmethod
    def get_active_parts_count(db: Session) -> int:
        return db.query(Part).filter(Part.status == PartStatusEnum.APPROVED).count()

    @staticmethod
    def get_disputed_orders_count(db: Session) -> int:
        return db.query(Order).filter(Order.status == OrderStatusEnum.REPORTED).count()

    @staticmethod
    def get_active_orders_count(db: Session) -> int:
        return db.query(Order).filter(
            Order.status.in_([OrderStatusEnum.PAYMENT_HELD, OrderStatusEnum.SHIPPED])
        ).count()

    @staticmethod
    def get_parts_by_status(db: Session, status: PartStatusEnum):
        return db.query(Part).filter(Part.status == status).order_by(Part.created_at.desc()).all()

    @staticmethod
    def get_pending_parts(db: Session):
        return db.query(Part).filter(Part.status == PartStatusEnum.PENDING).all()

    @staticmethod
    def get_part_by_id(db: Session, part_id: int) -> Part:
        return db.query(Part).filter(Part.id == part_id).first()

    @staticmethod
    def delete_part(db: Session, part: Part):
        db.delete(part)
        db.commit()

    @staticmethod
    def update_part_status(db: Session, part: Part, status: PartStatusEnum):
        part.status = status
        db.commit()
        db.refresh(part)
        return part

    @staticmethod
    def get_parts_log(db: Session, limit: int = 50):
        return db.query(Part).filter(
            Part.status.in_([PartStatusEnum.APPROVED, PartStatusEnum.REJECTED])
        ).order_by(Part.id.desc()).limit(limit).all()

    @staticmethod
    def get_orders_log(db: Session, limit: int = 50):
        return db.query(Order).filter(
            Order.status.in_([OrderStatusEnum.REFUNDED, OrderStatusEnum.FUNDS_RELEASED])
        ).order_by(Order.id.desc()).limit(limit).all()

    @staticmethod
    def get_reported_orders(db: Session):
        return db.query(Order).filter(Order.status == OrderStatusEnum.REPORTED).all()

    @staticmethod
    def get_order_by_id(db: Session, order_id: int) -> Order:
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def update_order_status(db: Session, order: Order, status: OrderStatusEnum):
        order.status = status
        db.commit()
        db.refresh(order)
        return order
