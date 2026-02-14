import Link from "next/link"

const partners = [
  { name: "Stellar", href: "https://stellar.org", label: "Stellar" },
  { name: "Trustless Work", href: "https://trustlesswork.com", label: "Trustless Work" },
]

export function TrustedBy() {
  return (
    <section className="relative py-16 border-t border-primary/10 bg-primary/[0.04]">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground mb-8">
          Impulsado por
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {partners.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-primary/15 bg-card px-8 py-4 font-display text-lg font-bold text-foreground transition-colors hover:border-[hsl(var(--accent))]/30 hover:bg-[hsl(var(--accent))]/5"
            >
              {p.label}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Faro utiliza Stellar (SEP) y Trustless Work para escrow seguro y transparente.
        </p>
      </div>
    </section>
  )
}
