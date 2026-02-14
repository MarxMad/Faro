import Link from "next/link"
import { ArrowRight } from "lucide-react"

const sampleInvoices = [
  { id: "RWA-001", debtor: "Comercial ABC S.A.", amount: "$24,500", rate: "8.2%", term: "60 días" },
  { id: "RWA-002", debtor: "Distribuidora Norte", amount: "$18,750", rate: "9.1%", term: "45 días" },
  { id: "RWA-003", debtor: "Tech Solutions MX", amount: "$42,000", rate: "7.5%", term: "90 días" },
]

export function OverlappingCards() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-background to-primary/[0.05]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-balance text-2xl font-bold sm:text-3xl text-foreground">
            Facturas en mercado
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Oportunidades con descuento 8, 9 o 10%. Liquidez para proveedores, rentabilidad para inversionistas.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="relative flex flex-wrap justify-center gap-4 md:gap-0">
            {sampleInvoices.map((inv, i) => (
              <div
                key={inv.id}
                className={`glass-panel w-[280px] flex-shrink-0 p-5 transition-all hover:shadow-lg ${i === 1 ? "hover:border-[hsl(var(--accent))]/30 border-[hsl(var(--accent))]/15" : "hover:border-primary/30"}`}
                style={{
                  transform: i === 0 ? "rotate(-2deg)" : i === 1 ? "rotate(1deg) translateY(-6px)" : "rotate(-1deg) translateY(4px)",
                  zIndex: i === 1 ? 10 : 5 - i,
                  marginLeft: i > 0 ? "-24px" : 0,
                }}
              >
                <p className="text-xs font-mono font-semibold text-primary">{inv.id}</p>
                <p className="mt-2 font-display text-lg font-bold text-foreground">{inv.debtor}</p>
                <p className={`mt-1 text-2xl font-display font-bold ${i === 1 ? "text-[hsl(var(--accent))]" : "text-primary"}`}>{inv.amount}</p>
                <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                  <span>{inv.rate} desc.</span>
                  <span>{inv.term}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/app/market"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Ver todo el mercado
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
