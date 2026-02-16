"use client"

import { Lock, Hexagon, Users, FileCheck, DollarSign } from "lucide-react"

const diagrams = [
  {
    title: "Validación primero",
    description:
      "Las facturas se validan y se ligan al negocio deudor antes de publicarse en el mercado. Transparencia desde el inicio.",
    visual: (
      <div className="flex items-center justify-center gap-3 py-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
          <FileCheck className="h-7 w-7" />
        </div>
        <div className="h-px w-8 bg-[hsl(var(--accent))]/40" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--accent))]/40 bg-white/10 text-[hsl(var(--accent))]"
            >
              <Users className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Escrow al vencimiento",
    description:
      "El pago del inversionista va al proveedor (liquidez inmediata). El escrow protege la segunda parte: cuando el negocio paga el 100%, ese monto se libera al inversionista.",
    visual: (
      <div className="flex items-center justify-center gap-4 py-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
          <Lock className="h-7 w-7" />
        </div>
        <div className="h-px w-6 border-t-2 border-dashed border-[hsl(var(--accent))]/40" />
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--accent))]/40 bg-white/10 text-[hsl(var(--accent))]">
          <DollarSign className="h-6 w-6" />
        </div>
      </div>
    ),
  },
  {
    title: "Blockchain Stellar + Trustless Work",
    description:
      "Construido sobre Stellar e integrado con Trustless Work para financiamiento seguro, transparente y sin custodia.",
    visual: (
      <div className="flex flex-col items-center justify-center gap-4 py-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
          <Hexagon className="h-7 w-7" />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["SEP", "Escrow", "USDC"].map((label) => (
            <div
              key={label}
              className="rounded-lg border border-[hsl(var(--accent))]/40 bg-white/10 px-2 py-1 text-[10px] font-bold text-[hsl(var(--accent))]"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export function FeatureDiagrams() {
  return (
    <section className="relative py-24 bg-primary text-primary-foreground overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--accent)) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-medium uppercase tracking-widest text-[hsl(var(--accent))]">
            Cómo lo hacemos
          </span>
          <h2 className="mt-4 font-display text-balance text-3xl font-bold sm:text-4xl">
            Validación, escrow y blockchain
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-primary-foreground/80">
            Tres pilares que dan confianza a proveedores, negocios e inversionistas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {diagrams.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur-sm transition-all hover:border-[hsl(var(--accent))]/30"
            >
              <div className="relative flex justify-center">{item.visual}</div>
              <h3 className="mt-6 font-display text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
