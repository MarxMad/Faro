"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Store, Settings, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/app/tokenize", icon: FileText, label: "Tokenizar" },
  { href: "/app/market", icon: Store, label: "Mercado" },
  { href: "/app/settings", icon: Settings, label: "Ajustes" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary shadow-sm">
            <span className="font-display text-sm font-bold text-sidebar-primary-foreground">F</span>
          </div>
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
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
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </aside>
  )
}
