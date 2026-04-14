from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import User
from ..domain.auth_permission import require_seller
from pydantic import BaseModel
import shutil
import uuid
import os
from typing import List

from ..services.listing_service import ListingService
from ..services.order_service import OrderService
from ..services.seller_service import SellerService

router = APIRouter()

@router.post("/upload_images")
async def upload_images(files: List[UploadFile] = File(...), current_user: User = Depends(require_seller)):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images allowed")
    
    file_urls = []
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

    new_part = ListingService.create_listing(part_data, current_user.id, image_url_str, db)
    return {"message": "Listing created and pending admin approval", "part": new_part}

@router.get("/listings")
def get_my_listings(current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    return ListingService.get_my_listings(current_user.id, db)

@router.get("/orders")
def get_my_orders(current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    return OrderService.get_seller_orders(current_user.id, db)

@router.put("/orders/{order_id}/mark_shipped")
def mark_order_shipped(order_id: int, tracking_number: str, current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    return SellerService.mark_order_shipped(order_id, current_user.id, tracking_number, db)

@router.post("/orders/{order_id}/withdraw")
def withdraw_funds(order_id: int, current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    return SellerService.withdraw_funds(order_id, current_user.id, db)

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
    return SellerService.get_profile(db, current_user)

@router.put("/profile")
def update_profile(profile_data: SellerProfileUpdate, current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    SellerService.update_profile(db, current_user, profile_data.model_dump() if hasattr(profile_data, 'model_dump') else profile_data.dict(exclude_unset=True))
    return {"message": "Profile updated successfully"}
