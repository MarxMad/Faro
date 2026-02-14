"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  type ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit"

const STORAGE_KEY = "faro_wallet_public_key"

type OnConnected = () => void

interface StellarWalletKitContextValue {
  /** Clave pública conectada o null */
  address: string | null
  /** Si hay una wallet conectada (persistida o recién conectada) */
  isConnected: boolean
  /** Abre el modal del Wallet Kit para elegir wallet (Freighter, xBull, etc.) */
  openConnectModal: (options?: { onConnected?: OnConnected }) => void
  /** Desconecta y limpia estado */
  disconnect: () => void
  /** Error reciente (ej. wallet no instalada) */
  error: string | null
  clearError: () => void
  /** Red configurada en la app (Futurenet, Testnet, Mainnet) */
  networkLabel: "Futurenet" | "Testnet" | "Mainnet"
  /** Si la app está configurada para Futurenet (tokenización on-chain) */
  isFuturenet: boolean
  /** Obtiene la red actual de la wallet conectada (para validar que coincida con Futurenet) */
  getWalletNetwork: () => Promise<{ network: string; networkPassphrase: string } | null>
}

const Context = createContext<StellarWalletKitContextValue | null>(null)

function getNetwork(): WalletNetwork {
  if (typeof window === "undefined") return WalletNetwork.TESTNET
  const env = process.env.NEXT_PUBLIC_STELLAR_NETWORK
  if (env === "mainnet" || env === "pubnet") return WalletNetwork.PUBLIC
  if (env === "futurenet") return WalletNetwork.FUTURENET
  return WalletNetwork.TESTNET
}

export const FUTURENET_PASSPHRASE = WalletNetwork.FUTURENET

export function getNetworkLabel(): "Futurenet" | "Testnet" | "Mainnet" {
  if (typeof window === "undefined") return "Testnet"
  const env = process.env.NEXT_PUBLIC_STELLAR_NETWORK
  if (env === "futurenet") return "Futurenet"
  if (env === "mainnet" || env === "pubnet") return "Mainnet"
  return "Testnet"
}

export function StellarWalletKitProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const kitRef = useRef<StellarWalletsKit | null>(null)

  const getKit = useCallback(() => {
    if (kitRef.current) return kitRef.current
    if (typeof window === "undefined") return null
    const kit = new StellarWalletsKit({
      network: getNetwork(),
      modules: allowAllModules(),
    })
    kitRef.current = kit
    return kit
  }, [])

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (stored) setAddress(stored)
    } catch {}
  }, [])

  const openConnectModal = useCallback(
    (options?: { onConnected?: OnConnected }) => {
      setError(null)
      const kit = getKit()
      if (!kit) return
      kit
        .openModal({
          modalTitle: "Conectar wallet",
          notAvailableText: "No disponible. Instala una extensión como Freighter.",
          onWalletSelected: async (option: ISupportedWallet) => {
            try {
              kit.setWallet(option.id)
              const { address: addr } = await kit.getAddress()
              setAddress(addr)
              if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, addr)
              }
              options?.onConnected?.()
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error al obtener la dirección")
            }
          },
          onClosed: (err) => {
            if (err) setError(err.message)
          },
        })
        .catch((e) => {
          setError(e instanceof Error ? e.message : "Error al abrir el modal")
        })
    },
    [getKit]
  )

  const disconnect = useCallback(() => {
    const kit = kitRef.current
    if (kit) {
      kit.disconnect().catch(() => {})
    }
    kitRef.current = null
    setAddress(null)
    setError(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const networkLabel = getNetworkLabel()
  const isFuturenet = networkLabel === "Futurenet"

  const getWalletNetwork = useCallback(async () => {
    const kit = getKit()
    if (!kit || !address) return null
    try {
      return await kit.getNetwork()
    } catch {
      return null
    }
  }, [address, getKit])

  const value = useMemo<StellarWalletKitContextValue>(
    () => ({
      address,
      isConnected: !!address,
      openConnectModal,
      disconnect,
      error,
      clearError,
      networkLabel,
      isFuturenet,
      getWalletNetwork,
    }),
    [address, openConnectModal, disconnect, error, clearError, networkLabel, isFuturenet, getWalletNetwork]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useStellarWalletKit(): StellarWalletKitContextValue {
  const ctx = useContext(Context)
  if (!ctx) {
    throw new Error("useStellarWalletKit debe usarse dentro de StellarWalletKitProvider")
  }
  return ctx
}
