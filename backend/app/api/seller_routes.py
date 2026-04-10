from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..db.models import Part, PartStatusEnum, Order, OrderStatusEnum, User
from ..domain.auth_permission import require_seller  # NEW
from pydantic import BaseModel

router = APIRouter()

class PartCreate(BaseModel):
    name: str
    description: str
    price: float
    quantity: int = 1
    brand: str | None = None
    category: str | None = None

@router.post("/listings")
def create_listing(part_data: PartCreate, current_user: User = Depends(require_seller), db: Session = Depends(get_db)):
    new_part = Part(
        seller_id=current_user.id,
        name=part_data.name,
        description=part_data.description,
        price=part_data.price,
        quantity=part_data.quantity,
        brand=part_data.brand,
        category=part_data.category,
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
            "created_at": o.created_at,
            "buyer_name": buyer_name,
            "buyer_id": o.buyer_id,
            "part_name": part_name,
            "part_id": o.part_id
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