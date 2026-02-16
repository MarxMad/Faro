"use client"

import Link from "next/link"
import { FileText, Users, DollarSign, ArrowRight } from "lucide-react"

/** Mapa de puntos (estilo Boundless): patron de dots que sugiere alcance global */
function DottedMap() {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 40%, hsl(var(--accent)) 1px, transparent 1px),
            radial-gradient(circle at 35% 35%, hsl(var(--accent)) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, hsl(var(--accent)) 1px, transparent 1px),
            radial-gradient(circle at 72% 45%, hsl(var(--accent)) 1px, transparent 1px),
            radial-gradient(circle at 85% 35%, hsl(var(--accent)) 1px, transparent 1px)
          `,
          backgroundSize: "12% 20%, 14% 18%, 16% 22%, 14% 20%, 12% 18%",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  )
}

const overlayCards = [
  {
    icon: FileText,
    title: "Facturas en mercado",
    value: "120+",
    subtitle: "Disponibles para financiar",
  },
  {
    icon: Users,
    title: "Inversionistas activos",
    value: "340+",
    subtitle: "Conectados a la red",
  },
  {
    icon: DollarSign,
    title: "Liquidez movilizada",
    value: "$2.4M",
    subtitle: "En facturas certificadas",
  },
]

export function MapSection() {
  return (
    <section className="relative py-24 bg-primary text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-10" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)" }} />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium uppercase tracking-widest text-[hsl(var(--accent))]">
            Alcance
          </span>
          <h2 className="mt-4 font-display text-balance text-3xl font-bold sm:text-4xl">
            Faro conecta negocios e inversionistas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-primary-foreground/80">
            Una red global sobre Stellar: proveedores, negocios e inversionistas en una sola plataforma.
          </p>
        </div>

        <div className="relative min-h-[420px] rounded-2xl border border-white/10 bg-primary/80 backdrop-blur-sm">
          <DottedMap />
          {/* Overlay cards sobre el mapa */}
          <div className="relative z-10 flex flex-wrap justify-center items-center gap-6 p-8 sm:p-12">
            {overlayCards.map((card, i) => (
              <div
                key={card.title}
                className="flex flex-col gap-3 rounded-xl border border-white/15 bg-black/40 px-6 py-5 backdrop-blur-md shadow-xl min-w-[200px]"
                style={{
                  transform: i === 1 ? "translateY(-8px)" : i === 2 ? "translateY(12px)" : undefined,
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]">
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold font-display">{card.value}</p>
                <p className="text-sm font-medium text-primary-foreground/90">{card.title}</p>
                <p className="text-xs text-primary-foreground/70">{card.subtitle}</p>
              </div>
            ))}
          </div>
          <div className="relative z-10 flex justify-center pb-8">
            <Link
              href="/app/market"
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-primary hover:opacity-90 transition-opacity"
            >
              Explorar mercado
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
