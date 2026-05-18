# FinTrack 💰

Aplikasi pencatat keuangan cross-platform: Web + Android (Capacitor).

## Quickstart (3 langkah)

### 1. Setup environment variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Buka apps/api/.env dan isi:
#   JWT_SECRET_KEY  → hasil: openssl rand -hex 32
#   FIELD_ENC_KEY   → hasil: openssl rand -hex 32

# Frontend
cp apps/web/.env.example apps/web/.env.local
# VITE_API_URL=http://localhost:8000 (sudah diisi)
```

### 2. Jalankan PostgreSQL + Backend

```bash
# Jalankan database (otomatis apply schema.sql)
docker-compose up db -d

# Tunggu 5 detik, lalu jalankan API
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Jalankan Frontend

```bash
cd apps/web
npm install
npm run dev
# Buka: http://localhost:5173
```

---

## Struktur Folder

```
fintrack/
├── database/
│   └── schema.sql              ← PostgreSQL DDL + seed kategori
├── apps/
│   ├── api/                    ← FastAPI backend
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── config.py   ← Settings (pydantic-settings)
│   │   │   │   ├── database.py ← SQLAlchemy async engine
│   │   │   │   └── security.py ← JWT + bcrypt + AES-256-GCM
│   │   │   ├── models/
│   │   │   │   └── __init__.py ← ORM: User, Wallet, Transaction, Budget
│   │   │   ├── schemas/
│   │   │   │   └── __init__.py ← Pydantic request/response schemas
│   │   │   ├── routers/
│   │   │   │   ├── auth.py         ← POST /auth/register, /token, /refresh
│   │   │   │   ├── wallets.py      ← GET/POST/DELETE /wallets
│   │   │   │   ├── transactions.py ← GET/POST/DELETE /transactions
│   │   │   │   ├── budgets.py      ← GET/POST/DELETE /budgets
│   │   │   │   └── dashboard.py    ← GET /dashboard/summary
│   │   │   └── main.py         ← FastAPI app entry point
│   │   ├── .env.example
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── web/                    ← React + Vite + Tailwind + Capacitor
│       ├── src/
│       │   ├── api/client.ts   ← Axios + JWT interceptor
│       │   ├── store/authStore.ts
│       │   ├── hooks/          ← useDashboard, useTransactions, useWallets
│       │   ├── pages/          ← Login, Dashboard, Transactions, Budget
│       │   ├── components/Layout.tsx
│       │   ├── types/index.ts
│       │   ├── utils/format.ts
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── .env.example
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── tsconfig.json
│       ├── capacitor.config.ts
│       └── index.html
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Path                    | Keterangan                      |
|--------|-------------------------|---------------------------------|
| POST   | /auth/register          | Daftar akun                     |
| POST   | /auth/token             | Login → access + refresh token  |
| POST   | /auth/refresh           | Perbarui access token           |
| GET    | /wallets/               | List dompet                     |
| POST   | /wallets/               | Buat dompet                     |
| DELETE | /wallets/{id}           | Hapus dompet (soft delete)      |
| GET    | /transactions/          | List transaksi                  |
| POST   | /transactions/          | Buat transaksi + update saldo   |
| DELETE | /transactions/{id}      | Hapus + reverse saldo           |
| GET    | /budgets/?month=&year=  | List budget bulan ini           |
| POST   | /budgets/               | Buat budget kategori            |
| DELETE | /budgets/{id}           | Hapus budget                    |
| GET    | /dashboard/summary      | Semua data dashboard            |
| GET    | /health                 | Health check                    |

Dokumentasi interaktif: http://localhost:8000/docs (development mode)

## Build Android (Capacitor)

```bash
cd apps/web

# 1. Install Capacitor (pertama kali)
npx cap add android

# 2. Build + sync setiap ada perubahan
npm run cap:sync

# 3. Buka di Android Studio
npm run cap:open
```
