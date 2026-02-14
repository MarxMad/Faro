"use client"

import { Shield, Sparkles, TrendingUp } from "lucide-react"
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button"

const stats = [
  { value: "$2.4M", label: "Facturas tokenizadas" },
  { value: "340+", label: "PyMEs activas" },
  { value: "< 48h", label: "Tiempo de liquidez" },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-b from-background via-background to-primary/[0.06]">
      <div className="absolute inset-0 dot-grid opacity-30" />
      {/* Luz del faro: gradiente suave desde arriba */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--beacon-glow) / 0.15), transparent 70%)",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
            <span className="text-sm font-medium text-primary">
              Impulsado por Stellar · Confianza y tecnología
            </span>
          </div>

          <h1 className="font-display text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            El faro que alumbra{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-primary to-[hsl(var(--accent))] bg-clip-text text-transparent">
              y guía tu negocio
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Liquidez inmediata para tu PyME. Tokeniza facturas por cobrar con
            respaldo on-chain, sin bancos ni burocracia. Seriedad y transparencia.
          </p>

          {/* Tags flotantes tipo Boundless */}
          <div className="absolute right-[10%] top-[30%] hidden rounded-lg border border-primary/20 bg-card/90 px-3 py-2 shadow-lg backdrop-blur sm:block">
            <span className="text-xs font-semibold text-primary">Escrow seguro</span>
          </div>
          <div className="absolute left-[8%] top-[45%] hidden rounded-lg border border-[hsl(var(--accent))]/30 bg-card/90 px-3 py-2 shadow-lg backdrop-blur md:block">
            <span className="text-xs font-semibold text-[hsl(var(--accent))]">Liquidez 48h</span>
          </div>
          <div className="absolute right-[15%] bottom-[25%] hidden rounded-lg border border-primary/20 bg-card/90 px-3 py-2 shadow-lg backdrop-blur lg:block">
            <span className="text-xs font-semibold text-primary">8–10% descuento</span>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <ConnectWalletButton
              label="Comenzar"
              redirectOnConnect
              variant="primary"
            />
            <a href="#flujo" className="btn-secondary text-base">
              Ver flujo
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`glass-panel px-8 py-6 text-center ${i === 1 ? "border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/5" : "border-primary/15 bg-primary/[0.03]"}`}
              >
                <p className={`font-display text-3xl font-bold ${i === 1 ? "text-[hsl(var(--accent))]" : "text-foreground"}`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[hsl(var(--accent))]" />
              <span className="text-sm font-medium">Respaldo on-chain</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--accent))]" />
              <span className="text-sm font-medium">Rendimientos claros</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
