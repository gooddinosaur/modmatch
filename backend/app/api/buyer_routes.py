from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..db.session import get_db
from ..db.models import Part, Order, PartStatusEnum, OrderStatusEnum, User, UserAddress, UserVehicle, Review
from ..domain.auth_permission import require_buyer, get_current_user_optional
from ..domain.fitment_engine import check_basic_fitment
from pydantic import BaseModel
from typing import Optional, List

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
    
    reviewed_part_ids = {r.part_id for r in db.query(Review.part_id).filter(Review.buyer_id == current_user.id).all()}
    
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
            "quantity": o.quantity,
            "created_at": o.created_at,
            "part": o.part,
            "seller_name": seller_name,
            "is_reviewed": getattr(o, "part_id", 0) in reviewed_part_ids or (o.part.id in reviewed_part_ids if o.part else False)
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

@router.get("/sellers/{seller_id}")
def get_seller_profile(seller_id: int, db: Session = Depends(get_db)):
    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller or seller.role.value != "seller":
        raise HTTPException(status_code=404, detail="Seller not found")
    
    parts = db.query(Part).filter(
        Part.seller_id == seller_id, 
        Part.status == PartStatusEnum.APPROVED, 
        Part.quantity > 0
    ).all()
    
    address = None
    default_address = db.query(UserAddress).filter(UserAddress.user_id == seller_id, UserAddress.is_default == True).first()
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

@router.get("/search")
def search_parts(make: str = None, model: str = None, year: int = None, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    user = get_current_user_optional(authorization, db=db)
    user_vehicles = []
    if user and user.role.value == "buyer":
        user_vehicles = db.query(UserVehicle).filter(UserVehicle.user_id == user.id).all()
        
    query = db.query(Part).filter(Part.status == PartStatusEnum.APPROVED, Part.quantity > 0)
    parts = query.all()
    
    results = []
    for p in parts:
        p_dict = p.to_dict()
        
        # Calculate rating
        reviews = db.query(Review).filter(Review.part_id == p.id).all()
        if reviews:
            p_dict["rating"] = round(sum([r.rating for r in reviews]) / len(reviews), 1)
            p_dict["reviews_count"] = len(reviews)
        else:
            p_dict["rating"] = None
            p_dict["reviews_count"] = 0
            
        # Check fitment
        if user_vehicles:
            p_dict["fit_vehicles"] = check_basic_fitment(p.name, p.description, user_vehicles)
        else:
            p_dict["fit_vehicles"] = []
            
        results.append(p_dict)
        
    return results

@router.get("/parts/{part_id}")
def get_part_details(part_id: int, authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == part_id, Part.status == PartStatusEnum.APPROVED, Part.quantity > 0).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
        
    p_dict = part.to_dict()
    user = get_current_user_optional(authorization, db=db)
    if user and user.role.value == "buyer":
        user_vehicles = db.query(UserVehicle).filter(UserVehicle.user_id == user.id).all()
        p_dict["fit_vehicles"] = check_basic_fitment(part.name, part.description, user_vehicles)
    else:
        p_dict["fit_vehicles"] = []
        
    # Get reviews
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

class ReviewCreate(BaseModel):
    rating: int  # 1 to 5
    comment: str | None = None

@router.post("/parts/{part_id}/reviews")
def add_review(part_id: int, review_data: ReviewCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    # Check if previously bought and confirmed
    order = db.query(Order).filter(
        Order.part_id == part_id,
        Order.buyer_id == current_user.id,
        Order.status.in_([OrderStatusEnum.CONFIRMED, OrderStatusEnum.FUNDS_RELEASED])
    ).first()
    
    if not order:
        raise HTTPException(status_code=400, detail="You can only review parts you have purchased and confirmed")
        
    existing = db.query(Review).filter(Review.part_id == part_id, Review.buyer_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this part")
        
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
    new_review = Review(
        part_id=part_id,
        buyer_id=current_user.id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return {"message": "Review added successfully", "review_id": new_review.id}

@router.post("/buy")
def buy_part(order_data: OrderCreate, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.id == order_data.part_id).first()
    if not part or part.status != PartStatusEnum.APPROVED or part.quantity < order_data.quantity:
        raise HTTPException(status_code=400, detail="Part not available for purchase in that quantity")
    new_order = Order(
        buyer_id=current_user.id,
        part_id=order_data.part_id,
        quantity=order_data.quantity,
        status=OrderStatusEnum.PAYMENT_HELD,
        amount_paid=order_data.amount
    )
    db.add(new_order)
    
    part.quantity -= order_data.quantity
    db.commit()
    db.refresh(new_order)
    
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

class ReportOrderData(BaseModel):
    reason: str
    message: str

@router.put("/orders/{order_id}/report")
def report_order(order_id: int, report_data: ReportOrderData, current_user: User = Depends(require_buyer), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.buyer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = OrderStatusEnum.REPORTED
    order.dispute_reason = report_data.reason
    order.dispute_message = report_data.message
    db.commit()
    return {
        "message": "Order reported. Admin will mediate.", 
        "order": {"id": order.id, "status": order.status}
    }