"use client"

import Link from "next/link"
import { SignIn } from "@clerk/nextjs"
import { useAuthConfig } from "@/components/providers/auth-provider"

/**
 * Renderiza el componente SignIn de Clerk solo cuando Clerk está configurado.
 * Evita el error "useSession can only be used within ClerkProvider" en /sign-in
 * cuando la app se carga antes de que el provider esté disponible o hay problemas de hidratación.
 */
export function SignInGate() {
  const { clerkEnabled } = useAuthConfig()

  if (!clerkEnabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-8 text-center max-w-md">
        <p className="text-sm text-muted-foreground">
          Inicio de sesión no configurado. Configura las variables de Clerk en tu entorno.
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
    <SignIn
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-lg",
        },
      }}
    />
  )
}
