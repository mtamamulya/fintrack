export interface WalletBalance {
  wallet_id  : string
  name       : string
  wallet_type: string
  balance    : number
  currency   : string
}

export interface CategorySpend {
  category_name : string
  category_color: string | null
  amount        : number
}

export interface MonthlyDataPoint {
  period : string
  income : number
  expense: number
}

export interface BudgetStatus {
  category_name : string
  limit         : number
  spent         : number
  remaining_pct : number
  is_warning    : boolean
}

export interface DashboardSummary {
  total_balance     : number
  total_income_mtd  : number
  total_expense_mtd : number
  wallets           : WalletBalance[]
  category_spend    : CategorySpend[]
  monthly_chart     : MonthlyDataPoint[]
  budget_statuses   : BudgetStatus[]
}

export interface TransactionCreate {
  wallet_id        : string
  category_id?     : string | null
  type             : 'income' | 'expense' | 'transfer'
  amount           : number
  description?     : string
  transaction_date : string
  to_wallet_id?    : string | null
}

export interface TransactionResponse extends TransactionCreate {
  id: string
}

export interface WalletCreate {
  name       : string
  wallet_type: string
  balance?   : number
  currency?  : string
  color?     : string
  icon?      : string
}

export interface WalletResponse {
  id         : string
  name       : string
  wallet_type: string
  balance    : number
  currency   : string
  color?     : string
  icon?      : string
}
