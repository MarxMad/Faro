"use client"

import Link from "next/link"
import { SignUp } from "@clerk/nextjs"
import { useAuthConfig } from "@/components/providers/auth-provider"

/**
 * Renderiza SignUp de Clerk solo cuando Clerk está configurado.
 * Evita errores de useSession/ClerkProvider en /sign-up.
 */
export function SignUpGate() {
  const { clerkEnabled } = useAuthConfig()

  if (!clerkEnabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-8 text-center max-w-md">
        <p className="text-sm text-muted-foreground">
          Registro no configurado. Configura las variables de Clerk en tu entorno.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-[hsl(var(--accent))] hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-lg",
        },
      }}
    />
  )
}
