from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from ..db.session import get_db
from ..db.models import User, RoleEnum
import os

SECRET_KEY = os.getenv("SECRET_KEY", "modmatch-super-secret-key-change-in-prod")
ALGORITHM = "HS256"

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_role(*roles: RoleEnum):
    """Factory that returns a dependency enforcing one of the given roles."""
    def _check(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {[r.value for r in roles]}"
            )
        return current_user
    return _check


# Convenience shortcuts
require_buyer  = require_role(RoleEnum.BUYER)
require_seller = require_role(RoleEnum.SELLER)
require_admin  = require_role(RoleEnum.ADMIN)
require_buyer_or_seller = require_role(RoleEnum.BUYER, RoleEnum.SELLER)
