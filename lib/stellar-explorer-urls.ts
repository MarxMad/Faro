/**
 * URLs de exploradores Stellar según la red (testnet, futurenet, mainnet).
 * Usa NEXT_PUBLIC_STELLAR_NETWORK para que coincida con el backend.
 */

const network =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_STELLAR_NETWORK) ||
  "testnet"

function networkToSegment(net: string): string {
  const n = (net || "").toLowerCase()
  if (n === "futurenet") return "futurenet"
  if (n === "mainnet" || n === "pubnet") return "public"
  return "testnet"
}

const EXPLORER_SEGMENT = networkToSegment(network)

/**
 * Normaliza hash de transacción para el explorador (quita prefijo 0x si viene del RPC).
 */
function normalizeTxHash(h: string): string {
  const s = (h || "").trim()
  return s.startsWith("0x") || s.startsWith("0X") ? s.slice(2) : s
}

/**
 * URL de una transacción en Stellar Expert.
 * @param txHash - Hash de la transacción (hex, con o sin 0x)
 * @param networkOverride - Red donde se envió la tx (ej. "testnet" para tokenize/Soroban). Si no se pasa, se usa NEXT_PUBLIC_STELLAR_NETWORK.
 */
export function getStellarExpertTxUrl(
  txHash: string,
  networkOverride?: string
): string {
  const segment = networkOverride ? networkToSegment(networkOverride) : EXPLORER_SEGMENT
  const hash = normalizeTxHash(txHash)
  return `https://stellar.expert/explorer/${segment}/tx/${hash}`
}

/**
 * URL del contrato (escrow Soroban) en Stellar Expert (según red).
 * Útil para comprobar la integración con Trustless Work.
 */
export function getStellarExpertContractUrl(contractId: string): string {
  return `https://stellar.expert/explorer/${EXPLORER_SEGMENT}/contract/${contractId}`
}
