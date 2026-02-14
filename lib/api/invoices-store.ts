/**
 * Almacenamiento en memoria de facturas para MVP.
 * Sustituir por base de datos en producción.
 */

import type { Invoice, InvoiceCreateInput } from "@/lib/product"

const store: Invoice[] = []
let nextId = 1

function generateId(): string {
  return `FAC-${String(nextId++).padStart(3, "0")}`
}

export function createInvoice(input: InvoiceCreateInput): Invoice {
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
  return invoice
}

export function setInvoiceTokenizeTxHash(
  id: string,
  tokenizeTxHash: string
): Invoice | null {
  const invoice = store.find((i) => i.id === id)
  if (!invoice) return null
  invoice.tokenizeTxHash = tokenizeTxHash
  return invoice
}

export function listInvoices(filters?: {
  status?: Invoice["status"]
  providerAddress?: string
  investorAddress?: string
}): Invoice[] {
  let list = [...store]
  if (filters?.status) {
    list = list.filter((i) => i.status === filters.status)
  }
  if (filters?.providerAddress) {
    list = list.filter((i) => i.providerAddress === filters.providerAddress)
  }
  if (filters?.investorAddress) {
    list = list.filter((i) => i.investorAddress === filters.investorAddress)
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getInvoiceById(id: string): Invoice | undefined {
  return store.find((i) => i.id === id)
}

export function setInvoiceInvested(
  id: string,
  investorAddress: string,
  escrowId?: string
): Invoice | null {
  const invoice = store.find((i) => i.id === id)
  if (!invoice || invoice.status !== "en_mercado") return null
  invoice.status = "financiada"
  invoice.investorAddress = investorAddress
  invoice.escrowId = escrowId ?? null
  return invoice
}
