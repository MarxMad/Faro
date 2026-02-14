/**
 * SEP-0006: Deposit and Withdrawal API
 * Cliente para interactuar con el TRANSFER_SERVER de un anchor.
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0006.md
 */

import type {
  Sep6Info,
  Sep6DepositResponse,
  Sep6WithdrawResponse,
  Sep6Transaction,
} from "./types"

const getTransferServerUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_TRANSFER_SERVER_URL
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_TRANSFER_SERVER_URL no configurado. Debe coincidir con TRANSFER_SERVER del stellar.toml."
    )
  }
  return url.replace(/\/$/, "")
}

function authHeaders(jwt?: string): HeadersInit {
  const headers: HeadersInit = { Accept: "application/json" }
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`
  return headers
}

/**
 * GET /info - Información de activos, depósitos, retiros y si se requiere auth.
 */
export async function getTransferInfo(
  transferServerUrl?: string,
  jwt?: string
): Promise<Sep6Info> {
  const base = transferServerUrl || getTransferServerUrl()
  const res = await fetch(`${base}/info`, { headers: authHeaders(jwt) })
  if (!res.ok) throw new Error(`Transfer info error: ${res.status}`)
  return res.json() as Promise<Sep6Info>
}

/**
 * GET /deposit - Inicia un depósito; devuelve instrucciones (cuenta, memo, etc.).
 */
export async function getDeposit(
  params: {
    asset_code: string
    account: string
    funding_method?: string
    memo_type?: "text" | "id" | "hash"
    memo?: string
    amount?: string
    lang?: string
    [key: string]: string | undefined
  },
  jwt?: string,
  transferServerUrl?: string
): Promise<Sep6DepositResponse> {
  const base = transferServerUrl || getTransferServerUrl()
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") search.set(k, v)
  })
  const res = await fetch(`${base}/deposit?${search}`, {
    headers: authHeaders(jwt),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Deposit error: ${res.status}`)
  }
  return res.json() as Promise<Sep6DepositResponse>
}

/**
 * GET /withdraw - Inicia un retiro; devuelve account_id, memo y montos.
 */
export async function getWithdraw(
  params: {
    asset_code: string
    dest?: string
    dest_extra?: string
    account?: string
    memo_type?: "text" | "id" | "hash"
    memo?: string
    amount?: string
    lang?: string
    [key: string]: string | undefined
  },
  jwt?: string,
  transferServerUrl?: string
): Promise<Sep6WithdrawResponse> {
  const base = transferServerUrl || getTransferServerUrl()
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") search.set(k, v)
  })
  const res = await fetch(`${base}/withdraw?${search}`, {
    headers: authHeaders(jwt),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Withdraw error: ${res.status}`)
  }
  return res.json() as Promise<Sep6WithdrawResponse>
}

/**
 * GET /transaction?id= - Una transacción por id.
 */
export async function getTransaction(
  id: string,
  jwt?: string,
  transferServerUrl?: string
): Promise<Sep6Transaction> {
  const base = transferServerUrl || getTransferServerUrl()
  const res = await fetch(`${base}/transaction?id=${encodeURIComponent(id)}`, {
    headers: authHeaders(jwt),
  })
  if (!res.ok) throw new Error(`Transaction error: ${res.status}`)
  return res.json() as Promise<Sep6Transaction>
}

/**
 * GET /transactions - Historial de transacciones (requiere auth).
 */
export async function getTransactions(
  params: { asset_code?: string; limit?: number } = {},
  jwt?: string,
  transferServerUrl?: string
): Promise<{ transactions: Sep6Transaction[] }> {
  const base = transferServerUrl || getTransferServerUrl()
  const search = new URLSearchParams()
  if (params.asset_code) search.set("asset_code", params.asset_code)
  if (params.limit != null) search.set("limit", String(params.limit))
  const qs = search.toString()
  const url = qs ? `${base}/transactions?${qs}` : `${base}/transactions`
  const res = await fetch(url, { headers: authHeaders(jwt) })
  if (!res.ok) throw new Error(`Transactions error: ${res.status}`)
  return res.json() as Promise<{ transactions: Sep6Transaction[] }>
}
