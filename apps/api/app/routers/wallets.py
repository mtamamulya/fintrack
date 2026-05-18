from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models import Wallet
from app.schemas import WalletCreate, WalletResponse
import uuid

router = APIRouter(prefix="/wallets", tags=["wallets"])


@router.get("/", response_model=List[WalletResponse])
async def list_wallets(
    user_id: str = Depends(get_current_user_id),
    db     : AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == uuid.UUID(user_id), Wallet.is_active == True)
    )
    return [
        WalletResponse(
            id=str(w.id), name=w.name, wallet_type=w.wallet_type,
            balance=float(w.balance), currency=w.currency,
            color=w.color, icon=w.icon,
        )
        for w in result.scalars().all()
    ]


@router.post("/", response_model=WalletResponse, status_code=201)
async def create_wallet(
    payload: WalletCreate,
    user_id: str = Depends(get_current_user_id),
    db     : AsyncSession = Depends(get_db),
):
    w = Wallet(id=uuid.uuid4(), user_id=uuid.UUID(user_id), **payload.model_dump())
    db.add(w)
    await db.commit()
    await db.refresh(w)
    return WalletResponse(
        id=str(w.id), name=w.name, wallet_type=w.wallet_type,
        balance=float(w.balance), currency=w.currency,
        color=w.color, icon=w.icon,
    )


@router.delete("/{wallet_id}", status_code=204)
async def delete_wallet(
    wallet_id: str,
    user_id  : str = Depends(get_current_user_id),
    db       : AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wallet).where(Wallet.id == uuid.UUID(wallet_id), Wallet.user_id == uuid.UUID(user_id))
    )
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(404, "Wallet tidak ditemukan")
    w.is_active = False  # soft delete
    await db.commit()
