from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..repositories.order_repo import OrderRepository
from ..repositories.part_repo import PartRepository
from ..db.models import Order, OrderStatusEnum

class OrderService:
    @staticmethod
    def get_buyer_orders(buyer_id: int, db: Session):
        orders = OrderRepository.get_orders_by_buyer_id(db, buyer_id)
        reviewed_part_ids = OrderRepository.get_reviewed_part_ids_by_buyer(db, buyer_id)
        
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

    @staticmethod
    def buy_part(order_data, buyer_id: int, db: Session):
        part = PartRepository.get_approved_part_by_id(db, order_data.part_id)
        if not part or part.quantity < order_data.quantity:
            raise HTTPException(status_code=400, detail="Part not available for purchase in that quantity")
        
        new_order = Order(
            buyer_id=buyer_id,
            part_id=order_data.part_id,
            quantity=order_data.quantity,
            status=OrderStatusEnum.PAYMENT_HELD,
            amount_paid=order_data.amount
        )
        OrderRepository.create_order(db, new_order)
        part.quantity -= order_data.quantity
        
        OrderRepository.db_commit(db)
        OrderRepository.db_refresh(db, new_order)
        
        return {
            "message": "Payment held in escrow, awaiting seller to ship", 
            "order": {"id": new_order.id, "status": new_order.status}
        }

    @staticmethod
    def confirm_order(order_id: int, buyer_id: int, db: Session):
        order = OrderRepository.get_order_by_id_and_buyer(db, order_id, buyer_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order.status = OrderStatusEnum.CONFIRMED
        OrderRepository.db_commit(db)
        OrderRepository.db_refresh(db, order)
        
        return {
            "message": "Order confirmed! Funds available for seller.", 
            "order": {"id": order.id, "status": order.status}
        }

    @staticmethod
    def report_order(order_id: int, report_data, buyer_id: int, db: Session):
        order = OrderRepository.get_order_by_id_and_buyer(db, order_id, buyer_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order.status = OrderStatusEnum.REPORTED
        order.dispute_reason = report_data.reason
        order.dispute_message = report_data.message
        
        OrderRepository.db_commit(db)
        
        return {
            "message": "Order reported. Admin will mediate.", 
            "order": {"id": order.id, "status": order.status}
        }

    @staticmethod
    def get_seller_orders(seller_id: int, db: Session):
        from ..db.models import Order, Part
        orders = db.query(Order).join(Part).filter(Part.seller_id == seller_id).order_by(Order.created_at.desc()).all()
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
