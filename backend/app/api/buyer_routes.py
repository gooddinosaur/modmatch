from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Part, Order, PartStatusEnum, OrderStatusEnum, User, UserAddress, UserVehicle
from ..domain.auth_permission import require_buyer  # NEW
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class OrderCreate(BaseModel):
    part_id: int
    amount: float

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
    current_user.display_name = profile_data.display_name
    current_user.phone = profile_data.phone
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "profile": {"display_name": current_user.display_name, "phone": current_user.phone}}

@router.get("/addresses")
def get_addresses(current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return db.query(UserAddress).filter(UserAddress.user_id == current_user.id).all()

@router.post("/addresses")
def add_address(addr_data: AddressCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    existing = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).count()
    new_addr = UserAddress(
        user_id=current_user.id,
        is_default=(existing == 0),
        **addr_data.dict()
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return new_addr

@router.put("/addresses/{addr_id}/default")
def set_default_address(addr_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    addresses = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).all()
    for addr in addresses:
        addr.is_default = (addr.id == addr_id)
    db.commit()
    return {"message": "Default address updated"}

@router.delete("/addresses/{addr_id}")
def delete_address(addr_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    addr = db.query(UserAddress).filter(UserAddress.id == addr_id, UserAddress.user_id == current_user.id).first()
    if addr:
        db.delete(addr)
        db.commit()
    return {"message": "Address deleted"}

@router.get("/vehicles")
def get_vehicles(current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    return db.query(UserVehicle).filter(UserVehicle.user_id == current_user.id).all()

@router.get("/orders")
def get_buyer_orders(current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()
    # Serialize to include part details directly
    result = []
    for o in orders:
        seller_name = "Unknown Seller"
        if o.part and o.part.seller:
            seller_name = o.part.seller.display_name or o.part.seller.email
        
        result.append({
            "id": o.id,
            "status": o.status,
            "amount_paid": o.amount_paid,
            "created_at": o.created_at,
            "part": o.part,
            "seller_name": seller_name
        })
    return result

@router.post("/vehicles")
def add_vehicle(vehicle_data: VehicleCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    new_vehicle = UserVehicle(
        user_id=current_user.id,
        **vehicle_data.dict()
    )
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle

@router.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    vehicle = db.query(UserVehicle).filter(UserVehicle.id == vehicle_id, UserVehicle.user_id == current_user.id).first()
    if vehicle:
        db.delete(vehicle)
        db.commit()
    return {"message": "Vehicle deleted"}

@router.get("/search")
def search_parts(make: str = None, model: str = None, year: int = None, db: Session = Depends(get_db)):
    query = db.query(Part).filter(Part.status == PartStatusEnum.APPROVED)
    return [p.to_dict() for p in query.all()]

@router.get("/parts/{part_id}")
def get_part_details(part_id: int, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == part_id, Part.status == PartStatusEnum.APPROVED).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part.to_dict()

@router.post("/buy")
def buy_part(order_data: OrderCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == order_data.part_id).first()
    if not part or part.status != PartStatusEnum.APPROVED:
        raise HTTPException(status_code=400, detail="Part not available for purchase")
    new_order = Order(
        buyer_id=current_user.id,  # real user
        part_id=order_data.part_id,
        status=OrderStatusEnum.PAYMENT_HELD,
        amount_paid=order_data.amount
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Mark part as sold to prevent double-buying (if desired, or we just rely on order tracking)
    part.status = PartStatusEnum.PENDING # Actually, changing to PENDING or adding a SOLD status. We'll leave it simple.
    db.commit()
    
    return {
        "message": "Payment held in escrow, awaiting seller to ship", 
        "order": {"id": new_order.id, "status": new_order.status}
    }

@router.put("/orders/{order_id}/confirm")
def confirm_order(order_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.buyer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = OrderStatusEnum.CONFIRMED
    db.commit()
    db.refresh(order)
    return {
        "message": "Order confirmed! Funds available for seller.", 
        "order": {"id": order.id, "status": order.status}
    }

@router.put("/orders/{order_id}/report")
def report_order(order_id: int, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.buyer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = OrderStatusEnum.REPORTED
    db.commit()
    return {
        "message": "Order reported. Admin will mediate.", 
        "order": {"id": order.id, "status": order.status}
    }