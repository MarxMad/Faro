import { NextRequest, NextResponse } from "next/server"
import { getInvoiceById, setInvoiceInvested } from "@/lib/api/invoices-store"

/**
 * POST /api/invoices/[id]/invest
 * Body: { investorAddress: string, contractId?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idStr = typeof id === "string" ? id.trim() : ""
    const body = await request.json().catch(() => ({}))
    const investorAddress =
      typeof body.investorAddress === "string" ? body.investorAddress.trim() : ""
    if (!investorAddress) {
      return NextResponse.json(
        { error: "Falta investorAddress en el body" },
        { status: 400 }
      )
    }
    const contractId =
      typeof body.contractId === "string" ? body.contractId.trim() : undefined

    const invoice = idStr ? getInvoiceById(idStr) : undefined
    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
    }
    if (invoice.status === "financiada") {
      const sameInvestor =
        invoice.investorAddress &&
        investorAddress &&
        invoice.investorAddress.trim().toLowerCase() === investorAddress.trim().toLowerCase()
      if (sameInvestor) {
        return NextResponse.json(invoice)
      }
      return NextResponse.json(
        { error: "La factura no está disponible para inversión" },
        { status: 400 }
      )
    }
    if (invoice.status !== "en_mercado") {
      return NextResponse.json(
        { error: "La factura no está disponible para inversión" },
        { status: 400 }
      )
    }
    const updated = setInvoiceInvested(idStr, investorAddress, contractId ?? undefined)
    if (!updated) {
      return NextResponse.json(
        { error: "No se pudo registrar la inversión" },
        { status: 409 }
      )
    }
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Error al registrar inversión" },
      { status: 500 }
    )
  }
}
