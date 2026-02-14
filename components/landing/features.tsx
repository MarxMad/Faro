import { FileText, Landmark, ShieldCheck, Clock, BarChart3, Globe } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Tokenizacion de facturas",
    description:
      "Convierte tus cuentas por cobrar en tokens digitales respaldados por activos reales (RWA) en Stellar.",
  },
  {
    icon: Clock,
    title: "Liquidez en menos de 48h",
    description:
      "Accede a capital de trabajo sin esperar 30, 60 o 90 dias. El mercado financia tus facturas al instante.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad on-chain",
    description:
      "Cada factura se registra como un contrato inteligente inmutable. Transparencia total para todas las partes.",
  },
  {
    icon: BarChart3,
    title: "Rendimiento para inversores",
    description:
      "Los inversores acceden a oportunidades de renta fija respaldadas por facturas verificadas de empresas reales.",
  },
  {
    icon: Landmark,
    title: "Sin intermediarios bancarios",
    description:
      "Protocolo descentralizado que elimina la burocracia tradicional. Menores costos, mayor velocidad.",
  },
  {
    icon: Globe,
    title: "Acceso regional",
    description:
      "Disenado para PyMEs de Latinoamerica. Opera en multiples monedas estables sobre Stellar.",
  },
]

const comparison = [
  {
    feature: "Tiempo de aprobacion",
    faro: "< 48 horas",
    bank: "2-6 semanas",
  },
  {
    feature: "Tasa de descuento",
    faro: "1.5% - 3%",
    bank: "4% - 12%",
  },
  {
    feature: "Documentacion",
    faro: "Factura XML/PDF",
    bank: "Estados financieros, avales, garantias",
  },
  {
    feature: "Transparencia",
    faro: "On-chain, auditable",
    bank: "Opaca",
  },
  {
    feature: "Accesibilidad",
    faro: "Cualquier PyME",
    bank: "Historial crediticio requerido",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 bg-gradient-to-b from-primary/[0.04] to-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-primary">
            Características
          </span>
          <h2 className="mt-4 font-display text-balance text-3xl font-bold sm:text-4xl text-foreground">
            Todo lo que tu PyME necesita
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Herramientas con confianza y tecnología: liquidez, transparencia y respaldo real.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const useAccent = i % 2 === 1
            return (
            <div
              key={feature.title}
              className={`glass-panel group p-6 transition-all hover:shadow-md ${useAccent ? "hover:border-[hsl(var(--accent))]/25" : "hover:border-primary/30"}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${useAccent ? "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] group-hover:bg-[hsl(var(--accent))]/20" : "bg-primary/10 text-primary group-hover:bg-primary/20"}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
          })}
        </div>

        <div id="comparison" className="mt-24">
          <div className="text-center">
            <h3 className="font-display text-balance text-2xl font-bold sm:text-3xl">
              Faro vs Banca Tradicional
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              Compara el proceso de factoraje tradicional con nuestra plataforma descentralizada.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Aspecto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-primary">
                    Faro
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Banca
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i < comparison.length - 1 ? "border-b border-border" : ""
                    }
                  >
                    <td className="px-6 py-4 text-sm text-foreground">{row.feature}</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">{row.faro}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.bank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
