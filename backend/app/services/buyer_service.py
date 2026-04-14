from sqlalchemy.orm import Session
from ..db.models import User, UserAddress, UserVehicle, Review, Part, PartStatusEnum, Order, OrderStatusEnum
from ..domain.fitment_engine import check_basic_fitment
from ..repositories.user_repo import UserRepository
from ..repositories.part_repo import PartRepository, ReviewRepository
from fastapi import HTTPException

class BuyerService:
    @staticmethod
    def update_profile(db: Session, user: User, profile_data: dict):
        user.display_name = profile_data.get("display_name", user.display_name)
        user.phone = profile_data.get("phone", user.phone)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_addresses(db: Session, user_id: int):
        return UserRepository.get_addresses_by_user(db, user_id)

    @staticmethod
    def add_address(db: Session, user_id: int, addr_data: dict):
        existing = UserRepository.count_addresses_by_user(db, user_id)
        new_addr = UserAddress(
            user_id=user_id,
            is_default=(existing == 0),
            **addr_data
        )
        return UserRepository.add_address(db, new_addr)

    @staticmethod
    def set_default_address(db: Session, user_id: int, addr_id: int):
        UserRepository.update_all_addresses_default_status(db, user_id, addr_id)

    @staticmethod
    def delete_address(db: Session, user_id: int, addr_id: int):
        addr = UserRepository.get_address_by_id_and_user(db, addr_id, user_id)
        if addr:
            UserRepository.delete_address(db, addr)

    @staticmethod
    def get_vehicles(db: Session, user_id: int):
        return UserRepository.get_vehicles_by_user(db, user_id)

    @staticmethod
    def add_vehicle(db: Session, user_id: int, vehicle_data: dict):
        new_vehicle = UserVehicle(
            user_id=user_id,
            **vehicle_data
        )
        return UserRepository.add_vehicle(db, new_vehicle)

    @staticmethod
    def delete_vehicle(db: Session, user_id: int, vehicle_id: int):
        vehicle = UserRepository.get_vehicle_by_id_and_user(db, vehicle_id, user_id)
        if vehicle:
            UserRepository.delete_vehicle(db, vehicle)

    @staticmethod
    def get_seller_profile(db: Session, seller_id: int):
        seller = UserRepository.get_user_by_id(db, seller_id)
        if not seller or seller.role.value != "seller":
            raise HTTPException(status_code=404, detail="Seller not found")
        
        parts = PartRepository.get_approved_parts_by_seller(db, seller_id)
        default_address = UserRepository.get_default_address_by_user(db, seller_id)
        
        address = None
        if default_address:
            address = {
                "address_line1": default_address.address_line1,
                "address_line2": default_address.address_line2,
                "city": default_address.city,
                "province": default_address.province,
                "postal_code": default_address.postal_code
            }
        
        return {
            "seller": {
                "id": seller.id,
                "display_name": seller.display_name or f"Seller #{seller.id}",
                "email": seller.email,
                "phone": seller.phone,
                "description": seller.description,
                "line_id": seller.line_id,
                "facebook": seller.facebook,
                "specialties": seller.specialties,
                "address": address
            },
            "parts": [p.to_dict() for p in parts]
        }

    @staticmethod
    def search_parts(db: Session, user, make: str = None, model: str = None, year: int = None):
        user_vehicles = []
        if user and user.role.value == "buyer":
            user_vehicles = UserRepository.get_vehicles_by_user(db, user.id)
            
        parts = PartRepository.get_all_approved_parts(db)
        
        results = []
        for p in parts:
            if p.quantity <= 0:
                continue
                
            p_dict = p.to_dict()
            reviews = db.query(Review).filter(Review.part_id == p.id).all()
            if reviews:
                p_dict["rating"] = round(sum([r.rating for r in reviews]) / len(reviews), 1)
                p_dict["reviews_count"] = len(reviews)
                p_dict["reviews_list"] = [
                    {
                        "rating": r.rating,
                        "comment": r.comment,
                        "created_at": r.created_at,
                        "buyer_name": r.buyer.display_name if r.buyer.display_name else "Anonymous Buyer"
                    } for r in reviews
                ]
            else:
                p_dict["rating"] = None
                p_dict["reviews_count"] = 0
                p_dict["reviews_list"] = []
            if user_vehicles:
                p_dict["fit_vehicles"] = check_basic_fitment(p.name, p.description, user_vehicles)
            else:
                p_dict["fit_vehicles"] = []
                
            results.append(p_dict)
            
        return results

    @staticmethod
    def buy_part(db: Session, user: User, order_data: dict):
        part = db.query(Part).filter(Part.id == order_data["part_id"]).first()
        if not part or part.status != PartStatusEnum.APPROVED or part.quantity < order_data["quantity"]:
            raise HTTPException(status_code=400, detail="Part not available for purchase in that quantity")
        
        new_order = Order(
            buyer_id=user.id,
            part_id=order_data["part_id"],
            quantity=order_data["quantity"],
            status=OrderStatusEnum.PAYMENT_HELD,
            amount_paid=order_data["amount"]
        )
        db.add(new_order)

        part.quantity -= order_data["quantity"]
        db.commit()
        db.refresh(new_order)

        return {
            "message": "Payment held in escrow, awaiting seller to ship",
            "order": {"id": new_order.id, "status": new_order.status.value}
        }
    @staticmethod
    def get_part_details(db: Session, part_id: int):
        part = PartRepository.get_approved_part_by_id(db, part_id)
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")
        
        p_dict = part.to_dict()
        user_vehicles = [] # Placeholder if needed
        reviews = db.query(Review).filter(Review.part_id == part.id).order_by(Review.created_at.desc()).all()
        p_dict["reviews"] = []
        for r in reviews:
            buyer_name = r.buyer.display_name or r.buyer.email if r.buyer else "Unknown Buyer"
            p_dict["reviews"].append({
                "id": r.id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at,
                "buyer_name": buyer_name
            })
        if reviews:
            p_dict["rating"] = round(sum([r.rating for r in reviews]) / len(reviews), 1)
            p_dict["reviews_count"] = len(reviews)
        else:
            p_dict["rating"] = None
            p_dict["reviews_count"] = 0
            
        return p_dict

    @staticmethod
    def add_review(db: Session, user: User, part_id: int, review_data: dict):
        order = db.query(Order).filter(
            Order.part_id == part_id,
            Order.buyer_id == user.id,
            Order.status.in_([OrderStatusEnum.CONFIRMED, OrderStatusEnum.FUNDS_RELEASED])
        ).first()

        if not order:
            raise HTTPException(status_code=400, detail="You can only review parts you have purchased and confirmed")

        existing = db.query(Review).filter(Review.part_id == part_id, Review.buyer_id == user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="You have already reviewed this part")

        rating = review_data.get("rating", 0)
        if rating < 1 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        new_review = Review(
            part_id=part_id,
            buyer_id=user.id,
            rating=rating,
            comment=review_data.get("comment")
        )
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        return {"message": "Review added successfully", "review_id": new_review.id}

