"use client"

import React from "react"
import {
  development,
  mainNet,
  TrustlessWorkConfig,
} from "@trustless-work/escrow"

/**
 * Provider del SDK de Trustless Work (React).
 * Necesario para usar hooks como useReleaseFunds, useSendTransaction, etc.
 * Escribir flujos requiere API key (NEXT_PUBLIC_API_KEY o NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY).
 * @see https://docs.trustlesswork.com/trustless-work/escrow-react-sdk/getting-started
 */
export function TrustlessWorkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const apiKey =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_KEY) ||
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY) ||
    ""
  const isTestnet =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === "testnet"
  const baseURL = isTestnet ? development : mainNet

  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  )
}
