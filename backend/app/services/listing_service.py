from sqlalchemy.orm import Session
from ..db.models import Part, PartStatusEnum
from ..repositories.part_repo import PartRepository

class ListingService:
    @staticmethod
    def create_listing(part_data, seller_id: int, image_url_str: str, db: Session):
        new_part = Part(
            seller_id=seller_id,
            name=part_data.name,
            description=part_data.description,
            price=part_data.price,
            quantity=part_data.quantity,
            brand=part_data.brand,
            category=part_data.category,
            image_url=image_url_str,
            status=PartStatusEnum.PENDING
        )
        return PartRepository.create_part(db, new_part)

    @staticmethod
    def get_my_listings(seller_id: int, db: Session):
        parts = PartRepository.get_parts_by_seller(db, seller_id)
        return [p.to_dict() for p in parts]
