/**
 * Obtiene los balances XLM y USDC de una cuenta Stellar vía Horizon.
 * Usa la red configurada en NEXT_PUBLIC_STELLAR_NETWORK.
 */

function getHorizonBaseUrl(): string {
  const network =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_STELLAR_NETWORK) ||
    "testnet"
  if (network === "futurenet") return "https://horizon-futurenet.stellar.org"
  if (network === "mainnet" || network === "pubnet") return "https://horizon.stellar.org"
  return "https://horizon-testnet.stellar.org"
}

export interface AccountBalances {
  xlm: string
  usdc: string | null
}

/**
 * Devuelve el balance de XLM (nativo) y USDC si existe trustline.
 * En caso de error (cuenta no fundada, red, etc.) devuelve xlm "0" y usdc null.
 */
export async function getAccountBalances(address: string): Promise<AccountBalances> {
  const base = getHorizonBaseUrl()
  try {
    const res = await fetch(`${base}/accounts/${encodeURIComponent(address)}`)
    if (!res.ok) {
      if (res.status === 404) return { xlm: "0", usdc: null }
      return { xlm: "0", usdc: null }
    }
    const data = (await res.json()) as {
      balances?: Array<{
        balance: string
        asset_type: string
        asset_code?: string
        asset_issuer?: string
      }>
    }
    const balances = data.balances ?? []
    let xlm = "0"
    let usdc: string | null = null
    for (const b of balances) {
      if (b.asset_type === "native") {
        xlm = b.balance
        continue
      }
      if (
        b.asset_type === "credit_alphanum4" &&
        b.asset_code === "USDC"
      ) {
        usdc = b.balance
        break
      }
    }
    return { xlm, usdc }
  } catch {
    return { xlm: "0", usdc: null }
  }
}

/**
 * Formatea un balance para mostrar (máximo 2 decimales, sin ceros innecesarios).
 */
export function formatBalance(value: string): string {
  const n = parseFloat(value)
  if (Number.isNaN(n)) return "0"
  if (n >= 1_000_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  if (n > 0) return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 })
  return "0"
}
