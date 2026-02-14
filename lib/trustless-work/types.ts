/**
 * Trustless Work - Escrow-as-a-Service (EaaS)
 * Contratos en Stellar Soroban, USDC. Milestones, aprobaciones, disputas.
 * https://github.com/Trustless-Work/Trustless-Work-Smart-Escrow
 * API: https://docs.trustlesswork.com/trustless-work
 */

export interface EscrowCreateParams {
  /** Monto en unidades mínimas (ej. centavos USDC) */
  amount: string
  /** Cuenta Stellar del cliente (quien paga) */
  client_account: string
  /** Cuenta Stellar del proveedor (quien recibe) */
  provider_account: string
  /** Moneda/asset (ej. USDC) */
  asset?: string
  /** Descripción o referencia del acuerdo */
  description?: string
  /** Milestones opcionales */
  milestones?: { amount: string; description?: string }[]
}

export interface EscrowRecord {
  id: string
  contract_id?: string
  status: "pending" | "active" | "released" | "disputed" | "cancelled"
  amount: string
  client_account: string
  provider_account: string
  milestones?: Milestone[]
  created_at?: string
  [key: string]: unknown
}

export interface Milestone {
  id: string
  amount: string
  status: "pending" | "approved" | "released"
  description?: string
}

export interface TrustlessWorkConfig {
  baseUrl: string
  apiKey?: string
  network?: "testnet" | "mainnet"
}
