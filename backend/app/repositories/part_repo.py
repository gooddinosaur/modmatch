from sqlalchemy.orm import Session
from ..db.models import Part, PartStatusEnum, Review

class PartRepository:
    @staticmethod
    def get_parts_by_seller(db: Session, seller_id: int):
        return db.query(Part).filter(Part.seller_id == seller_id).all()

    @staticmethod
    def get_approved_parts_by_seller(db: Session, seller_id: int):
        return db.query(Part).filter(
            Part.seller_id == seller_id, 
            Part.status == PartStatusEnum.APPROVED, 
            Part.quantity > 0
        ).all()

    @staticmethod
    def get_approved_part_by_id(db: Session, part_id: int):
        return db.query(Part).filter(
            Part.id == part_id, 
            Part.status == PartStatusEnum.APPROVED, 
            Part.quantity > 0
        ).first()

    @staticmethod
    def get_all_approved_parts(db: Session):
        return db.query(Part).filter(
            Part.status == PartStatusEnum.APPROVED, 
            Part.quantity > 0
        ).all()

    @staticmethod
    def create_part(db: Session, part: Part):
        db.add(part)
        db.commit()
        db.refresh(part)
        return part

class ReviewRepository:
    @staticmethod
    def get_reviews_by_part(db: Session, part_id: int):
        return db.query(Review).filter(Review.part_id == part_id).all()
