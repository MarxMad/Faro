import { NextRequest, NextResponse } from "next/server"
import { getInvoiceById } from "@/lib/api/invoices-store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = getInvoiceById(id)
    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
    }
    return NextResponse.json(invoice)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Error al obtener factura" },
      { status: 500 }
    )
  }
}
