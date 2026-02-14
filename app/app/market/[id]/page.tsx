"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useStellarWalletKit } from "@/lib/wallet/stellar-wallet-kit-provider"
import type { Invoice } from "@/lib/product"

function amountToInvest(amount: number, discountPercent: number): number {
  return Math.round(amount * (1 - discountPercent / 100))
}

export default function MarketInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { address, isConnected } = useStellarWalletKit()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [investing, setInvesting] = useState(false)
  const [investError, setInvestError] = useState<string | null>(null)

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

  async function handleInvest() {
    if (!invoice || !address) return
    setInvestError(null)
    setInvesting(true)
    try {
      const res = await fetch(`/api/invoices/${id}/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investorAddress: address }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Error al invertir")
      }
      setConfirmOpen(false)
      router.push("/app")
    } catch (e) {
      setInvestError(e instanceof Error ? e.message : "Error al invertir")
    } finally {
      setInvesting(false)
    }
  }

  function openConfirm() {
    if (!isConnected || !address) {
      setInvestError("Conecta tu wallet para invertir.")
      return
    }
    setInvestError(null)
    setConfirmOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 w-fit">
          <Link href="/app/market">
            <ArrowLeft className="h-4 w-4" />
            Volver al mercado
          </Link>
        </Button>
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando...
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 w-fit">
          <Link href="/app/market">
            <ArrowLeft className="h-4 w-4" />
            Volver al mercado
          </Link>
        </Button>
        <p className="text-destructive">{error ?? "Factura no encontrada"}</p>
      </div>
    )
  }

  const isAvailable = invoice.status === "en_mercado"
  const toPay = amountToInvest(invoice.amount, invoice.discountRatePercent)

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 w-fit">
        <Link href="/app/market">
          <ArrowLeft className="h-4 w-4" />
          Volver al mercado
        </Link>
      </Button>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">{invoice.id}</h1>
            <p className="text-sm text-muted-foreground">{invoice.debtorName}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Emisor</dt>
            <dd className="mt-1 font-medium">{invoice.emitterName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Deudor</dt>
            <dd className="mt-1 font-medium">{invoice.debtorName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Monto nominal</dt>
            <dd className="mt-1 font-display text-lg font-bold">
              ${invoice.amount.toLocaleString("es-MX")} {invoice.currency}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Tasa de descuento</dt>
            <dd className="mt-1 font-display text-lg font-bold text-primary">
              {invoice.discountRatePercent}%
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Vencimiento</dt>
            <dd className="mt-1 font-medium">
              {new Date(invoice.dueDate).toLocaleDateString("es-MX")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Estado</dt>
            <dd className="mt-1 font-medium">{invoice.status}</dd>
          </div>
        </dl>

        {isAvailable && (
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-foreground">Si inviertes ahora</p>
            <p className="mt-1 text-2xl font-display font-bold text-primary">
              ${toPay.toLocaleString("es-MX")} {invoice.currency}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              (valor nominal menos {invoice.discountRatePercent}% descuento). Al vencimiento recibes el nominal; tu ganancia es el descuento.
            </p>
          </div>
        )}

        {investError && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {investError}
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
          {isAvailable ? (
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={openConfirm}
            >
              Invertir en esta factura
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta factura ya no está disponible para inversión ({invoice.status}).
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar inversión</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a invertir{" "}
              <strong>
                ${toPay.toLocaleString("es-MX")} {invoice.currency}
              </strong>{" "}
              en la factura {invoice.id} (descuento {invoice.discountRatePercent}%). El proveedor recibirá esa liquidez. Al vencimiento, el negocio paga el nominal y tú recibes{" "}
              <strong>${invoice.amount.toLocaleString("es-MX")} {invoice.currency}</strong>; tu ganancia es el descuento. ¿Continuar?
            </AlertDialogDescription>
            {investError && (
              <p className="text-destructive text-sm font-medium" role="alert">
                {investError}
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={investing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleInvest()
              }}
              disabled={investing}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {investing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar inversión"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
