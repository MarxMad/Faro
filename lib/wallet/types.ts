import type { WalletConnectionType } from "./sep-0005"

export interface WalletState {
  publicKey: string | null
  isConnected: boolean
  connectionType: WalletConnectionType | null
  error: string | null
}

export interface WalletAdapter {
  name: string
  type: WalletConnectionType
  isAvailable(): Promise<boolean>
  connect(): Promise<{ publicKey: string }>
  disconnect(): Promise<void>
}
