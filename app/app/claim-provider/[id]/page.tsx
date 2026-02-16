"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Wallet, CheckCircle2, ExternalLink, Banknote } from "lucide-react"
import {
  useChangeMilestoneStatus,
  useApproveMilestone,
  useReleaseFunds,
  useSendTransaction,
} from "@trustless-work/escrow"
import { Button } from "@/components/ui/button"
import { useStellarWalletKit } from "@/lib/wallet/stellar-wallet-kit-provider"
import { getStellarExpertTxUrl } from "@/lib/stellar-explorer-urls"
import { toast } from "sonner"
import type { Invoice } from "@/lib/product"

const ESCROW_TYPE = "single-release" as const
const MILESTONE_INDEX = "0"

function amountToInvest(amount: number, discountPercent: number): number {
  return Math.round(amount * (1 - discountPercent / 100))
}

export default function ClaimProviderPage() {
  const params = useParams()
  const id = params.id as string
  const { address, isConnected, signTransaction } = useStellarWalletKit()
  const { changeMilestoneStatus } = useChangeMilestoneStatus()
  const { approveMilestone } = useApproveMilestone()
  const { releaseFunds } = useReleaseFunds()
  const { sendTransaction } = useSendTransaction()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/invoices/${id}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Factura no encontrada")
        if (!res.ok) throw new Error("Error al cargar")
        return res.json()
      })
      .then((data: Invoice) => {
        if (!cancelled) setInvoice(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleClaim() {
    if (!invoice || !address) return
    const contractId = invoice.escrowId?.trim()
    if (!contractId) {
      toast.error("Esta factura no tiene escrow de inversión")
      return
    }
    setClaiming(true)
    let lastTxHash: string | undefined
    try {
      const signAndSend = async (unsignedXdr: string): Promise<void> => {
        const { signedTxXdr } = await signTransaction(unsignedXdr)
        const res = await sendTransaction(signedTxXdr) as {
          status?: string
          message?: string
          transactionHash?: string
        }
        if (res?.status === "FAILED") {
          throw new Error(res?.message || "Transacción fallida")
        }
        if (typeof res?.transactionHash === "string") {
          lastTxHash = res.transactionHash
        }
      }

      const changeRes = await changeMilestoneStatus(
        {
          contractId,
          milestoneIndex: MILESTONE_INDEX,
          newStatus: "completed",
          serviceProvider: address,
        },
        ESCROW_TYPE
      )
      if (changeRes.status === "FAILED" || !changeRes.unsignedTransaction) {
        throw new Error("No se pudo marcar el hito como completado")
      }
      await signAndSend(changeRes.unsignedTransaction)

      const approveRes = await approveMilestone(
        { contractId, milestoneIndex: MILESTONE_INDEX, approver: address },
        ESCROW_TYPE
      )
      if (approveRes.status === "FAILED" || !approveRes.unsignedTransaction) {
        throw new Error("No se pudo aprobar el hito")
      }
      await signAndSend(approveRes.unsignedTransaction)

      const releaseRes = await releaseFunds(
        { contractId, releaseSigner: address },
        ESCROW_TYPE
      )
      if (releaseRes.status === "FAILED" || !releaseRes.unsignedTransaction) {
        throw new Error("No se pudieron liberar los fondos del escrow")
      }
      await signAndSend(releaseRes.unsignedTransaction)

      const res = await fetch(`/api/invoices/${id}/claim-by-provider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data?.error || "Error al registrar el cobro")
      }
      setClaimTxHash(lastTxHash ?? null)
      setClaimSuccess(true)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cobrar")
    } finally {
      setClaiming(false)
    }
  }

  const isProvider =
    invoice?.providerAddress &&
    address &&
    invoice.providerAddress.trim().toLowerCase() === address.trim().toLowerCase()
  const canClaim =
    invoice?.status === "financiada" &&
    isProvider &&
    Boolean(invoice.escrowId?.trim()) &&
    !invoice.providerClaimedAt

  if (claimSuccess && invoice) {
    return (
      <div className="mx-auto max-w-lg flex flex-col items-center gap-6 py-8">
        <div className="flex w-full flex-col items-center gap-6 rounded-2xl border-2 border-green-500/30 bg-gradient-to-b from-green-500/10 to-background p-8 text-center shadow-lg">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 ring-4 ring-green-500/20">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-2xl font-bold text-foreground">
              Cobro realizado
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              La liquidez de la factura <strong>{invoice.id}</strong> se liberó a tu wallet en <strong>USDC</strong>.
            </p>
          </div>
          {claimTxHash && (
            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm text-muted-foreground">Comprobante:</p>
              <div className="w-full rounded-lg bg-secondary/80 p-3 font-mono text-xs break-all text-foreground">
                {claimTxHash}
              </div>
              <Button size="sm" className="gap-2" asChild>
                <a
                  href={getStellarExpertTxUrl(claimTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en Stellar Expert
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          )}
          <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/app">Ir al dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 w-fit">
          <Link href="/app">
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </Button>
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando factura...
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 w-fit">
          <Link href="/app">
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </Button>
        <p className="text-destructive">{error ?? "Factura no encontrada"}</p>
      </div>
    )
  }

  const toReceive = amountToInvest(invoice.amount, invoice.discountRatePercent)

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 w-fit">
        <Link href="/app">
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Banknote className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Cobrar factura</h1>
          <p className="text-sm text-muted-foreground">
            Soy el proveedor. Conecta tu wallet para recibir la liquidez (monto a invertir) en USDC.
          </p>
        </div>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Factura</span>
          <span className="font-medium">{invoice.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Deudor</span>
          <span className="font-medium">{invoice.debtorName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monto a recibir (USDC)</span>
          <span className="font-semibold">
            ${toReceive.toLocaleString("es-MX")} USDC
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estado</span>
          <span className="font-medium">{invoice.status}</span>
        </div>
      </div>

      {invoice.status !== "financiada" && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
          {invoice.status === "en_mercado" ? (
            <p>Esta factura aún no ha sido financiada. Solo puedes cobrar cuando un inversionista la haya financiado.</p>
          ) : invoice.status === "pagada" ? (
            <p>Esta factura ya está pagada. Si no cobraste antes, el escrow podría estar liberado; revisa tu wallet.</p>
          ) : (
            <p>Solo se puede cobrar una factura en estado «financiada».</p>
          )}
          <Button variant="outline" size="sm" asChild className="mt-3">
            <Link href="/app">Ir al dashboard</Link>
          </Button>
        </div>
      )}

      {invoice.providerClaimedAt && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm">
          <p>Ya registraste el cobro de esta factura anteriormente.</p>
          <Button variant="outline" size="sm" asChild className="mt-3">
            <Link href="/app">Ir al dashboard</Link>
          </Button>
        </div>
      )}

      {invoice.status === "financiada" && !invoice.providerClaimedAt && (
        <>
          {!isConnected ? (
            <div className="rounded-lg border border-border bg-muted/30 p-5 text-center">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">Conecta tu wallet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Usa el botón «Entrar» para conectar la wallet del proveedor. Solo esa wallet puede cobrar esta factura.
              </p>
            </div>
          ) : !isProvider ? (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-5 text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Esta factura debe ser cobrada por la wallet del proveedor
              </p>
              <p className="mt-2 text-muted-foreground">
                Tu wallet actual no coincide con la dirección del proveedor. Conecta la wallet con la que subiste esta factura.
              </p>
            </div>
          ) : !invoice.escrowId ? (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
              <p>Esta factura no tiene escrow de inversión registrado. No se puede cobrar desde aquí.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={claiming}
                onClick={handleClaim}
              >
                {claiming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Cobrar factura (recibir USDC)
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Se liberará el escrow de inversión y recibirás el monto en tu wallet.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
