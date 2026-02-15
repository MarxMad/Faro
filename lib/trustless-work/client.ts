/**
 * Cliente para Trustless Work API
 * Escrow sin custodia con hitos y aprobaciones. USDC en Stellar Soroban.
 *
 * Configuración .env:
 * - NEXT_PUBLIC_TRUSTLESS_WORK_API_URL  (ej. https://api.trustlesswork.com)
 * - TRUSTLESS_WORK_API_KEY              (opcional; para server-side)
 */

import type { EscrowCreateParams, EscrowRecord, TrustlessWorkConfig } from "./types"

function getConfig(): TrustlessWorkConfig {
  const baseUrl =
    process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_URL ||
    "https://api.trustlesswork.com"
  const apiKey = process.env.TRUSTLESS_WORK_API_KEY
  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK === "testnet" ? "testnet" : "mainnet",
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  useApiKey = false
): Promise<T> {
  const { baseUrl, apiKey } = getConfig()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (useApiKey && apiKey) headers["Authorization"] = `Bearer ${apiKey}`

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { message?: string }).message || `Trustless Work API error: ${res.status}`
    )
  }
  return res.json() as Promise<T>
}

/**
 * Crea un escrow (normalmente desde el backend con API key).
 * En front solo si la API permite con restricciones.
 */
export async function createEscrow(
  params: EscrowCreateParams
): Promise<EscrowRecord> {
  return request<EscrowRecord>("/escrows", {
    method: "POST",
    body: JSON.stringify(params),
  }, true)
}

/**
 * Obtiene un escrow por id.
 */
export async function getEscrow(id: string): Promise<EscrowRecord> {
  return request<EscrowRecord>(`/escrows/${encodeURIComponent(id)}`)
}

/**
 * Lista escrows (sujeto a lo que exponga la API).
 */
export async function listEscrows(params?: {
  account?: string
  status?: string
}): Promise<{ escrows: EscrowRecord[] }> {
  const search = params ? new URLSearchParams(params as Record<string, string>) : ""
  const path = search ? `/escrows?${search}` : "/escrows"
  return request<{ escrows: EscrowRecord[] }>(path)
}

/**
 * Aprueba un milestone (cliente). Llamar desde backend con API key si es necesario.
 */
export async function approveMilestone(
  escrowId: string,
  milestoneId: string
): Promise<EscrowRecord> {
  return request<EscrowRecord>(
    `/escrows/${encodeURIComponent(escrowId)}/milestones/${encodeURIComponent(milestoneId)}/approve`,
    { method: "POST" },
    true
  )
}

/**
 * Libera fondos del escrow (single-release). La API puede devolver una transacción sin firmar
 * para firmar en wallet y enviar con /helper/send-transaction, o ejecutar server-side si lo soporta.
 * Usado desde el pay route cuando el front no envió releasedOnChain.
 */
export async function releaseEscrow(escrowId: string): Promise<{
  transaction_hash?: string
  tx_hash?: string
  last_transaction_id?: string
  [key: string]: unknown
}> {
  return request(
    `/escrow/single-release/release-funds`,
    {
      method: "POST",
      body: JSON.stringify({ contractId: escrowId }),
    },
    true
  )
}
