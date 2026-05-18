from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, hash_refresh_token, decode_token
from app.core.config import settings
from app.models import User, RefreshToken
from app.schemas import RegisterRequest, RefreshRequest
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email sudah terdaftar")
    from app.models import Wallet, Category
    
    user = User(
        id            = uuid.uuid4(),
        email         = payload.email,
        password_hash = hash_password(payload.password),
        full_name     = payload.full_name,
    )
    db.add(user)
    
    # Create default wallet
    default_wallet = Wallet(
        id=uuid.uuid4(),
        user_id=user.id,
        name="Dompet Cash",
        wallet_type="cash",
        balance=0,
        currency="IDR",
        color="#4F46E5",
        icon="wallet",
        is_active=True
    )
    db.add(default_wallet)
    
    # Create some default categories
    cat_income = Category(id=uuid.uuid4(), user_id=user.id, name="Gaji", type="income", icon="cash", color="#10B981")
    cat_expense = Category(id=uuid.uuid4(), user_id=user.id, name="Makan", type="expense", icon="food", color="#EF4444")
    db.add_all([cat_income, cat_expense])

    await db.commit()
    return {"message": "Registrasi berhasil", "user_id": str(user.id)}


@router.post("/token")
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form.username))
    user   = result.scalar_one_or_none()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    access  = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    rt = RefreshToken(
        user_id    = user.id,
        token_hash = hash_refresh_token(refresh),
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXP_MINUTES),
    )
    db.add(rt)
    await db.commit()

    return {
        "access_token" : access,
        "refresh_token": refresh,
        "token_type"   : "bearer",
        "user"         : {"id": str(user.id), "email": user.email, "full_name": user.full_name},
    }


@router.post("/refresh")
async def refresh_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    token_hash = hash_refresh_token(payload.refresh_token)
    result     = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    stored     = result.scalar_one_or_none()

    if not stored or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token kadaluarsa")

    await db.delete(stored)
    new_access  = create_access_token(data["sub"])
    new_refresh = create_refresh_token(data["sub"])
    new_rt = RefreshToken(
        user_id    = stored.user_id,
        token_hash = hash_refresh_token(new_refresh),
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXP_MINUTES),
    )
    db.add(new_rt)
    await db.commit()

    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}
