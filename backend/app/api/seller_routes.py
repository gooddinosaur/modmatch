from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Part, PartStatusEnum, Order, OrderStatusEnum, User, UserAddress
from ..domain.auth_permission import require_seller  # NEW
from pydantic import BaseModel
import shutil
import uuid
import os
from typing import List

router = APIRouter()

@router.post("/upload_images")
async def upload_images(files: List[UploadFile] = File(...), current_user: User = Depends(require_seller)):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images allowed")
    
    file_urls = []
    # Create absolute path if running from deep directory, or just rel to CWD
    os.makedirs("uploads", exist_ok=True)
    
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
            
        file_ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join("uploads", unique_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_urls.append(f"/api/v1/uploads/{unique_name}")
        
    return {"urls": file_urls}

class PartCreate(BaseModel):
    name: str
    description: str
    price: float
    quantity: int = 1
    brand: str | None = None
    category: str | None = None
    image_url: str | List[str] | None = None

@router.post("/listings")
def create_listing(part_data: PartCreate, current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    image_url_str = None
    if part_data.image_url:
        if isinstance(part_data.image_url, list):
            image_url_str = ",".join(part_data.image_url)
        else:
            image_url_str = part_data.image_url

    new_part = Part(
        seller_id=current_user.id,
        name=part_data.name,
        description=part_data.description,
        price=part_data.price,
        quantity=part_data.quantity,
        brand=part_data.brand,
        category=part_data.category,
        image_url=image_url_str,
        status=PartStatusEnum.PENDING
    )
    db.add(new_part)
    db.commit()
    db.refresh(new_part)
    return {"message": "Listing created and pending admin approval", "part": new_part}

@router.get("/listings")
def get_my_listings(current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    parts = db.query(Part).filter(Part.seller_id == current_user.id).all()
    return [p.to_dict() for p in parts]

@router.get("/orders")
def get_my_orders(current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    orders = db.query(Order).join(Part).filter(Part.seller_id == current_user.id).order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        buyer_name = o.buyer.display_name or o.buyer.email if o.buyer else f"Buyer #{o.buyer_id}"
        part_name = o.part.name if o.part else f"Part #{o.part_id}"
        result.append({
            "id": o.id,
            "status": o.status,
            "amount_paid": o.amount_paid,
            "quantity": o.quantity,
            "created_at": o.created_at,
            "buyer_name": buyer_name,
            "buyer_id": o.buyer_id,
            "part_name": part_name,
            "part_id": o.part_id,
            "part_image": o.part.image_url if o.part else None,
            "dispute_reason": o.dispute_reason,
            "dispute_message": o.dispute_message
        })
    return result

@router.put("/orders/{order_id}/mark_shipped")
def mark_order_shipped(order_id: int, tracking_number: str, current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    order = db.query(Order).join(Part).filter(Order.id == order_id, Part.seller_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not owned by seller")
    order.status = OrderStatusEnum.SHIPPED
    db.commit()
    db.refresh(order)
    return {"message": "Order marked as shipped", "tracking": tracking_number, "order": order}

@router.post("/orders/{order_id}/withdraw")
def withdraw_funds(order_id: int, current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    order = db.query(Order).join(Part).filter(Order.id == order_id, Part.seller_id == current_user.id).first()
    if not order or order.status not in [OrderStatusEnum.CONFIRMED, OrderStatusEnum.FUNDS_RELEASED]:
        raise HTTPException(status_code=400, detail="Funds not available for withdrawal yet")
    return {"message": "Funds successfully withdrawn", "amount": order.amount_paid}

class AddressSchema(BaseModel):
    label: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    province: str | None = None
    postal_code: str | None = None

class SellerProfileUpdate(BaseModel):
    display_name: str | None = None
    phone: str | None = None
    description: str | None = None
    line_id: str | None = None
    facebook: str | None = None
    specialties: str | None = None
    address: AddressSchema | None = None

@router.get("/profile")
def get_profile(current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    address = db.query(UserAddress).filter(UserAddress.user_id == current_user.id, UserAddress.is_default == True).first()
    if not address:
        address = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).first()
        
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

@router.put("/profile")
def update_profile(profile_data: SellerProfileUpdate, current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    if profile_data.display_name is not None:
        current_user.display_name = profile_data.display_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.description is not None:
        current_user.description = profile_data.description
    if profile_data.line_id is not None:
        current_user.line_id = profile_data.line_id
    if profile_data.facebook is not None:
        current_user.facebook = profile_data.facebook
    if profile_data.specialties is not None:
        current_user.specialties = profile_data.specialties
        
    if profile_data.address:
        address = db.query(UserAddress).filter(UserAddress.user_id == current_user.id, UserAddress.is_default == True).first()
        if not address:
            address = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).first()
            
        if not address:
            address = UserAddress(user_id=current_user.id, is_default=True)
            db.add(address)
            
        if profile_data.address.label is not None:
            address.label = profile_data.address.label
        if profile_data.address.first_name is not None:
            address.first_name = profile_data.address.first_name
        if profile_data.address.last_name is not None:
            address.last_name = profile_data.address.last_name
        if profile_data.address.phone is not None:
            address.phone = profile_data.address.phone
        if profile_data.address.address_line1 is not None:
            address.address_line1 = profile_data.address.address_line1
        if profile_data.address.address_line2 is not None:
            address.address_line2 = profile_data.address.address_line2
        if profile_data.address.city is not None:
            address.city = profile_data.address.city
        if profile_data.address.province is not None:
            address.province = profile_data.address.province
        if profile_data.address.postal_code is not None:
            address.postal_code = profile_data.address.postal_code

    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully"}