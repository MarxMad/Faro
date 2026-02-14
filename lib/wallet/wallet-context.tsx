"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { freighterAdapter } from "./adapters/freighter"
import { getPublicKeyFromMnemonic } from "./adapters/sep5-mnemonic"
import type { WalletConnectionType } from "./sep-0005"
import type { WalletState } from "./types"

interface WalletContextValue extends WalletState {
  connectFreighter: () => Promise<void>
  connectWithMnemonic: (mnemonic: string) => Promise<void>
  disconnect: () => void
  clearError: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

const STORAGE_KEY = "faro_wallet_public_key"
const STORAGE_TYPE_KEY = "faro_wallet_connection_type"

function loadStoredWallet(): Partial<WalletState> {
  if (typeof window === "undefined") return {}
  try {
    const pk = localStorage.getItem(STORAGE_KEY)
    const type = localStorage.getItem(STORAGE_TYPE_KEY) as WalletConnectionType | null
    if (pk && type) return { publicKey: pk, isConnected: true, connectionType: type }
  } catch {}
  return {}
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(() => ({
    publicKey: null,
    isConnected: false,
    connectionType: null,
    error: null,
    ...loadStoredWallet(),
  }))

  const clearError = useCallback(() => {
    setState((s) => (s.error ? { ...s, error: null } : s))
  }, [])

  const disconnect = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_TYPE_KEY)
    }
    setState({
      publicKey: null,
      isConnected: false,
      connectionType: null,
      error: null,
    })
  }, [])

  const connectFreighter = useCallback(async () => {
    setState((s) => ({ ...s, error: null }))
    try {
      const available = await freighterAdapter.isAvailable()
      if (!available) {
        setState((s) => ({
          ...s,
          error: "Freighter no detectado. Instala la extensión desde freighter.app",
        }))
        return
      }
      const { publicKey } = await freighterAdapter.connect()
      setState({
        publicKey,
        isConnected: true,
        connectionType: "freighter",
        error: null,
      })
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, publicKey)
        localStorage.setItem(STORAGE_TYPE_KEY, "freighter")
      }
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : "Error al conectar Freighter",
      }))
    }
  }, [])

  const connectWithMnemonic = useCallback(async (mnemonic: string) => {
    setState((s) => ({ ...s, error: null }))
    try {
      const publicKey = getPublicKeyFromMnemonic(mnemonic, 0)
      setState({
        publicKey,
        isConnected: true,
        connectionType: "mnemonic",
        error: null,
      })
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, publicKey)
        localStorage.setItem(STORAGE_TYPE_KEY, "mnemonic")
      }
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : "Frase de recuperación inválida (SEP-0005)",
      }))
    }
  }, [])

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      connectFreighter,
      connectWithMnemonic,
      disconnect,
      clearError,
    }),
    [state, connectFreighter, connectWithMnemonic, disconnect, clearError]
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error("useWallet debe usarse dentro de WalletProvider")
  }
  return ctx
}
