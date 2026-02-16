import Link from "next/link"
import Image from "next/image"

const links = [
  { label: "Características", href: "#features" },
  { label: "Flujo", href: "#flujo" },
  { label: "Comparativa", href: "#comparison" },
]

export function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-primary/[0.03]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src="/Farologo.svg"
            alt="Faro"
            width={28}
            height={28}
            className="h-7 w-auto"
          />
          <span className="font-display text-lg font-bold text-foreground">Faro</span>
        </div>

        <div className="flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/app"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            App
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Faro Protocol. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
