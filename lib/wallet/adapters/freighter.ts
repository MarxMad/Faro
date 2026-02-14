"use client"

import type { WalletAdapter } from "../types"

/** API de Freighter (extensión): requestAccess/getAddress o getPublicKey/connect según versión */
declare global {
  interface Window {
    freighterApi?: {
      isConnected: () => Promise<boolean>
      requestAccess?: () => Promise<{ address?: string; error?: string }>
      getAddress?: () => Promise<string>
      getPublicKey?: () => Promise<string>
      connect?: () => Promise<{ publicKey: string }>
      disconnect?: () => Promise<void>
    }
  }
}

export const freighterAdapter: WalletAdapter = {
  name: "Freighter",
  type: "freighter",

  async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined") return false
    const api = window.freighterApi
    if (!api) return false
    try {
      return await api.isConnected()
    } catch {
      return false
    }
  },

  async connect(): Promise<{ publicKey: string }> {
    if (typeof window === "undefined" || !window.freighterApi) {
      throw new Error("Freighter no está instalado. Añade la extensión desde freighter.app")
    }
    const api = window.freighterApi
    if (api.requestAccess) {
      const result = await api.requestAccess()
      if (result?.error) throw new Error(result.error)
      if (result?.address) return { publicKey: result.address }
    }
    if (api.connect) {
      const result = await api.connect()
      if (result?.publicKey) return { publicKey: result.publicKey }
    }
    if (api.getPublicKey) {
      const pk = await api.getPublicKey()
      if (pk) return { publicKey: pk }
    }
    throw new Error("No se pudo obtener la clave pública de Freighter")
  },

  async disconnect(): Promise<void> {
    if (typeof window !== "undefined" && window.freighterApi?.disconnect) {
      await window.freighterApi.disconnect()
    }
  },
}
