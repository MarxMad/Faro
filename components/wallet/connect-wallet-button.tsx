"use client"

import { useRouter } from "next/navigation"
import { Wallet, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStellarWalletKit } from "@/lib/wallet/stellar-wallet-kit-provider"

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
