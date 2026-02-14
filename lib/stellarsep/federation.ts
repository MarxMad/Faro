/**
 * SEP-0002: Federation protocol
 * Resuelve direcciones Stellar (name*domain.com) a account_id y viceversa.
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0002.md
 */

import type { FederationRecord, FederationQueryType } from "./types"

const getFederationServerUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_FEDERATION_SERVER_URL
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_FEDERATION_SERVER_URL no configurado. Añade la URL del servidor de federación en .env"
    )
  }
  return url.replace(/\/$/, "")
}

/**
 * Resuelve una dirección Stellar (ej: bob*stellar.org) a account_id y memo opcional.
 */
export async function resolveStellarAddress(
  stellarAddress: string,
  federationServerUrl?: string
): Promise<FederationRecord | null> {
  const base = federationServerUrl || getFederationServerUrl()
  const params = new URLSearchParams({ q: stellarAddress, type: "name" })
  const res = await fetch(`${base}/federation?${params}`, {
    headers: { Accept: "application/json" },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Federation error: ${res.status}`)
  }
  return res.json() as Promise<FederationRecord>
}

/**
 * Resuelve un account_id a la dirección Stellar asociada (reverse lookup).
 */
export async function resolveAccountId(
  accountId: string,
  federationServerUrl?: string
): Promise<FederationRecord | null> {
  const base = federationServerUrl || getFederationServerUrl()
  const params = new URLSearchParams({ q: accountId, type: "id" })
  const res = await fetch(`${base}/federation?${params}`, {
    headers: { Accept: "application/json" },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Federation error: ${res.status}`)
  }
  return res.json() as Promise<FederationRecord>
}

/**
 * Resuelve el sender de una transacción por txid (si el servidor lo soporta).
 */
export async function resolveTxId(
  txId: string,
  federationServerUrl?: string
): Promise<FederationRecord | null> {
  const base = federationServerUrl || getFederationServerUrl()
  const params = new URLSearchParams({ q: txId, type: "txid" })
  const res = await fetch(`${base}/federation?${params}`, {
    headers: { Accept: "application/json" },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Federation error: ${res.status}`)
  }
  return res.json() as Promise<FederationRecord>
}
