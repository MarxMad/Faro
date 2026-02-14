"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  PlusCircle,
  Store,
  FileCheck,
  Loader2,
  Wallet,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStellarWalletKit } from "@/lib/wallet/stellar-wallet-kit-provider"
import type { Invoice } from "@/lib/product"
import { INVOICE_STATUS_LABELS } from "@/lib/product"

const quickActions = [
  { href: "/app/tokenize", icon: PlusCircle, label: "Tokenizar factura" },
  { href: "/app/market", icon: Store, label: "Explorar mercado" },
]

function getStatusClass(status: Invoice["status"]) {
  if (status === "financiada" || status === "pagada")
    return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
  if (status === "en_mercado")
    return "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/20"
  return ""
}

export default function DashboardPage() {
  const { address, isConnected } = useStellarWalletKit()
  const [providerInvoices, setProviderInvoices] = useState<Invoice[]>([])
  const [investorInvoices, setInvestorInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setProviderInvoices([])
      setInvestorInvoices([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      fetch(`/api/invoices?provider=${encodeURIComponent(address)}`).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`/api/invoices?investor=${encodeURIComponent(address)}`).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([provider, investor]: [Invoice[], Invoice[]]) => {
        if (!cancelled) {
          setProviderInvoices(Array.isArray(provider) ? provider : [])
          setInvestorInvoices(Array.isArray(investor) ? investor : [])
        }
      })
      .catch(() => {
        if (!cancelled) setError("Error al cargar actividad")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [address])

  const totalTokenized = providerInvoices.reduce((s, i) => s + i.amount, 0)
  const activeAsProvider = providerInvoices.filter(
    (i) => i.status === "en_mercado" || i.status === "financiada"
  ).length
  const avgReturn =
    investorInvoices.length > 0
      ? investorInvoices.reduce((s, i) => s + i.discountRatePercent, 0) /
        investorInvoices.length
      : null
  const pendingCollection = [
    ...providerInvoices.filter((i) => i.status === "financiada"),
    ...investorInvoices.filter((i) => i.status === "financiada"),
  ].length

  const allActivity = [
    ...providerInvoices.map((i) => ({ ...i, role: "provider" as const })),
    ...investorInvoices.map((i) => ({ ...i, role: "investor" as const })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 15)

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de tu actividad en Faro
          </p>
        </div>
        <div className="glass-panel flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <p className="font-medium text-foreground">Conecta tu wallet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Usa el botón «Entrar» en la barra superior para conectar tu wallet y ver tus facturas e inversiones.
          </p>
          <Button asChild className="gap-2 mt-2">
            <Link href="/">
              Ir a inicio
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de tu actividad en Faro
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              asChild
              variant="outline"
              size="sm"
              className="gap-2 border-primary/20 hover:bg-primary/5"
            >
              <Link href={action.href}>
                <action.icon className="h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando actividad...
        </div>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-panel p-5 transition-all hover:shadow-md border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total tokenizado</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">
                ${totalTokenized.toLocaleString("es-MX")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Como proveedor
              </p>
            </div>
            <div className="glass-panel p-5 transition-all hover:shadow-md border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Facturas activas</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))]">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-[hsl(var(--accent))]">
                {activeAsProvider}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                En mercado o financiadas
              </p>
            </div>
            <div className="glass-panel p-5 transition-all hover:shadow-md border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rendimiento promedio</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">
                {avgReturn != null ? `${avgReturn.toFixed(1)}%` : "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                En tus inversiones
              </p>
            </div>
            <div className="glass-panel p-5 transition-all hover:shadow-md border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pendientes de cobro</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">
                {pendingCollection}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Financiadas, a la espera del pago del negocio
              </p>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Actividad reciente
              </h2>
              <Button variant="ghost" size="sm" asChild className="gap-2 text-primary">
                <Link href="/app/market">
                  <FileCheck className="h-4 w-4" />
                  Ver mercado
                </Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              {allActivity.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  <p className="font-medium">Sin actividad aún</p>
                  <p className="mt-1 text-sm">
                    Tokeniza una factura o invierte en el mercado para verla aquí.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button asChild size="sm" className="gap-2">
                      <Link href="/app/tokenize">
                        <PlusCircle className="h-4 w-4" />
                        Tokenizar
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <Link href="/app/market">Explorar mercado</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Deudor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allActivity.map((row) => (
                      <tr
                        key={`${row.id}-${row.role}`}
                        className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-primary">
                          <Link href={`/app/market/${row.id}`} className="hover:underline">
                            {row.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {row.debtorName}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          ${row.amount.toLocaleString("es-MX")} {row.currency}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className={getStatusClass(row.status)}
                          >
                            {INVOICE_STATUS_LABELS[row.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {row.role === "provider" ? "Proveedor" : "Inversionista"}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(row.createdAt).toLocaleDateString("es-MX")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
