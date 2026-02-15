/**
 * Invoca mint(to, amount) en el contrato Faro Invoice Token (Soroban).
 * Solo se ejecuta si están configuradas las variables de entorno del backend.
 */

import {
  Address,
  Contract,
  Keypair,
  TransactionBuilder,
  XdrLargeInt,
  Networks,
} from "@stellar/stellar-sdk"
import { Api, Server } from "@stellar/stellar-sdk/rpc"

const DECIMALS = 6

function getConfig(): {
  rpcUrl: string
  networkPassphrase: string
  contractId: string
  adminSecretKey: string
} | null {
  const rpcUrl = process.env.SOROBAN_RPC_URL
  const networkPassphrase =
    process.env.SOROBAN_NETWORK_PASSPHRASE ?? Networks.TESTNET
  const contractId = process.env.FARO_INVOICE_TOKEN_CONTRACT_ID
  const adminSecretKey = process.env.FARO_TOKEN_ADMIN_SECRET_KEY

  if (!rpcUrl?.trim() || !contractId?.trim() || !adminSecretKey?.trim()) {
    return null
  }
  return { rpcUrl, networkPassphrase, contractId, adminSecretKey }
}

/**
 * Convierte el nominal de la factura a unidades mínimas (6 decimales).
 */
export function amountToSmallestUnits(amount: number): bigint {
  return BigInt(Math.round(amount * 10 ** DECIMALS))
}

/**
 * Invoca mint(providerAddress, amount) en el contrato.
 * @param providerAddress - Dirección Stellar (G...) del proveedor que recibe los tokens
 * @param amountNominal - Monto nominal de la factura (ej. 1000.50)
 * @returns Hash de la transacción si tuvo éxito
 */
export async function mintInvoiceToken(
  providerAddress: string,
  amountNominal: number
): Promise<{ hash: string }> {
  const config = getConfig()
  if (!config) {
    throw new Error(
      "Tokenización on-chain no configurada: faltan SOROBAN_RPC_URL, FARO_INVOICE_TOKEN_CONTRACT_ID o FARO_TOKEN_ADMIN_SECRET_KEY"
    )
  }

  const server = new Server(config.rpcUrl, { allowHttp: config.rpcUrl.startsWith("http://") })
  const keypair = Keypair.fromSecret(config.adminSecretKey)
  const adminPublicKey = keypair.publicKey()

  const account = await server.getAccount(adminPublicKey)
  const contract = new Contract(config.contractId)
  const amountSmall = amountToSmallestUnits(amountNominal)
  const amountScVal = new XdrLargeInt("i128", amountSmall).toScVal()
  const toScVal = Address.fromString(providerAddress).toScVal()

  const tx = new TransactionBuilder(account, {
    fee: "100",
  })
    .setNetworkPassphrase(config.networkPassphrase)
    .setTimeout(60)
    .addOperation(contract.call("mint", toScVal, amountScVal))
    .build()

  const prepared = await server.prepareTransaction(tx)
  prepared.sign(keypair)

  const result = await server.sendTransaction(prepared)
  if (result.errorResult) {
    throw new Error(
      `Soroban mint failed: ${result.status} ${String(result.errorResult)}`
    )
  }
  if (!result.hash) {
    throw new Error("Soroban sendTransaction did not return hash")
  }

  // Esperar a que la tx esté en el ledger; si falla on-chain no guardamos el hash
  const txResponse = await server.pollTransaction(result.hash, {
    attempts: 30,
    sleepStrategy: () => 2000,
  })
  if (txResponse.status === Api.GetTransactionStatus.FAILED) {
    throw new Error(
      "La transacción de tokenización falló en el ledger. Revisa el contrato, el admin y la red (testnet) en Stellar Expert."
    )
  }
  if (txResponse.status !== Api.GetTransactionStatus.SUCCESS) {
    throw new Error(
      `Tokenización no confirmada (status: ${txResponse.status}). Revisa la tx en Stellar Expert.`
    )
  }

  return { hash: result.hash }
}

/**
 * Indica si la tokenización on-chain está configurada (sin intentar mint).
 */
export function isOnChainTokenizationConfigured(): boolean {
  return getConfig() !== null
}
