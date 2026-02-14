/**
 * SEP-0004: Tx Status Endpoint
 * Consulta el estado de un pago después de enviarlo (receiver side).
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0004.md
 */

import type { TxStatusResponse } from "./types"

const getAuthServerUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_AUTH_SERVER_URL
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_AUTH_SERVER_URL no configurado. Debe coincidir con AUTH_SERVER del stellar.toml del receptor."
    )
  }
  return url.replace(/\/$/, "")
}

/**
 * Obtiene el estado de una transacción en el institución receptora.
 * @param txId - Stellar transaction ID
 * @param authServerUrl - Opcional; por defecto usa env NEXT_PUBLIC_AUTH_SERVER_URL
 * @param jwt - JWT de SEP-10 si el endpoint requiere autenticación
 */
export async function getTxStatus(
  txId: string,
  authServerUrl?: string,
  jwt?: string
): Promise<TxStatusResponse> {
  const base = authServerUrl || getAuthServerUrl()
  const url = `${base}/tx_status?id=${encodeURIComponent(txId)}`
  const headers: HeadersInit = { Accept: "application/json" }
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`

  const res = await fetch(url, { headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || `Tx status error: ${res.status}`)
  }
  return res.json() as Promise<TxStatusResponse>
}
