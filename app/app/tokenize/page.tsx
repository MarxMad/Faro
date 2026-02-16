"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getStellarExpertTxUrl } from "@/lib/stellar-explorer-urls"
import { resolveStellarAddressIfConfigured } from "@/lib/stellarsep"
import {
  useStellarWalletKit,
  FUTURENET_PASSPHRASE,
} from "@/lib/wallet/stellar-wallet-kit-provider"

type Step = "upload" | "details" | "confirm"

const MAX_FILE_SIZE_MB = 10
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.pdf"

const defaultForm = {
  emitterName: "Mi Empresa S.A. de C.V.",
  debtorName: "Comercial ABC S.A.",
  debtorAddress: "",
  amount: 24500,
  currency: "MXN",
  dueDate: "2026-04-15",
  discountRatePercent: 2.5,
}

export default function TokenizePage() {
  const router = useRouter()
  const {
    address,
    isConnected,
    networkLabel,
    isFuturenet,
    getWalletNetwork,
  } = useStellarWalletKit()
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [walletNetwork, setWalletNetwork] = useState<{
    network: string
    networkPassphrase: string
  } | null>(null)
  const [checkingNetwork, setCheckingNetwork] = useState(false)
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const submitInProgressRef = useRef(false)

  const walletNotOnFuturenet =
    isFuturenet &&
    isConnected &&
    walletNetwork &&
    walletNetwork.networkPassphrase !== FUTURENET_PASSPHRASE

  useEffect(() => {
    if (isConnected) getWalletNetwork().then(setWalletNetwork)
    else setWalletNetwork(null)
  }, [isConnected, getWalletNetwork])

  useEffect(() => {
    if (!file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      return
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0]
    if (!chosen) return
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if (chosen.size > maxBytes) {
      toast.error(`El archivo no debe superar ${MAX_FILE_SIZE_MB} MB`)
      return
    }
    setFile(chosen)
    e.target.value = ""
  }

  const steps: { id: Step; label: string; number: number }[] = [
    { id: "upload", label: "Subir factura", number: 1 },
    { id: "details", label: "Detalles", number: 2 },
    { id: "confirm", label: "Confirmar", number: 3 },
  ]

  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Certifica tu factura</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube tu factura y certifícala en Stellar para que aparezca en el mercado y los inversores la financien.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  i <= currentIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {i < currentIndex ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:block",
                  i <= currentIndex ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-12",
                  i < currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="glass-panel p-8">
        {currentStep === "upload" && (
          <div className="flex flex-col items-center gap-6">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              aria-hidden
              onChange={handleFileChange}
            />
            <div
              className={cn(
                "flex w-full max-w-lg cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors",
                file
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-secondary/50"
              )}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
              }}
            >
              {file ? (
                <>
                  {previewUrl ? (
                    <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-lg bg-secondary">
                      <img
                        src={previewUrl}
                        alt="Vista previa factura"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB · Archivo listo
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                  >
                    Quitar archivo
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Haz clic para subir tu factura
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Imagen (JPG, PNG, WebP, GIF) o PDF · máx. {MAX_FILE_SIZE_MB} MB
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-start gap-2 max-w-lg">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Sube una imagen o PDF de tu factura. Los datos (emisor, monto, vencimiento)
                los completas o corriges en el siguiente paso.
              </p>
            </div>

            <Button
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!file}
              onClick={() => setCurrentStep("details")}
            >
              Continuar
            </Button>
          </div>
        )}

        {currentStep === "details" && (
          <div className="mx-auto max-w-lg flex flex-col gap-6">
            <div className="glass-panel p-4">
              <div className="flex items-center gap-3">
                {previewUrl ? (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{file?.name ?? "Factura"}</p>
                  <p className="text-xs text-muted-foreground">Completa o corrige los datos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Emisor</Label>
                <Input
                  value={form.emitterName}
                  onChange={(e) => setForm((f) => ({ ...f, emitterName: e.target.value }))}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Deudor (razón social)</Label>
                <Input
                  value={form.debtorName}
                  onChange={(e) => setForm((f) => ({ ...f, debtorName: e.target.value }))}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label className="text-muted-foreground">
                  Dirección Stellar del deudor (recomendado para escrow)
                </Label>
                <Input
                  placeholder="G... o nombre*dominio.com"
                  value={form.debtorAddress}
                  onChange={(e) => setForm((f) => ({ ...f, debtorAddress: e.target.value.trim() }))}
                  className="bg-secondary/50 border-border font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Cuenta Stellar (G...) o dirección federada (ej. deudor*banco.com). Si usas federación, se resolverá al enviar. Necesaria para escrow y para que el deudor vea la factura y pueda pagar.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Monto</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Vencimiento</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Tasa de descuento solicitada (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.discountRatePercent}
                onChange={(e) => setForm((f) => ({ ...f, discountRatePercent: Number(e.target.value) || 0 }))}
                className="border-border"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("upload")}
                className="border-border text-muted-foreground"
              >
                Atras
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setCurrentStep("confirm")}
              >
                Revisar y confirmar
              </Button>
            </div>
          </div>
        )}

        {currentStep === "confirm" && (
          <div className="mx-auto max-w-lg flex flex-col items-center gap-6 py-8">
            {successTxHash ? (
              <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-green-500/40 bg-green-500/10 p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-green-800 dark:text-green-300">
                  Factura certificada correctamente
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tu factura quedó registrada en la red. Comprobante:
                </p>
                <div className="w-full rounded-lg bg-secondary/80 p-3 font-mono text-xs break-all text-foreground">
                  {successTxHash}
                </div>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <a
                    href={getStellarExpertTxUrl(
                      successTxHash,
                      typeof process !== "undefined" &&
                        process.env.NEXT_PUBLIC_SOROBAN_NETWORK
                        ? process.env.NEXT_PUBLIC_SOROBAN_NETWORK
                        : "testnet"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver comprobante en Stellar Expert
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Si Stellar Expert muestra «Transaction not found», el backend debe usar testnet (SOROBAN_RPC_URL y SOROBAN_NETWORK_PASSPHRASE en .env). Reinicia el servidor tras cambiar .env.
                </p>
                <p className="text-xs text-muted-foreground">
                  Redirigiendo al dashboard en unos segundos…
                </p>
              </div>
            ) : (
              <>
            {isFuturenet && (
              <div className="w-full space-y-2">
                {walletNotOnFuturenet ? (
                  <div
                    className="flex flex-col gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm"
                    role="alert"
                  >
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Tu wallet no está en la red configurada
                    </p>
                    <p className="text-muted-foreground">
                      El registro en red usa la red configurada en la app. Cambia la red
                      en tu extensión (Freighter: menú → Red) para que coincida (p. ej. Testnet) y vuelve a verificar.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={checkingNetwork}
                        onClick={async () => {
                          setCheckingNetwork(true)
                          const net = await getWalletNetwork()
                          setWalletNetwork(net ?? null)
                          setCheckingNetwork(false)
                        }}
                      >
                        {checkingNetwork ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verificar de nuevo"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href="https://developers.stellar.org/docs/fundamentals-and-concepts/network-configuration"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1"
                        >
                          Cómo cambiar a Futurenet
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Red: {networkLabel}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl font-bold">Listo para certificar</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu factura se certificará en la red Stellar y se publicará en el mercado
                para que los inversores la financien.
              </p>
            </div>

            <div className="w-full glass-panel p-4">
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Factura</span>
                  <span className="font-medium text-foreground">{file?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monto</span>
                  <span className="font-medium text-foreground">
                    ${form.amount.toLocaleString("es-MX")} {form.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tasa de descuento</span>
                  <span className="font-medium text-primary">{form.discountRatePercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Liquidez estimada</span>
                  <span className="font-medium text-foreground">
                    ${(form.amount * (1 - form.discountRatePercent / 100)).toLocaleString("es-MX")} {form.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Red</span>
                  <span className="font-medium text-foreground">{networkLabel}</span>
                </div>
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("details")}
                className="border-border text-muted-foreground"
                disabled={submitting}
              >
                Atrás
              </Button>
              <Button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                disabled={
                  !isConnected ||
                  submitting ||
                  !!(isFuturenet && walletNotOnFuturenet)
                }
                onClick={async () => {
                  if (submitInProgressRef.current) return
                  if (!address) {
                    setSubmitError("Conecta tu wallet para subir la factura.")
                    return
                  }
                  setSubmitError(null)
                  submitInProgressRef.current = true
                  setSubmitting(true)
                  try {
                    let debtorAddressToSend = form.debtorAddress
                    if (form.debtorAddress && form.debtorAddress.includes("*")) {
                      const resolved = await resolveStellarAddressIfConfigured(form.debtorAddress)
                      if (!resolved) {
                        toast.error(
                          "Dirección federada no resuelta. Configura NEXT_PUBLIC_FEDERATION_SERVER_URL en .env o usa una cuenta G..."
                        )
                        setSubmitting(false)
                        submitInProgressRef.current = false
                        return
                      }
                      debtorAddressToSend = resolved.account_id
                    }
                    const res = await fetch("/api/invoices", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        providerAddress: address,
                        emitterName: form.emitterName,
                        debtorName: form.debtorName,
                        ...(debtorAddressToSend ? { debtorAddress: debtorAddressToSend } : {}),
                        amount: form.amount,
                        currency: form.currency,
                        dueDate: form.dueDate,
                        discountRatePercent: form.discountRatePercent,
                      }),
                    })
                    const data = (await res.json().catch(() => ({}))) as {
                      id?: string
                      tokenizeTxHash?: string | null
                      error?: string
                    }
                    if (!res.ok) {
                      const msg = data.error || "Error al crear factura"
                      console.error("[Tokenize] API error:", res.status, data)
                      throw new Error(msg)
                    }
                    const txHash =
                      data.tokenizeTxHash && String(data.tokenizeTxHash).trim()
                        ? String(data.tokenizeTxHash)
                        : null
                    console.log("[Tokenize] Factura creada:", data.id, "tx:", txHash ?? "sin tx on-chain")
                    if (txHash) {
                      setSuccessTxHash(txHash)
                      toast.success("Factura certificada en Stellar", {
                        description: `Tx: ${txHash.slice(0, 12)}…`,
                        action: {
                          label: "Ver comprobante en Stellar Expert",
                          onClick: () =>
                            window.open(
                              getStellarExpertTxUrl(
                                txHash,
                                typeof process !== "undefined" &&
                                  process.env.NEXT_PUBLIC_SOROBAN_NETWORK
                                  ? process.env.NEXT_PUBLIC_SOROBAN_NETWORK
                                  : "testnet"
                              ),
                              "_blank"
                            ),
                        },
                      })
                      setTimeout(() => {
                        setSuccessTxHash(null)
                        setCurrentStep("upload")
                        setFile(null)
                        setForm(defaultForm)
                        router.push("/app")
                      }, 4000)
                    } else {
                      toast.success("Factura creada (sin registro en red)")
                      setTimeout(() => {
                        setCurrentStep("upload")
                        setFile(null)
                        setForm(defaultForm)
                        router.push("/app")
                      }, 2000)
                    }
                  } catch (e) {
                    console.error("[Tokenize] Error:", e)
                    setSubmitError(e instanceof Error ? e.message : "Error al subir la factura")
                  } finally {
                    submitInProgressRef.current = false
                    setSubmitting(false)
                  }
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo factura...
                  </>
                ) : (
                  "Subir factura"
                )}
              </Button>
            </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
