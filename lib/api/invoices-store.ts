/**
 * Almacenamiento de facturas para MVP.
 * Lee y escribe en data/invoices.json para que las facturas persistan entre peticiones y reinicios.
 * Sustituir por base de datos en producción.
 */

import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"
import type { Invoice, InvoiceCreateInput } from "@/lib/product"

const DATA_DIR = join(process.cwd(), "data")
const FILE_PATH = join(DATA_DIR, "invoices.json")

const store: Invoice[] = []
let nextId = 1
let loaded = false

function ensureLoaded(): void {
  if (loaded && store.length > 0) return
  loaded = true
  try {
    if (existsSync(FILE_PATH)) {
      const raw = readFileSync(FILE_PATH, "utf-8")
      const data = JSON.parse(raw) as { nextId?: number; invoices?: Invoice[] }
      if (Array.isArray(data.invoices)) {
        store.length = 0
        store.push(...data.invoices)
      }
      if (typeof data.nextId === "number" && data.nextId > 0) {
        nextId = data.nextId
      }
    }
  } catch (e) {
    console.error("[invoices-store] Error loading data:", e)
    loaded = false
  }
}

function serializeSave(): void {
  try {
    const payload = { nextId, invoices: [...store] }
    writeFileSync(FILE_PATH, JSON.stringify(payload, null, 0), "utf-8")
  } catch (e) {
    console.error("[invoices-store] Error saving data:", e)
  }
}

function generateId(): string {
  return `FAC-${String(nextId++).padStart(3, "0")}`
}

export function createInvoice(input: InvoiceCreateInput): Invoice {
  ensureLoaded()
  const now = new Date().toISOString()
  const invoice: Invoice = {
    id: generateId(),
    providerAddress: input.providerAddress,
    emitterName: input.emitterName,
    debtorName: input.debtorName,
    debtorAddress: input.debtorAddress ?? null,
    amount: input.amount,
    currency: input.currency,
    dueDate: input.dueDate,
    discountRatePercent: input.discountRatePercent,
    status: "en_mercado",
    createdAt: now,
    investorAddress: null,
    escrowId: null,
    tokenizeTxHash: null,
  }
  store.push(invoice)
  serializeSave()
  return invoice
}

export function setInvoiceTokenizeTxHash(
  id: string,
  tokenizeTxHash: string
): Invoice | null {
  ensureLoaded()
  const invoice = store.find((i) => i.id === id)
  if (!invoice) return null
  invoice.tokenizeTxHash = tokenizeTxHash
  serializeSave()
  return invoice
}

export function listInvoices(filters?: {
  status?: Invoice["status"]
  providerAddress?: string
  investorAddress?: string
  debtorAddress?: string
}): Invoice[] {
  ensureLoaded()
  let list = [...store]
  if (filters?.status) {
    list = list.filter((i) => i.status === filters.status)
  }
  // Normalizar direcciones para comparar (trim + minúsculas) y asignar correctamente facturas por rol
  if (filters?.providerAddress) {
    const needle = filters.providerAddress.trim().toLowerCase()
    if (needle) {
      list = list.filter((i) => {
        const addr = i.providerAddress
        return typeof addr === "string" && addr.trim().toLowerCase() === needle
      })
    }
  }
  if (filters?.investorAddress) {
    const needle = filters.investorAddress.trim().toLowerCase()
    if (needle) {
      list = list.filter((i) => {
        const addr = i.investorAddress
        if (addr == null || typeof addr !== "string") return false
        return addr.trim().toLowerCase() === needle
      })
    }
  }
  if (filters?.debtorAddress) {
    const needle = filters.debtorAddress.trim().toLowerCase()
    if (needle) {
      list = list.filter((i) => {
        const addr = i.debtorAddress
        if (addr == null || typeof addr !== "string") return false
        return addr.trim().toLowerCase() === needle
      })
    }
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getInvoiceById(id: string): Invoice | undefined {
  ensureLoaded()
  const needle = typeof id === "string" ? id.trim() : ""
  if (!needle) return undefined
  return store.find((i) => i.id === needle)
}

export function setInvoiceInvested(
  id: string,
  investorAddress: string,
  escrowId?: string
): Invoice | null {
  ensureLoaded()
  const invoice = store.find((i) => i.id === id)
  if (!invoice || invoice.status !== "en_mercado") return null
  // Solo actualizar estos campos; no tocar debtorAddress para que la factura siga apareciendo al deudor
  invoice.status = "financiada"
  invoice.investorAddress = investorAddress
  invoice.escrowId = escrowId ?? null
  serializeSave()
  return invoice
}

export function setInvoicePaid(id: string): Invoice | null {
  ensureLoaded()
  const invoice = store.find((i) => i.id === id)
  if (!invoice || invoice.status !== "financiada") return null
  const preservedDebtorAddress = invoice.debtorAddress
  invoice.status = "pagada"
  if (preservedDebtorAddress !== undefined) invoice.debtorAddress = preservedDebtorAddress
  serializeSave()
  return invoice
}
