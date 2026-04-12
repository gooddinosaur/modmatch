"""
Usage:
  cd backend
  python -m scripts.create_admin --email admin1@gmail.com --password 1234

This is the ONLY way to create admin accounts.
"""
import argparse
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.session import SessionLocal
from app.db.models import User, RoleEnum
from app.api.auth_routes import hash_password


def create_admin(email: str, password: str):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"[!] User {email} already exists (role: {existing.role.value})")
            return
        user = User(
            email=email,
            hashed_password=hash_password(password),
            role=RoleEnum.ADMIN,
        )
        db.add(user)
        db.commit()
        print(f"[✓] Admin account created: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()
    create_admin(args.email, args.password)