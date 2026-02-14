/**
 * Tipos para Stellar Ecosystem Proposals (SEP)
 * SEP-0002: Federation, SEP-0004: Tx Status, SEP-0006: Deposit/Withdrawal
 */

// --- SEP-0002 Federation ---
export interface FederationRecord {
  stellar_address: string
  account_id: string
  memo_type?: "text" | "id" | "hash"
  memo?: string
}

export type FederationQueryType = "name" | "id" | "txid" | "forward"

// --- SEP-0004 Tx Status ---
export type TxStatus =
  | "unknown"
  | "approved"
  | "not_approved"
  | "pending"
  | "failed"
  | "refunded"
  | "claimable"
  | "delivered"

export interface TxStatusResponse {
  status: TxStatus
  recv_code?: string
  refund_tx?: string
  msg?: string
}

// --- SEP-0006 Deposit / Withdrawal ---
export interface Sep6InfoAsset {
  code: string
  issuer?: string
  deposit?: {
    enabled: boolean
    min_amount?: number
    max_amount?: number
    fee_fixed?: number
    fee_percent?: number
    [key: string]: unknown
  }
  withdraw?: {
    enabled: boolean
    min_amount?: number
    max_amount?: number
    fee_fixed?: number
    fee_percent?: number
    [key: string]: unknown
  }
}

export interface Sep6Info {
  deposit?: Record<string, Sep6InfoAsset["deposit"]>
  withdraw?: Record<string, Sep6InfoAsset["withdraw"]>
  fee?: { enabled: boolean }
  authentication_required?: boolean
  [key: string]: unknown
}

export interface Sep6DepositResponse {
  how?: string
  instructions?: Record<string, { value: string; description?: string }>
  id?: string
  eta?: number
  min_amount?: number
  max_amount?: number
  fee_fixed?: number
  fee_percent?: number
  extra_info?: { message?: string }
}

export interface Sep6WithdrawResponse {
  account_id: string
  memo_type?: "text" | "id" | "hash"
  memo?: string
  id?: string
  eta?: number
  min_amount?: number
  max_amount?: number
  fee_fixed?: number
  fee_percent?: number
  extra_info?: { message?: string }
}

export interface Sep6Transaction {
  id: string
  kind: "deposit" | "withdrawal"
  status: string
  amount_in?: string
  amount_out?: string
  amount_fee?: string
  from?: string
  to?: string
  started_at?: string
  completed_at?: string
  [key: string]: unknown
}
