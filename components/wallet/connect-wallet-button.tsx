"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStellarWalletKit } from "@/lib/wallet/stellar-wallet-kit-provider"
import {
  getAccountBalances,
  formatBalance,
  type AccountBalances,
} from "@/lib/wallet/get-account-balances"

function shortenAddress(addr: string, chars = 6): string {
  if (addr.length <= chars * 2) return addr
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`
}

interface ConnectWalletButtonProps {
  /** Texto del botón cuando no está conectado (ej. "Entrar", "Comenzar") */
  label?: string
  /** Si es true, al conectar redirige a /app */
  redirectOnConnect?: boolean
  /** Estilo: "primary" (accent) o "outline" para navbar */
  variant?: "primary" | "outline"
}

export function ConnectWalletButton({
  label = "Entrar",
  redirectOnConnect = false,
  variant = "primary",
}: ConnectWalletButtonProps) {
  const router = useRouter()
  const {
    address,
    isConnected,
    error,
    openConnectModal,
    disconnect,
    clearError,
  } = useStellarWalletKit()

  const [balances, setBalances] = useState<AccountBalances | null>(null)
  const [balancesLoading, setBalancesLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setBalances(null)
      return
    }
    let cancelled = false
    setBalancesLoading(true)
    getAccountBalances(address)
      .then((b) => {
        if (!cancelled) setBalances(b)
      })
      .catch(() => {
        if (!cancelled) setBalances({ xlm: "0", usdc: null })
      })
      .finally(() => {
        if (!cancelled) setBalancesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [address])

  function handleOpenModal() {
    clearError()
    openConnectModal({
      onConnected: redirectOnConnect ? () => router.push("/app") : undefined,
    })
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 border-primary/20 hover:bg-primary/5"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{shortenAddress(address)}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            Wallet conectada
          </DropdownMenuItem>
          {balancesLoading ? (
            <DropdownMenuItem disabled className="gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Cargando balances...
            </DropdownMenuItem>
          ) : balances ? (
            <>
              <DropdownMenuItem disabled className="text-xs font-medium text-foreground">
                XLM {formatBalance(balances.xlm)}
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-xs font-medium text-foreground">
                USDC {balances.usdc != null ? formatBalance(balances.usdc) : "—"}
              </DropdownMenuItem>
            </>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={disconnect}
            className="text-destructive focus:text-destructive"
          >
            Desconectar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const buttonClass =
    variant === "primary"
      ? "gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      : "gap-2 border border-primary/30 bg-transparent hover:bg-primary/5 text-foreground"

  return (
    <>
      <Button className={buttonClass} onClick={handleOpenModal}>
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
