"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button"

const navLinks = [
  { href: "#features", label: "Características" },
  { href: "#flujo", label: "Flujo" },
  { href: "#comparison", label: "Comparativa" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-primary/10 bg-[hsl(var(--background))]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <span className="font-display text-sm font-bold text-primary-foreground">F</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">Faro</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <ConnectWalletButton
            label="Entrar"
            redirectOnConnect
            variant="outline"
          />
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-muted-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
              <ConnectWalletButton
                label="Entrar"
                redirectOnConnect
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
