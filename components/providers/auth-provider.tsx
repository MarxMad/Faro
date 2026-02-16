"use client"

import { createContext, useContext } from "react"
import { ClerkProvider } from "@clerk/nextjs"

const AuthConfigContext = createContext<{ clerkEnabled: boolean }>({
  clerkEnabled: false,
})

export function useAuthConfig() {
  return useContext(AuthConfigContext)
}

/**
 * Si NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY está definida, envuelve con ClerkProvider.
 * Si no (p. ej. build en Vercel sin env), solo provee contexto clerkEnabled=false
 * para que los wrappers de auth muestren la rama "signed out" y el build no falle.
 * En producción configura la variable en Vercel.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const clerkEnabled = Boolean(
    publishableKey && !publishableKey.includes("placeholder")
  )

  const content = (
    <AuthConfigContext.Provider value={{ clerkEnabled }}>
      {children}
    </AuthConfigContext.Provider>
  )

  if (!clerkEnabled) {
    return content
  }

  return (
    <ClerkProvider publishableKey={publishableKey!}>{content}</ClerkProvider>
  )
}
