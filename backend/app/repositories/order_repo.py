from sqlalchemy.orm import Session
from ..db.models import Order, Part, Review
from typing import List, Optional

class OrderRepository:
    @staticmethod
    def get_orders_by_buyer_id(db: Session, buyer_id: int) -> List[Order]:
        return db.query(Order).filter(Order.buyer_id == buyer_id).order_by(Order.created_at.desc()).all()

    @staticmethod
    def get_order_by_id_and_buyer(db: Session, order_id: int, buyer_id: int) -> Optional[Order]:
        return db.query(Order).filter(Order.id == order_id, Order.buyer_id == buyer_id).first()

    @staticmethod
    def get_reviewed_part_ids_by_buyer(db: Session, buyer_id: int) -> set:
        reviews = db.query(Review.part_id).filter(Review.buyer_id == buyer_id).all()
        return {r.part_id for r in reviews}

    @staticmethod
    def create_order(db: Session, order: Order) -> Order:
        db.add(order)
        return order

    @staticmethod
    def db_commit(db: Session):
        db.commit()

    @staticmethod
    def db_refresh(db: Session, model):
        db.refresh(model)
