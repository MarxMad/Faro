/**
 * SEP-0005: Key Derivation Methods for Stellar Keys
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md
 *
 * - BIP-0039: mnemonic (12/24 words)
 * - BIP-0044 style: m/44'/148'/x' (coin_type 148 = Stellar, SLIP-0044)
 * - SLIP-0010: Ed25519 key derivation
 * - Primary key: m/44'/148'/0'
 */

/** Path de derivación Stellar según SEP-0005. Índice x = 0 es la clave primaria. */
export const SEP5_DERIVATION_PATH_PREFIX = "m/44'/148'/"

/**
 * Obtiene la ruta de derivación para el índice de cuenta.
 * Ej: getDerivationPath(0) => "m/44'/148'/0'"
 */
export function getSep5DerivationPath(accountIndex: number): string {
  return `${SEP5_DERIVATION_PATH_PREFIX}${accountIndex}'`
}

/** Índice de la clave primaria (cuenta principal). */
export const SEP5_PRIMARY_ACCOUNT_INDEX = 0

/** Tipo de conexión: extensión (Freighter) o frase de recuperación (SEP-0005). */
export type WalletConnectionType = "freighter" | "mnemonic"
