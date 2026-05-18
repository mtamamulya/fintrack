CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     VARCHAR(100),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    name      VARCHAR(100) NOT NULL,
    icon      VARCHAR(50),
    color     CHAR(7),
    type      VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'both')),
    is_system BOOLEAN DEFAULT FALSE
);

CREATE TABLE wallets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    wallet_type VARCHAR(50) NOT NULL CHECK (wallet_type IN ('bank', 'ewallet', 'cash', 'investment', 'other')),
    balance     NUMERIC(15,2) NOT NULL DEFAULT 0,
    currency    CHAR(3) NOT NULL DEFAULT 'IDR',
    color       CHAR(7),
    icon        VARCHAR(50),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id        UUID NOT NULL REFERENCES wallets(id),
    category_id      UUID REFERENCES categories(id),
    type             VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount           NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    description_enc  TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    to_wallet_id     UUID REFERENCES wallets(id),
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budgets (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id    UUID NOT NULL REFERENCES categories(id),
    amount_limit   NUMERIC(15,2) NOT NULL CHECK (amount_limit > 0),
    period_month   SMALLINT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year    SMALLINT NOT NULL,
    warning_pct    SMALLINT NOT NULL DEFAULT 20 CHECK (warning_pct BETWEEN 1 AND 99),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, category_id, period_month, period_year)
);

CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_wallet    ON transactions(wallet_id);
CREATE INDEX idx_transactions_category  ON transactions(category_id);
CREATE INDEX idx_budgets_user_period    ON budgets(user_id, period_year, period_month);
CREATE INDEX idx_wallets_user           ON wallets(user_id);
CREATE INDEX idx_refresh_tokens_hash    ON refresh_tokens(token_hash);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO categories (name, icon, color, type, is_system) VALUES
  ('Gaji',         'briefcase',      '#22c55e', 'income',  TRUE),
  ('Freelance',    'laptop',         '#34d399', 'income',  TRUE),
  ('Investasi',    'trending-up',    '#6ee7b7', 'income',  TRUE),
  ('Bonus',        'gift',           '#a7f3d0', 'income',  TRUE),
  ('Makanan',      'bowl',           '#f97316', 'expense', TRUE),
  ('Transportasi', 'car',            '#3b82f6', 'expense', TRUE),
  ('Kopi & Cafe',  'coffee',         '#fbbf24', 'expense', TRUE),
  ('Belanja',      'shopping-cart',  '#a78bfa', 'expense', TRUE),
  ('Kesehatan',    'heart',          '#f43f5e', 'expense', TRUE),
  ('Hiburan',      'device-gamepad', '#ec4899', 'expense', TRUE),
  ('Pendidikan',   'book',           '#0ea5e9', 'expense', TRUE),
  ('Tagihan',      'file-invoice',   '#64748b', 'expense', TRUE),
  ('Lainnya',      'dots-circle',    '#94a3b8', 'both',    TRUE);
