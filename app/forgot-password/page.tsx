"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // TODO: integrar con tu backend de recuperación
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
    setLoading(false)
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
            Recuperar contraseña
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Te enviaremos un enlace a tu correo para restablecer tu contraseña.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              Si existe una cuenta con ese correo, recibirás un enlace en unos minutos. Revisa tu bandeja de entrada y spam.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
              <Button
                type="submit"
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace"
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              ← Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
