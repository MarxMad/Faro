import { NextRequest, NextResponse } from "next/server"
import { getInvoiceById, setInvoiceInvested } from "@/lib/api/invoices-store"
import { createEscrow } from "@/lib/trustless-work/client"

/**
 * Monto nominal en unidades mínimas (6 decimales, ej. USDC).
 * En producción considerar conversión MXN → USDC si la factura está en MXN.
 */
function nominalToSmallestUnits(amount: number): string {
  return String(Math.round(amount * 1_000_000))
}

/**
 * POST /api/invoices/[id]/invest
 * Registra que la wallet invertida financia la factura.
 * Crea un escrow en Trustless Work si hay debtorAddress y API configurada.
 * Body: { investorAddress: string }
 * Devuelve la factura actualizada (status: financiada).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = getInvoiceById(id)
    if (!invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })
    }
    if (invoice.status !== "en_mercado") {
      return NextResponse.json(
        { error: "La factura no está disponible para inversión" },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const investorAddress = typeof body.investorAddress === "string"
      ? body.investorAddress.trim()
      : ""
    if (!investorAddress) {
      return NextResponse.json(
        { error: "Falta investorAddress en el body" },
        { status: 400 }
      )
    }

    let escrowId: string | undefined

    if (
      invoice.debtorAddress &&
      process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_URL &&
      process.env.TRUSTLESS_WORK_API_KEY
    ) {
      try {
        const escrow = await createEscrow({
          amount: nominalToSmallestUnits(invoice.amount),
          client_account: invoice.debtorAddress,
          provider_account: investorAddress,
          description: `Faro factura ${invoice.id} - nominal a liberar al inversionista`,
        })
        escrowId = escrow.id
      } catch (err) {
        console.error("Trustless Work createEscrow failed:", err)
        // La inversión se registra igual; escrowId queda null
      }
    }

    const updated = setInvoiceInvested(id, investorAddress, escrowId)
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
