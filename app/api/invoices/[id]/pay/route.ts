import { NextRequest, NextResponse } from "next/server"
import { getInvoiceById, setInvoicePaid } from "@/lib/api/invoices-store"

/**
 * POST /api/invoices/[id]/pay
 * Solo marca la factura como pagada (confirmación del deudor).
 * No se libera ningún escrow aquí; el dinero al inversionista se maneja en el flujo de "Reclamar cobro".
 * Body opcional: { escrowNominalId?: string } para cuando exista Escrow 2 (Fase C).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idStr = typeof id === "string" ? id.trim() : ""
    const invoice = idStr ? getInvoiceById(idStr) : undefined
    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
    }
    if (invoice.status !== "financiada") {
      return NextResponse.json(
        { error: "Solo se puede pagar una factura en estado financiada" },
        { status: 400 }
      )
    }

    const body = await _request.json().catch(() => ({})) as { escrowNominalId?: string }
    const escrowNominalId = typeof body?.escrowNominalId === "string" ? body.escrowNominalId : undefined

    const updated = setInvoicePaid(idStr, escrowNominalId ?? null)
    if (!updated) {
      return NextResponse.json(
        { error: "No se pudo marcar la factura como pagada" },
        { status: 409 }
      )
    }
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Error al registrar el pago" },
      { status: 500 }
    )
  }
}
