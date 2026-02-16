"use client"

import { SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut } from "@clerk/nextjs"
import { useAuthConfig } from "@/components/providers/auth-provider"

/**
 * Cuando Clerk no está configurado (build sin env), muestra siempre la rama "signed out".
 * Cuando está configurado, delega en Clerk.
 */
export function AuthSignedOut({ children }: { children: React.ReactNode }) {
  const { clerkEnabled } = useAuthConfig()
  if (!clerkEnabled) return <>{children}</>
  return <ClerkSignedOut>{children}</ClerkSignedOut>
}

/**
 * Cuando Clerk no está configurado, no muestra nada (equivale a signed out).
 * Cuando está configurado, delega en Clerk.
 */
export function AuthSignedIn({ children }: { children: React.ReactNode }) {
  const { clerkEnabled } = useAuthConfig()
  if (!clerkEnabled) return null
  return <ClerkSignedIn>{children}</ClerkSignedIn>
}
