from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal, Optional, List
from datetime import date
import uuid


# --- Auth ---
class RegisterRequest(BaseModel):
    email    : EmailStr
    password : str
    full_name: str

class RefreshRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token : str
    refresh_token: str
    token_type   : str
    user         : dict


# --- Wallet ---
class WalletCreate(BaseModel):
    name       : str
    wallet_type: str
    balance    : float = 0
    currency   : str   = "IDR"
    color      : Optional[str] = None
    icon       : Optional[str] = None

class WalletResponse(BaseModel):
    id         : str
    name       : str
    wallet_type: str
    balance    : float
    currency   : str
    color      : Optional[str]
    icon       : Optional[str]
    class Config: from_attributes = True


# --- Transaction ---
class TransactionCreate(BaseModel):
    wallet_id        : str
    category_id      : Optional[str] = None
    type             : Literal["income", "expense", "transfer"]
    amount           : float = Field(gt=0)
    description      : Optional[str] = Field(None, max_length=500)
    transaction_date : date = Field(default_factory=date.today)
    to_wallet_id     : Optional[str] = None

    @field_validator("to_wallet_id")
    @classmethod
    def check_transfer(cls, v, info):
        if info.data.get("type") == "transfer" and not v:
            raise ValueError("to_wallet_id wajib diisi untuk transaksi transfer")
        return v

class TransactionResponse(BaseModel):
    id               : str
    wallet_id        : str
    category_id      : Optional[str]
    type             : str
    amount           : float
    description      : Optional[str]
    transaction_date : date


# --- Budget ---
class BudgetCreate(BaseModel):
    category_id  : str
    amount_limit : float
    period_month : int
    period_year  : int
    warning_pct  : int = 20

class BudgetResponse(BaseModel):
    id           : str
    category_id  : str
    amount_limit : float
    period_month : int
    period_year  : int
    warning_pct  : int


# --- Dashboard ---
class WalletBalance(BaseModel):
    wallet_id  : str
    name       : str
    wallet_type: str
    balance    : float
    currency   : str

class CategorySpend(BaseModel):
    category_name : str
    category_color: Optional[str]
    amount        : float

class MonthlyDataPoint(BaseModel):
    period : str
    income : float
    expense: float

class BudgetStatus(BaseModel):
    category_name : str
    limit         : float
    spent         : float
    remaining_pct : float
    is_warning    : bool

class DashboardSummary(BaseModel):
    total_balance     : float
    total_income_mtd  : float
    total_expense_mtd : float
    wallets           : List[WalletBalance]
    category_spend    : List[CategorySpend]
    monthly_chart     : List[MonthlyDataPoint]
    budget_statuses   : List[BudgetStatus]
