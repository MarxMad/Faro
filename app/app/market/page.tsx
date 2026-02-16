"use client"

import { useMemo, useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, Shield, Clock, ArrowRight, Loader2, Building2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Invoice } from "@/lib/product"

function daysUntil(dueDate: string): number {
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((due - now) / (24 * 60 * 60 * 1000)))
}

/** Agrupa facturas por empresa (emisor). Cada empresa tiene sus facturas ordenadas por fecha (más reciente primero). */
function groupByCompany(invoices: Invoice[]): { companyName: string; invoices: Invoice[] }[] {
  const byEmitter = new Map<string, Invoice[]>()
  for (const inv of invoices) {
    const key = inv.emitterName.trim() || "Sin nombre"
    if (!byEmitter.has(key)) byEmitter.set(key, [])
    byEmitter.get(key)!.push(inv)
  }
  for (const list of byEmitter.values()) {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  return Array.from(byEmitter.entries())
    .map(([companyName, invoices]) => ({ companyName, invoices }))
    .sort((a, b) => (b.invoices[0]?.createdAt ?? "").localeCompare(a.invoices[0]?.createdAt ?? ""))
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

  const companies = useMemo(() => groupByCompany(invoices), [invoices])
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
          Oportunidades de inversión en facturas certificadas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/15">
            <TrendingUp className="h-5 w-5 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{avgRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Rendimiento promedio</p>
          </div>
        </div>
        <div className="glass-panel flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/15">
            <Shield className="h-5 w-5 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display">{invoices.length}</p>
            <p className="text-xs text-muted-foreground">Facturas en mercado</p>
          </div>
        </div>
        <div className="glass-panel flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/15">
            <Clock className="h-5 w-5 text-[hsl(var(--accent))]" />
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
          <p className="mt-1 text-sm">Sube una factura para verla aquí.</p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/app/tokenize">Subir factura</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* Empresas y sus últimas facturas */}
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-[hsl(var(--accent))]" />
              Empresas y últimas facturas
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {companies.map(({ companyName, invoices: companyInvoices }) => (
                <div
                  key={companyName}
                  className="glass-panel flex flex-col gap-3 p-5 transition-all hover:border-primary/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/15">
                      <Building2 className="h-4 w-4 text-[hsl(var(--accent))]" />
                    </div>
                    <p className="font-display font-semibold text-foreground">{companyName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {companyInvoices.length} factura{companyInvoices.length !== 1 ? "s" : ""} en mercado
                  </p>
                  <ul className="space-y-2 border-t border-border pt-3">
                    {companyInvoices.slice(0, 3).map((inv) => (
                      <li key={inv.id} className="flex items-center justify-between gap-2 text-sm">
                        <Link
                          href={`/app/market/${inv.id}`}
                          className="flex items-center gap-2 text-foreground hover:text-[hsl(var(--accent))] hover:underline min-w-0"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" />
                          <span className="truncate">{inv.id}</span>
                          <span className="shrink-0 text-muted-foreground">
                            ${inv.amount.toLocaleString("es-MX")} · <span className="text-emerald-400 font-medium">{inv.discountRatePercent}%</span>
                          </span>
                        </Link>
                        <Button size="sm" variant="ghost" className="shrink-0 h-7 px-2" asChild>
                          <Link href={`/app/market/${inv.id}`}>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                  {companyInvoices.length > 3 && (
                    <p className="text-xs text-muted-foreground pt-1">
                      +{companyInvoices.length - 3} más en lista general
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Lista general de facturas */}
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[hsl(var(--accent))]" />
              Todas las facturas
            </h2>
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
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {inv.emitterName} · {inv.id}
                      </p>
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
                      <p className="text-lg font-bold font-display text-emerald-400">
                        {inv.discountRatePercent}%
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tasa</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-display text-foreground">
                        {daysUntil(inv.dueDate)}d
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plazo</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Vence: {new Date(inv.dueDate).toLocaleDateString("es-MX")}
                    </span>
                    <Button size="sm" asChild className="gap-1.5 bg-[hsl(var(--accent))] text-accent-foreground hover:opacity-90">
                      <Link href={`/app/market/${inv.id}`}>
                        Invertir
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
