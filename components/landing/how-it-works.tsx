import { Upload, ScanLine, Coins, Banknote } from "lucide-react"

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Sube tu factura",
    description:
      "Carga el XML o PDF de tu factura por cobrar. Nuestro sistema la valida automaticamente.",
  },
  {
    icon: ScanLine,
    number: "02",
    title: "Verificacion y scoring",
    description:
      "Analizamos al deudor, monto y vencimiento para generar un perfil de riesgo transparente.",
  },
  {
    icon: Coins,
    number: "03",
    title: "Tokenizacion en Stellar",
    description:
      "La factura se convierte en un token RWA con un contrato inteligente que garantiza los terminos.",
  },
  {
    icon: Banknote,
    number: "04",
    title: "Recibe tu liquidez",
    description:
      "Inversores financian tu factura y recibes stablecoins en tu wallet en menos de 48 horas.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-primary/[0.04] to-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-primary">
            Proceso
          </span>
          <h2 className="mt-4 font-display text-balance text-3xl font-bold sm:text-4xl text-foreground">
            Cómo funciona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            El inversionista paga con descuento y tú recibes esa liquidez al instante; al vencimiento el negocio paga el 100% y el inversionista recibe su ganancia.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:left-1/2 md:block" />

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`relative flex flex-col gap-6 md:flex-row md:items-center ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1">
                  <div
                    className={`glass-panel p-6 md:p-8 ${
                      i % 2 === 0 ? "md:mr-12" : "md:ml-12"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">
                          Paso {step.number}
                        </span>
                        <h3 className="font-display text-xl font-bold text-foreground">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="absolute left-8 top-1/2 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background md:left-1/2 md:block" />

                <div className="hidden flex-1 md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
