from sqlalchemy.orm import Session
from ..db.models import User, UserAddress, UserVehicle

class UserRepository:
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_addresses_by_user(db: Session, user_id: int):
        return db.query(UserAddress).filter(UserAddress.user_id == user_id).all()

    @staticmethod
    def get_address_by_id_and_user(db: Session, addr_id: int, user_id: int) -> UserAddress:
        return db.query(UserAddress).filter(UserAddress.id == addr_id, UserAddress.user_id == user_id).first()

    @staticmethod
    def get_default_address_by_user(db: Session, user_id: int) -> UserAddress:
        return db.query(UserAddress).filter(UserAddress.user_id == user_id, UserAddress.is_default == True).first()

    @staticmethod
    def get_first_address_by_user(db: Session, user_id: int) -> UserAddress:
        return db.query(UserAddress).filter(UserAddress.user_id == user_id).first()

    @staticmethod
    def count_addresses_by_user(db: Session, user_id: int) -> int:
        return db.query(UserAddress).filter(UserAddress.user_id == user_id).count()

    @staticmethod
    def add_address(db: Session, address: UserAddress) -> UserAddress:
        db.add(address)
        db.commit()
        db.refresh(address)
        return address

    @staticmethod
    def delete_address(db: Session, address: UserAddress):
        db.delete(address)
        db.commit()

    @staticmethod
    def update_all_addresses_default_status(db: Session, user_id: int, target_addr_id: int):
        addresses = db.query(UserAddress).filter(UserAddress.user_id == user_id).all()
        for addr in addresses:
            addr.is_default = (addr.id == target_addr_id)
        db.commit()

    @staticmethod
    def get_vehicles_by_user(db: Session, user_id: int):
        return db.query(UserVehicle).filter(UserVehicle.user_id == user_id).all()

    @staticmethod
    def get_vehicle_by_id_and_user(db: Session, vehicle_id: int, user_id: int) -> UserVehicle:
        return db.query(UserVehicle).filter(UserVehicle.id == vehicle_id, UserVehicle.user_id == user_id).first()

    @staticmethod
    def add_vehicle(db: Session, vehicle: UserVehicle) -> UserVehicle:
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
        return vehicle

    @staticmethod
    def delete_vehicle(db: Session, vehicle: UserVehicle):
        db.delete(vehicle)
        db.commit()
