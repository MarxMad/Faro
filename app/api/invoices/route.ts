import { NextRequest, NextResponse } from "next/server"
import {
  createInvoice,
  listInvoices,
  setInvoiceTokenizeTxHash,
} from "@/lib/api/invoices-store"
import {
  isOnChainTokenizationConfigured,
  mintInvoiceToken,
} from "@/lib/soroban/mint-invoice-token"
import type { InvoiceCreateInput } from "@/lib/product"
import type { InvoiceStatus } from "@/lib/product"

const VALID_STATUSES: InvoiceStatus[] = [
  "borrador",
  "pendiente_validacion",
  "en_mercado",
  "financiada",
  "pagada",
  "vencida",
]

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get("status")
    const status = statusParam && VALID_STATUSES.includes(statusParam as InvoiceStatus)
      ? (statusParam as InvoiceStatus)
      : undefined
    const provider = searchParams.get("provider")?.trim() ?? undefined
    const investor = searchParams.get("investor")?.trim() ?? undefined
    const debtor = searchParams.get("debtor")?.trim() ?? undefined

    const list = listInvoices({
      ...(status ? { status } : {}),
      ...(provider ? { providerAddress: provider } : {}),
      ...(investor ? { investorAddress: investor } : {}),
      ...(debtor ? { debtorAddress: debtor } : {}),
    })
    return NextResponse.json(list)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Error al listar facturas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      providerAddress,
      emitterName,
      debtorName,
      debtorAddress,
      amount,
      currency,
      dueDate,
      discountRatePercent,
    } = body as Partial<InvoiceCreateInput>

    if (
      !providerAddress ||
      !emitterName ||
      !debtorName ||
      amount == null ||
      !currency ||
      !dueDate ||
      discountRatePercent == null
    ) {
      return NextResponse.json(
        { error: "Faltan campos: providerAddress, emitterName, debtorName, amount, currency, dueDate, discountRatePercent" },
        { status: 400 }
      )
    }

    const invoice = createInvoice({
      providerAddress: String(providerAddress),
      emitterName: String(emitterName),
      debtorName: String(debtorName),
      ...(typeof debtorAddress === "string" && debtorAddress.trim() ? { debtorAddress: debtorAddress.trim() } : {}),
      amount: Number(amount),
      currency: String(currency),
      dueDate: String(dueDate),
      discountRatePercent: Number(discountRatePercent),
    })

    if (isOnChainTokenizationConfigured()) {
      try {
        const { hash } = await mintInvoiceToken(
          invoice.providerAddress,
          invoice.amount
        )
        setInvoiceTokenizeTxHash(invoice.id, hash)
        invoice.tokenizeTxHash = hash
      } catch (err) {
        console.error("Tokenización on-chain (mint) falló:", err)
        return NextResponse.json(
          {
            error:
              err instanceof Error
                ? err.message
                : "Error al mintear tokens en Soroban",
          },
          { status: 502 }
        )
      }
    }

    return NextResponse.json(invoice)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Error al crear factura" },
      { status: 500 }
    )
  }
}
