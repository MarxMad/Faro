/**
 * Constantes para integración Trustless Work on-chain (USDC, multi-release).
 * Ver docs Trustless Work y flujo: Initialize → Fund → Mark as done → Approve → Release.
 */

/** USDC en Stellar: 6 decimales (unidades mínimas = amount × 10^6). */
export const USDC_DECIMALS = 6
export const USDC_DIVISOR = 10 ** USDC_DECIMALS

/** Dirección de la trustline USDC (testnet/mainnet según red). Por defecto testnet. */
export const USDC_TRUSTLINE_ADDRESS =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_TRUSTLESS_WORK_USDC_TRUSTLINE_ADDRESS) ||
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"

export const USDC_SYMBOL = "USDC"

/** platformFee en porcentaje (ej. 4 = 4%). */
export const TRUSTLESS_WORK_PLATFORM_FEE = 4

/** Monto nominal a unidades mínimas USDC. */
export const nominalToUSDCSmallestUnits = (amount: number): number =>
  Math.round(amount * USDC_DIVISOR)

/** Dirección de la plataforma (Faro) para roles del escrow. Si no está definida, se usa el deudor como fallback. */
export const getPlatformAddress = (debtorAddress: string): string =>
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_TRUSTLESS_WORK_PLATFORM_ADDRESS) ||
  debtorAddress
