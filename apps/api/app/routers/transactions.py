from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, extract
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user_id, encrypt_field, decrypt_field
from app.models import Transaction, Wallet
from app.schemas import TransactionCreate, TransactionResponse
import uuid

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    payload: TransactionCreate,
    user_id: str = Depends(get_current_user_id),
    db     : AsyncSession = Depends(get_db),
):
    # 1. Validasi wallet milik user
    wallet_result = await db.execute(
        select(Wallet).where(
            Wallet.id      == uuid.UUID(payload.wallet_id),
            Wallet.user_id == uuid.UUID(user_id),
        )
    )
    wallet = wallet_result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(404, "Wallet tidak ditemukan")

    # 2. Validasi saldo untuk pengeluaran / transfer
    if payload.type in ("expense", "transfer") and wallet.balance < payload.amount:
        raise HTTPException(422, f"Saldo tidak cukup. Tersedia: {wallet.balance}")

    # 3. Enkripsi deskripsi
    enc_desc = encrypt_field(payload.description) if payload.description else None

    # 4. Simpan transaksi
    txn = Transaction(
        id               = uuid.uuid4(),
        user_id          = uuid.UUID(user_id),
        wallet_id        = uuid.UUID(payload.wallet_id),
        category_id      = uuid.UUID(payload.category_id) if payload.category_id else None,
        type             = payload.type,
        amount           = payload.amount,
        description_enc  = enc_desc,
        transaction_date = payload.transaction_date,
        to_wallet_id     = uuid.UUID(payload.to_wallet_id) if payload.to_wallet_id else None,
    )
    db.add(txn)

    # 5. Update saldo wallet
    if payload.type == "income":
        wallet.balance += payload.amount
    elif payload.type == "expense":
        wallet.balance -= payload.amount
    elif payload.type == "transfer":
        to_result = await db.execute(
            select(Wallet).where(
                Wallet.id      == uuid.UUID(payload.to_wallet_id),
                Wallet.user_id == uuid.UUID(user_id),
            )
        )
        to_wallet = to_result.scalar_one_or_none()
        if not to_wallet:
            raise HTTPException(404, "Wallet tujuan tidak ditemukan")
        wallet.balance    -= payload.amount
        to_wallet.balance += payload.amount

    await db.commit()
    await db.refresh(txn)

    return TransactionResponse(
        id               = str(txn.id),
        wallet_id        = str(txn.wallet_id),
        category_id      = str(txn.category_id) if txn.category_id else None,
        type             = txn.type,
        amount           = float(txn.amount),
        description      = decrypt_field(txn.description_enc) if txn.description_enc else None,
        transaction_date = txn.transaction_date,
    )


@router.get("/", response_model=List[TransactionResponse])
async def list_transactions(
    wallet_id : Optional[str] = Query(None),
    month     : Optional[int] = Query(None, ge=1, le=12),
    year      : Optional[int] = Query(None),
    limit     : int           = Query(50, le=200),
    offset    : int           = Query(0),
    user_id   : str           = Depends(get_current_user_id),
    db        : AsyncSession  = Depends(get_db),
):
    filters = [Transaction.user_id == uuid.UUID(user_id)]
    if wallet_id: filters.append(Transaction.wallet_id == uuid.UUID(wallet_id))
    if month:     filters.append(extract("month", Transaction.transaction_date) == month)
    if year:      filters.append(extract("year",  Transaction.transaction_date) == year)

    result = await db.execute(
        select(Transaction)
        .where(and_(*filters))
        .order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        .limit(limit).offset(offset)
    )
    return [
        TransactionResponse(
            id               = str(t.id),
            wallet_id        = str(t.wallet_id),
            category_id      = str(t.category_id) if t.category_id else None,
            type             = t.type,
            amount           = float(t.amount),
            description      = decrypt_field(t.description_enc) if t.description_enc else None,
            transaction_date = t.transaction_date,
        )
        for t in result.scalars().all()
    ]


@router.delete("/{txn_id}", status_code=204)
async def delete_transaction(
    txn_id : str,
    user_id: str = Depends(get_current_user_id),
    db     : AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(
            Transaction.id      == uuid.UUID(txn_id),
            Transaction.user_id == uuid.UUID(user_id),
        )
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(404, "Transaksi tidak ditemukan")

    # Reverse saldo
    wallet = await db.get(Wallet, txn.wallet_id)
    if wallet:
        if txn.type == "income":   wallet.balance -= txn.amount
        elif txn.type == "expense": wallet.balance += txn.amount

    await db.delete(txn)
    await db.commit()
