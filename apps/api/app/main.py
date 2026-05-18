from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.routers.auth         import router as auth_router
from app.routers.wallets      import router as wallets_router
from app.routers.transactions import router as txn_router
from app.routers.budgets      import router as budgets_router
from app.routers.dashboard    import router as dashboard_router

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title    = "FinTrack API",
    version  = "1.0.0",
    docs_url = "/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url= None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:5173", "capacitor://localhost", "https://yourapp.com"],
    allow_methods     = ["*"],
    allow_headers     = ["*"],
    allow_credentials = True,
)

app.include_router(auth_router)
app.include_router(wallets_router)
app.include_router(txn_router)
app.include_router(budgets_router)
app.include_router(dashboard_router)

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
