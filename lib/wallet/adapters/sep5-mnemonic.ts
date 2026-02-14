"use client"

import * as bip39 from "bip39"
import { derivePath } from "ed25519-hd-key"
import { Keypair } from "@stellar/stellar-base"
import { getSep5DerivationPath } from "../sep-0005"
import type { WalletAdapter } from "../types"

/**
 * Adaptador que deriva la clave pública desde una frase de recuperación BIP-39
 * según SEP-0005 (path m/44'/148'/x'). Solo se usa la clave pública para "conectar".
 */
export const sep5MnemonicAdapter: WalletAdapter = {
  name: "Frase de recuperación (SEP-0005)",
  type: "mnemonic",

  async isAvailable(): Promise<boolean> {
    return true
  },

  async connect(): Promise<{ publicKey: string }> {
    throw new Error("Usa connectWithMnemonic(mnemonic) para este adaptador")
  },

  async disconnect(): Promise<void> {},
}

/**
 * Deriva la clave pública Stellar desde una frase mnemónica según SEP-0005.
 * BIP-39 (mnemonic → seed) + SLIP-0010 (path m/44'/148'/x') + Stellar Keypair.
 * @param mnemonic - 12 o 24 palabras BIP-39
 * @param accountIndex - Índice de cuenta (0 = primaria)
 */
export function getPublicKeyFromMnemonic(
  mnemonic: string,
  accountIndex: number = 0
): string {
  const normalized = mnemonic.trim().toLowerCase()
  if (!bip39.validateMnemonic(normalized)) {
    throw new Error("Frase de recuperación inválida (BIP-39)")
  }
  const seedHex = bip39.mnemonicToSeedSync(normalized).toString("hex")
  const path = getSep5DerivationPath(accountIndex)
  const { key } = derivePath(path, seedHex)
  const keypair = Keypair.fromRawEd25519Seed(key)
  return keypair.publicKey()
}

/**
 * Genera una nueva frase mnemónica (24 palabras por defecto, SEP-0005 recomienda 256 bits).
 */
export function generateMnemonic(wordCount: 12 | 24 = 24): string {
  const strength = wordCount === 24 ? 256 : 128
  return bip39.generateMnemonic(strength)
}
