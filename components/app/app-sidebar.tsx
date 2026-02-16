"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Store, Settings, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/app/tokenize", icon: FileText, label: "Subir factura" },
  { href: "/app/market", icon: Store, label: "Mercado" },
  { href: "/app/settings", icon: Settings, label: "Ajustes" },
]

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const linkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-sidebar-accent text-sidebar-primary"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    )

  return (
    <>
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <Image
            src="/Farologo.svg"
            alt="Faro"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-display text-lg font-bold text-sidebar-foreground">Faro</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(isActive)}
              onClick={onNavigate}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          onClick={onNavigate}
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </>
  )
}

export function AppSidebar({
  variant,
  onNavigate,
}: {
  variant?: "fixed" | "sheet"
  onNavigate?: () => void
} = {}) {
  const isSheet = variant === "sheet"

  if (isSheet) {
    return (
      <div className="flex h-full flex-col pt-2">
        <SidebarContent onNavigate={onNavigate} />
      </div>
    )
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-sidebar md:flex">
      <SidebarContent />
    </aside>
  )
}
