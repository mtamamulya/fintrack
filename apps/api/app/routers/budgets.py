from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models import Budget
from app.schemas import BudgetCreate, BudgetResponse
import uuid

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/", response_model=List[BudgetResponse])
async def list_budgets(
    month  : int = Query(..., ge=1, le=12),
    year   : int = Query(...),
    user_id: str = Depends(get_current_user_id),
    db     : AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Budget).where(
            Budget.user_id      == uuid.UUID(user_id),
            Budget.period_month == month,
            Budget.period_year  == year,
        )
    )
    return [
        BudgetResponse(
            id=str(b.id), category_id=str(b.category_id),
            amount_limit=float(b.amount_limit),
            period_month=b.period_month, period_year=b.period_year,
            warning_pct=b.warning_pct,
        )
        for b in result.scalars().all()
    ]


@router.post("/", response_model=BudgetResponse, status_code=201)
async def create_budget(
    payload: BudgetCreate,
    user_id: str = Depends(get_current_user_id),
    db     : AsyncSession = Depends(get_db),
):
    b = Budget(
        id           = uuid.uuid4(),
        user_id      = uuid.UUID(user_id),
        category_id  = uuid.UUID(payload.category_id),
        amount_limit = payload.amount_limit,
        period_month = payload.period_month,
        period_year  = payload.period_year,
        warning_pct  = payload.warning_pct,
    )
    db.add(b)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(409, "Budget untuk kategori dan periode ini sudah ada")
    await db.refresh(b)
    return BudgetResponse(
        id=str(b.id), category_id=str(b.category_id),
        amount_limit=float(b.amount_limit),
        period_month=b.period_month, period_year=b.period_year,
        warning_pct=b.warning_pct,
    )


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: str,
    user_id  : str = Depends(get_current_user_id),
    db       : AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Budget).where(
            Budget.id      == uuid.UUID(budget_id),
            Budget.user_id == uuid.UUID(user_id),
        )
    )
    b = result.scalar_one_or_none()
    if not b:
        raise HTTPException(404, "Budget tidak ditemukan")
    await db.delete(b)
    await db.commit()
