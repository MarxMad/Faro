"use client"

import { Toaster } from "@/components/ui/sonner"
import { StellarWalletKitProvider } from "@/lib/wallet/stellar-wallet-kit-provider"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <StellarWalletKitProvider>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </StellarWalletKitProvider>
  )
}
