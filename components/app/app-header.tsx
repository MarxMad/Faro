"use client"

import { Bell } from "lucide-react"
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">
          Bienvenido de nuevo
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">Registrarse</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notificaciones</span>
          </Button>
          <ConnectWalletButton />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  )
}
