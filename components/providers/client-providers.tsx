"use client"

import { Toaster } from "@/components/ui/sonner"
import { StellarWalletKitProvider } from "@/lib/wallet/stellar-wallet-kit-provider"
import { TrustlessWorkProvider } from "@/components/providers/trustless-work-provider"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <StellarWalletKitProvider>
      <TrustlessWorkProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </TrustlessWorkProvider>
    </StellarWalletKitProvider>
  )
}
