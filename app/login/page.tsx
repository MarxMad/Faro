"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // TODO: integrar con tu backend / Stellar SEP-10 / wallet
      await new Promise((r) => setTimeout(r, 800))
      if (!email || !password) {
        setError("Ingresa email y contraseña.")
        return
      }
      router.push("/app")
      router.refresh()
    } catch {
      setError("Error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-primary/[0.06] p-4">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="relative w-full max-w-[400px]">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-foreground"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
            <span className="font-display text-lg font-bold text-primary-foreground">
              F
            </span>
          </div>
          <span className="font-display text-2xl font-bold">Faro</span>
        </Link>

        <div className="glass-panel border-primary/10 p-8 shadow-lg">
          <h1 className="font-display text-xl font-bold text-foreground">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede a tu cuenta para gestionar facturas e inversiones.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@empresa.com"
                autoComplete="email"
                required
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar, aceptas los términos de uso y la política de privacidad de Faro.
        </p>
      </div>
    </div>
  )
}
