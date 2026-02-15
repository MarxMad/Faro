"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, Shield, Clock, ArrowRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Invoice } from "@/lib/product"

function daysUntil(dueDate: string): number {
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((due - now) / (24 * 60 * 60 * 1000)))
}

export default function MarketplacePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function fetchMarket() {
    fetch("/api/invoices?status=en_mercado", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar facturas")
        return res.json()
      })
      .then((data: Invoice[]) => setInvoices(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch("/api/invoices?status=en_mercado", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar facturas")
        return res.json()
      })
      .then((data: Invoice[]) => {
        if (!cancelled) setInvoices(Array.isArray(data) ? data : [])
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
  }, [])

  useEffect(() => {
    const onFocus = () => fetchMarket()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  const avgRate =
    invoices.length > 0
      ? invoices.reduce((s, i) => s + i.discountRatePercent, 0) / invoices.length
      : 0
  const avgDays =
    invoices.length > 0
      ? Math.round(
          invoices.reduce((s, i) => s + daysUntil(i.dueDate), 0) / invoices.length
        )
      : 0

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Mercado</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Oportunidades de inversión en facturas tokenizadas (RWA)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{avgRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Rendimiento promedio</p>
          </div>
        </div>
        <div className="glass-panel flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{invoices.length}</p>
            <p className="text-xs text-muted-foreground">Facturas en mercado</p>
          </div>
        </div>
        <div className="glass-panel flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{avgDays} días</p>
            <p className="text-xs text-muted-foreground">Plazo promedio</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando mercado...
        </div>
      ) : error ? (
        <p className="text-sm text-destructive py-4">{error}</p>
      ) : invoices.length === 0 ? (
        <div className="glass-panel p-12 text-center text-muted-foreground">
          <p className="font-medium">No hay facturas en mercado</p>
          <p className="mt-1 text-sm">Tokeniza una factura para verla aquí.</p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/app/tokenize">Tokenizar factura</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="glass-panel flex flex-col gap-4 p-5 transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-base font-semibold text-foreground">
                    {inv.debtorName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{inv.id}</p>
                </div>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {inv.currency}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold font-display text-foreground">
                    ${inv.amount.toLocaleString("es-MX")}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Monto</p>
                </div>
                <div>
                  <p className="text-lg font-bold font-display text-primary">
                    {inv.discountRatePercent}%
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tasa</p>
                </div>
                <div>
                  <p className="text-lg font-bold font-display text-primary">
                    {daysUntil(inv.dueDate)}d
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plazo</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  Vence: {new Date(inv.dueDate).toLocaleDateString("es-MX")}
                </span>
                <Button size="sm" asChild className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={`/app/market/${inv.id}`}>
                    Invertir
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
