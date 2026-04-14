from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import User
from ..domain.auth_permission import require_buyer, get_current_user_optional
from pydantic import BaseModel
from typing import Optional

from ..services.buyer_service import BuyerService
from ..services.order_service import OrderService

router = APIRouter()

class OrderCreate(BaseModel):
    part_id: int
    amount: float
    quantity: int = 1

class UserProfileUpdate(BaseModel):
    display_name: str
    phone: str

class AddressCreate(BaseModel):
    label: str
    first_name: str
    last_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    province: str
    postal_code: str

class VehicleCreate(BaseModel):
    make: str
    model: str
    year: str
    sub_model: Optional[str] = None

@router.get("/profile")
def get_profile(current_user: User = Depends(require_buyer)):
    return {
        "email": current_user.email,
        "display_name": current_user.display_name,
        "phone": current_user.phone
    }

@router.put("/profile")
def update_profile(profile_data: UserProfileUpdate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    user = BuyerService.update_profile(db, current_user, profile_data.model_dump() if hasattr(profile_data, 'model_dump') else profile_data.dict())
    return {"message": "Profile updated", "profile": {"display_name": user.display_name, "phone": user.phone}}

@router.get("/addresses")
def get_addresses(current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return BuyerService.get_addresses(db, current_user.id)

@router.post("/addresses")
def add_address(addr_data: AddressCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return BuyerService.add_address(db, current_user.id, addr_data.model_dump() if hasattr(addr_data, 'model_dump') else addr_data.dict())

@router.put("/addresses/{addr_id}/default")
def set_default_address(addr_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    BuyerService.set_default_address(db, current_user.id, addr_id)
    return {"message": "Default address updated"}

@router.delete("/addresses/{addr_id}")
def delete_address(addr_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    BuyerService.delete_address(db, current_user.id, addr_id)
    return {"message": "Address deleted"}

@router.get("/vehicles")
def get_vehicles(current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return BuyerService.get_vehicles(db, current_user.id)

@router.post("/vehicles")
def add_vehicle(vehicle_data: VehicleCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return BuyerService.add_vehicle(db, current_user.id, vehicle_data.model_dump() if hasattr(vehicle_data, 'model_dump') else vehicle_data.dict())

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    BuyerService.delete_vehicle(db, current_user.id, vehicle_id)
    return {"message": "Vehicle deleted"}

@router.get("/orders")
def get_buyer_orders(current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return OrderService.get_buyer_orders(current_user.id, db)

@router.get("/sellers/{seller_id}")
def get_seller_profile(seller_id: int, db: Session = Depends(get_db)):
    return BuyerService.get_seller_profile(db, seller_id)

@router.get("/search")
def search_parts(make: str = None, model: str = None, year: int = None, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    user = get_current_user_optional(authorization, db=db)
    return BuyerService.search_parts(db, user, make, model, year)

@router.get("/parts/{part_id}")
def get_part_details(part_id: int, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    return BuyerService.get_part_details(db, part_id)

@router.post("/buy")
def buy_part(order_data: OrderCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return BuyerService.buy_part(db, current_user, order_data.model_dump() if hasattr(order_data, 'model_dump') else order_data.dict())

class ReviewCreate(BaseModel):
    rating: int
    comment: str | None = None

@router.post("/parts/{part_id}/reviews")
def add_review(part_id: int, review_data: ReviewCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return BuyerService.add_review(db, current_user, part_id, review_data.model_dump() if hasattr(review_data, 'model_dump') else review_data.dict())

@router.put("/orders/{order_id}/confirm")
def confirm_order(order_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return OrderService.confirm_order(order_id, current_user.id, db)

class ReportOrderData(BaseModel):
    reason: str
    message: str

@router.put("/orders/{order_id}/report")
def report_order(order_id: int, report_data: ReportOrderData, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return OrderService.report_order(order_id, report_data, current_user.id, db)
