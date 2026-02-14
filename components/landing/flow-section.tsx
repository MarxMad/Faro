"use client"

import Link from "next/link"
import { Upload, CheckCircle2, Store, Wallet, Lock, Building2, ArrowDownRight } from "lucide-react"

const steps = [
  {
    icon: Upload,
    label: "Proveedor sube factura",
    detail: "Ligada al negocio deudor",
  },
  {
    icon: CheckCircle2,
    label: "Faro valida y publica",
    detail: "En el mercado",
  },
  {
    icon: Store,
    label: "Inversionista paga con descuento",
    detail: "8, 9 o 10%",
  },
  {
    icon: Wallet,
    label: "Proveedor recibe liquidez",
    detail: "Inmediata (pago del inversionista)",
  },
  {
    icon: Building2,
    label: "Al vencimiento: negocio paga 100%",
    detail: "A la plataforma",
  },
  {
    icon: Lock,
    label: "Escrow libera al inversionista",
    detail: "Ganancia = descuento",
  },
]

export function FlowSection() {
  return (
    <section id="flujo" className="relative py-24 overflow-hidden bg-gradient-to-b from-background to-primary/[0.04]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-primary">
            Flujo
          </span>
          <h2 className="mt-4 font-display text-balance text-3xl font-bold sm:text-4xl text-foreground">
            Entiende el flujo en un vistazo
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            El pago del inversionista va directo al proveedor (liquidez inmediata). Al vencimiento, el negocio paga el 100% y el escrow lo entrega al inversionista.
          </p>
        </div>

        {/* Flujo visual: pasos conectados */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-6">
          {steps.map((step, i) => {
            const useAccent = i === 2 || i === 3
            return (
            <div key={step.label} className="flex items-center">
              <div className={`glass-panel flex flex-col items-center gap-2 p-4 min-w-[140px] sm:min-w-[160px] transition-all hover:shadow-md group ${useAccent ? "hover:border-[hsl(var(--accent))]/30 border-[hsl(var(--accent))]/15 bg-[hsl(var(--accent))]/5" : "hover:border-primary/40"}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${useAccent ? "bg-[hsl(var(--accent))]/15 text-[hsl(var(--accent))] group-hover:bg-[hsl(var(--accent))]/25" : "bg-primary/10 text-primary group-hover:bg-primary/20"}`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-center text-sm font-semibold text-foreground">
                  {step.label}
                </span>
                <span className="text-center text-xs text-muted-foreground">
                  {step.detail}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden flex-shrink-0 items-center text-muted-foreground/50 sm:flex">
                  <ArrowDownRight className="h-5 w-5 rotate-[-45deg]" />
                </div>
              )}
            </div>
          );
          })}
        </div>

        {/* Conector vertical en móvil */}
        <div className="mt-8 flex flex-col items-center gap-2 sm:hidden">
          {steps.map((_, i) =>
            i < steps.length - 1 ? (
              <div
                key={i}
                className="h-4 w-px bg-gradient-to-b from-primary/40 to-primary/10"
              />
            ) : null
          )}
        </div>

        {/* Aclaración: dos momentos del dinero */}
        <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-left max-w-2xl mx-auto border-l-4 border-l-[hsl(var(--accent))]">
          <p className="text-sm font-semibold text-primary mb-2">¿De dónde sale la liquidez al proveedor?</p>
          <p className="text-sm text-muted-foreground">
            El <strong>inversionista</strong> paga con descuento (ej. 90% del valor) y ese monto se entrega al <strong>proveedor</strong> de inmediato. El <strong>escrow</strong> no retiene ese pago: protege la segunda parte: cuando el <strong>negocio</strong> paga el 100% al vencimiento, el escrow asegura que ese pago llegue al inversionista (su ganancia es el descuento).
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link href="/app" className="btn-accent inline-flex gap-2">
            Probar el flujo en la app
            <ArrowDownRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
