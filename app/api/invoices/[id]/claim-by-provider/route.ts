import { NextResponse } from "next/server"
import { getInvoiceById, setProviderClaimed } from "@/lib/api/invoices-store"

/**
 * POST /api/invoices/[id]/claim-by-provider
 * Marca que el proveedor cobró el escrow de inversión (para ocultar "Cobrar factura").
 * La liberación on-chain la hace el front con Trustless Work; este endpoint solo persiste el estado.
 */
export async function POST(
  _request: Request,
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
        { error: "Solo se puede registrar cobro en una factura financiada" },
        { status: 400 }
      )
    }

    const updated = setProviderClaimed(idStr)
    if (!updated) {
      return NextResponse.json(
        { error: "No se pudo registrar el cobro" },
        { status: 409 }
      )
    }
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Error al registrar el cobro" },
      { status: 500 }
    )
  }
}
