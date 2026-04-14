from sqlalchemy.orm import Session
from ..db.models import User, UserAddress, Order, OrderStatusEnum
from ..repositories.user_repo import UserRepository
from fastapi import HTTPException

class SellerService:
    @staticmethod
    def update_profile(db: Session, current_user: User, profile_data: dict):
        if "display_name" in profile_data and profile_data["display_name"] is not None:
            current_user.display_name = profile_data["display_name"]
        if "phone" in profile_data and profile_data["phone"] is not None:
            current_user.phone = profile_data["phone"]
        if "description" in profile_data and profile_data["description"] is not None:
            current_user.description = profile_data["description"]
        if "line_id" in profile_data and profile_data["line_id"] is not None:
            current_user.line_id = profile_data["line_id"]
        if "facebook" in profile_data and profile_data["facebook"] is not None:
            current_user.facebook = profile_data["facebook"]
        if "specialties" in profile_data and profile_data["specialties"] is not None:
            current_user.specialties = profile_data["specialties"]
            
        address_data = profile_data.get("address")
        if address_data:
            address = UserRepository.get_default_address_by_user(db, current_user.id)
            if not address:
                address = UserRepository.get_first_address_by_user(db, current_user.id)
                
            if not address:
                address = UserAddress(user_id=current_user.id, is_default=True)
                db.add(address)
                
            for k, v in address_data.items():
                if v is not None and hasattr(address, k):
                    setattr(address, k, v)

        db.commit()
        db.refresh(current_user)
        return current_user

    @staticmethod
    def get_profile(db: Session, current_user: User):
        address = UserRepository.get_default_address_by_user(db, current_user.id)
        if not address:
            address = UserRepository.get_first_address_by_user(db, current_user.id)
            
        address_dict = None
        if address:
            address_dict = {
                "label": address.label,
                "first_name": address.first_name,
                "last_name": address.last_name,
                "phone": address.phone,
                "address_line1": address.address_line1,
                "address_line2": address.address_line2,
                "city": address.city,
                "province": address.province,
                "postal_code": address.postal_code,
            }
            
        return {
            "email": current_user.email,
            "display_name": current_user.display_name,
            "phone": current_user.phone,
            "description": current_user.description,
            "line_id": current_user.line_id,
            "facebook": current_user.facebook,
            "specialties": current_user.specialties,
            "address": address_dict
        }

    @staticmethod
    def mark_order_shipped(order_id: int, user_id: int, tracking_number: str, db: Session):
        order = db.query(Order).filter(Order.id == order_id, Order.seller_id == user_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.status != OrderStatusEnum.PAID:
            raise HTTPException(status_code=400, detail="Order is not in valid status")
            
        order.status = OrderStatusEnum.SHIPPED
        order.tracking_number = tracking_number
        db.commit()
        db.refresh(order)
        return {"message": "Order marked as shipped", "order": order}

    @staticmethod
    def withdraw_funds(order_id: int, user_id: int, db: Session):
        order = db.query(Order).filter(Order.id == order_id, Order.seller_id == user_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.status != OrderStatusEnum.DELIVERED:
            raise HTTPException(status_code=400, detail="Order is not in valid status")
        order.status = OrderStatusEnum.COMPLETED
        db.commit()
        db.refresh(order)
        return {"message": "Funds withdrawn", "order": order}
