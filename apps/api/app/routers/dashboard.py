from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import date
from app.core.database import get_db
from app.core.security import get_current_user_id
from app.schemas import (DashboardSummary, WalletBalance, CategorySpend,
                         MonthlyDataPoint, BudgetStatus)

import uuid

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    user_id: str = Depends(get_current_user_id),
    db     : AsyncSession = Depends(get_db),
):
    today        = date.today()
    month, year  = today.month, today.year
    user_uuid_hex = uuid.UUID(user_id).hex

    # Wallet balances
    w_rows = await db.execute(
        text("SELECT id, name, wallet_type, balance, currency FROM wallets WHERE user_id=:u AND is_active"),
        {"u": user_uuid_hex}
    )
    wallets = [
        WalletBalance(wallet_id=str(r.id), name=r.name, wallet_type=r.wallet_type,
                      balance=float(r.balance), currency=r.currency)
        for r in w_rows.fetchall()
    ]

    # Month-to-date income / expense
    mtd_rows = await db.execute(text("""
        SELECT type, COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE user_id = :u
          AND type IN ('income', 'expense')
          AND cast(strftime('%m', transaction_date) as integer) = :m
          AND cast(strftime('%Y', transaction_date) as integer) = :y
        GROUP BY type
    """), {"u": user_uuid_hex, "m": month, "y": year})
    income_mtd = expense_mtd = 0.0
    for r in mtd_rows.fetchall():
        if r.type == "income":  income_mtd  = float(r.total)
        if r.type == "expense": expense_mtd = float(r.total)

    # Category spend this month
    cat_rows = await db.execute(text("""
        SELECT c.name, c.color, COALESCE(SUM(t.amount), 0) AS total
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = :u
          AND t.type = 'expense'
          AND cast(strftime('%m', t.transaction_date) as integer) = :m
          AND cast(strftime('%Y', t.transaction_date) as integer) = :y
        GROUP BY c.name, c.color
        ORDER BY total DESC
        LIMIT 8
    """), {"u": user_uuid_hex, "m": month, "y": year})
    category_spend = [
        CategorySpend(category_name=r.name, category_color=r.color, amount=float(r.total))
        for r in cat_rows.fetchall()
    ]

    # Monthly chart — last 6 months
    chart_rows = await db.execute(text("""
        SELECT strftime('%Y-%m', transaction_date) AS period,
               type, SUM(amount) AS total
        FROM transactions
        WHERE user_id = :u
          AND type IN ('income', 'expense')
          AND transaction_date >= date('now', '-6 months', 'start of month')
        GROUP BY period, type
        ORDER BY period
    """), {"u": user_uuid_hex})
    monthly_map: dict = {}
    for r in chart_rows.fetchall():
        entry = monthly_map.setdefault(r.period, {"income": 0.0, "expense": 0.0})
        entry[r.type] = float(r.total)
    monthly_chart = [
        MonthlyDataPoint(period=p, income=v["income"], expense=v["expense"])
        for p, v in monthly_map.items()
    ]

    # Budget statuses
    budget_rows = await db.execute(text("""
        SELECT b.amount_limit, b.warning_pct, c.name,
               COALESCE(SUM(t.amount), 0) AS spent
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        LEFT JOIN transactions t
               ON t.category_id = b.category_id
              AND t.user_id      = b.user_id
              AND t.type         = 'expense'
              AND cast(strftime('%m', t.transaction_date) as integer) = b.period_month
              AND cast(strftime('%Y', t.transaction_date) as integer) = b.period_year
        WHERE b.user_id      = :u
          AND b.period_month = :m
          AND b.period_year  = :y
        GROUP BY b.amount_limit, b.warning_pct, c.name
    """), {"u": user_uuid_hex, "m": month, "y": year})
    budget_statuses = []
    for r in budget_rows.fetchall():
        spent = float(r.spent)
        limit = float(r.amount_limit)
        rem   = round(max(0.0, (1 - spent / limit) * 100), 1) if limit else 0.0
        budget_statuses.append(BudgetStatus(
            category_name = r.name,
            limit         = limit,
            spent         = spent,
            remaining_pct = rem,
            is_warning    = rem <= r.warning_pct,
        ))

    return DashboardSummary(
        total_balance     = sum(w.balance for w in wallets),
        total_income_mtd  = income_mtd,
        total_expense_mtd = expense_mtd,
        wallets           = wallets,
        category_spend    = category_spend,
        monthly_chart     = monthly_chart,
        budget_statuses   = budget_statuses,
    )
