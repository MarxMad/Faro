"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, CreditCard, Wallet, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStellarWalletKit } from "@/lib/wallet/stellar-wallet-kit-provider"
import { toast } from "sonner"
import type { Invoice } from "@/lib/product"

export default function PayInvoicePage() {
  const params = useParams()
  const id = params.id as string
  const { address, isConnected } = useStellarWalletKit()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)

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

  async function handlePay() {
    if (!invoice || !address) return
    setPaying(true)
    try {
      const res = await fetch(`/api/invoices/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({})) as { error?: string }
      if (!res.ok) {
        throw new Error(data?.error || "Error al registrar el pago")
      }
      setPaySuccess(true)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al registrar el pago")
    } finally {
      setPaying(false)
    }
  }

  const isDebtor =
    invoice?.debtorAddress &&
    address &&
    invoice.debtorAddress.trim().toLowerCase() === address.trim().toLowerCase()
  const canPay = invoice?.status === "financiada" && isDebtor

  if (paySuccess && invoice) {
    return (
      <div className="mx-auto max-w-lg flex flex-col items-center gap-6 py-8">
        <div className="flex w-full flex-col items-center gap-6 rounded-2xl border-2 border-green-500/30 bg-gradient-to-b from-green-500/10 to-background p-8 text-center shadow-lg">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 ring-4 ring-green-500/20">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-2xl font-bold text-foreground">
              Pago confirmado
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              La factura <strong>{invoice.id}</strong> quedó registrada como pagada. El inversionista podrá reclamar el cobro del nominal cuando corresponda.
            </p>
          </div>
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
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Pagar factura</h1>
          <p className="text-sm text-muted-foreground">
            Soy el negocio (deudor). Conecta tu wallet para pagar el nominal.
          </p>
        </div>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Factura</span>
          <span className="font-medium">{invoice.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Emisor</span>
          <span className="font-medium">{invoice.emitterName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monto a pagar (referencia {invoice.currency})</span>
          <span className="font-semibold">
            ${invoice.amount.toLocaleString("es-MX")} {invoice.currency}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Liquidación en red</span>
          <span className="font-medium text-foreground">
            {invoice.amount.toLocaleString("es-MX")} USDC
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Vencimiento</span>
          <span>{new Date(invoice.dueDate).toLocaleDateString("es-MX")}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          El monto en {invoice.currency} es referencia. El pago en la red Stellar se realiza en <strong>USDC</strong>.
        </p>
      </div>

      {invoice.status !== "financiada" && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
          {invoice.status === "pagada" ? (
            <p>Esta factura ya fue pagada.</p>
          ) : invoice.status === "en_mercado" ? (
            <p>Esta factura aún no ha sido financiada por un inversionista. No hay pago pendiente.</p>
          ) : (
            <p>Estado actual: {invoice.status}. Solo se puede pagar una factura en estado «financiada».</p>
          )}
          <Button variant="outline" size="sm" asChild className="mt-3">
            <Link href="/app">Ir al dashboard</Link>
          </Button>
        </div>
      )}

      {invoice.status === "financiada" && (
        <>
          {!isConnected ? (
            <div className="rounded-lg border border-border bg-muted/30 p-5 text-center">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">Conecta tu wallet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Usa el botón «Entrar» en la barra superior para conectar la wallet del negocio (deudor). Solo esa wallet puede pagar esta factura.
              </p>
            </div>
          ) : !isDebtor ? (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-5 text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                Esta factura debe ser pagada por la wallet del negocio
              </p>
              <p className="mt-2 text-muted-foreground">
                Tu wallet actual no coincide con la dirección registrada como deudor. Conecta la wallet <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{invoice.debtorAddress?.slice(0, 10)}…{invoice.debtorAddress?.slice(-8)}</code> para poder pagar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={paying}
                onClick={handlePay}
              >
                {paying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Pagar nominal (USDC)
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Solo confirmas que realizaste el pago; la factura pasará a estado «pagada». El inversionista reclama el cobro por separado.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
