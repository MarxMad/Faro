/**
 * Tipo de factura para el MVP.
 * Alinea con invoice-flow (estados) y con la API.
 */

import type { InvoiceStatus } from "./invoice-flow"

export interface Invoice {
  id: string
  /** Wallet del proveedor que subió la factura */
  providerAddress: string
  /** Nombre o razón social del emisor (proveedor) */
  emitterName: string
  /** Nombre o razón social del deudor (negocio) */
  debtorName: string
  /** Dirección Stellar del deudor (negocio), para crear escrow en Trustless Work */
  debtorAddress?: string | null
  /** Monto nominal (número; para display se formatea) */
  amount: number
  /** Código de moneda, ej. "MXN" */
  currency: string
  /** Fecha de vencimiento ISO */
  dueDate: string
  /** Tasa de descuento ofrecida (ej. 8, 9, 10) */
  discountRatePercent: number
  status: InvoiceStatus
  /** Fecha de creación ISO */
  createdAt: string
  /** Cuando está financiada: wallet del inversionista */
  investorAddress?: string | null
  /** Cuando está financiada: id del escrow (Trustless Work) si aplica */
  escrowId?: string | null
  /** Hash de la tx Soroban que minteó tokens (tokenización on-chain), si aplica */
  tokenizeTxHash?: string | null
}

export type InvoiceCreateInput = Pick<
  Invoice,
  "providerAddress" | "emitterName" | "debtorName" | "debtorAddress" | "amount" | "currency" | "dueDate" | "discountRatePercent"
>
