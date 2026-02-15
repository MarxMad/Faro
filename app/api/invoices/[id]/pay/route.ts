import { NextRequest, NextResponse } from "next/server"
import { getInvoiceById, setInvoicePaid } from "@/lib/api/invoices-store"
import { releaseEscrow } from "@/lib/trustless-work/client"

/**
 * POST /api/invoices/[id]/pay
 * Marca la factura como pagada (negocio pagó el nominal).
 * Si el escrow se creó on-chain (contractId), el front ya liberó con Trustless Work;
 * en ese caso el body puede traer releaseTxHash y no se llama a la API REST.
 * Si el escrow es vía REST (sin contractId desde el front), se llama releaseEscrow.
 * Body opcional: { releaseTxHash?: string; releasedOnChain?: boolean }.
 */
export async function POST(
  request: NextRequest,
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

    const body = await request.json().catch(() => ({})) as { releaseTxHash?: string; releasedOnChain?: boolean }
    const releasedOnChain = Boolean(body?.releasedOnChain ?? body?.releaseTxHash)

    let releaseTxHash: string | undefined = body?.releaseTxHash

    if (
      invoice.escrowId &&
      process.env.TRUSTLESS_WORK_API_KEY &&
      !releasedOnChain
    ) {
      try {
        const releaseResult = await releaseEscrow(invoice.escrowId)
        const raw = releaseResult as Record<string, unknown>
        releaseTxHash =
          typeof raw?.transaction_hash === "string"
            ? raw.transaction_hash
            : typeof raw?.tx_hash === "string"
              ? raw.tx_hash
              : typeof raw?.last_transaction_id === "string"
                ? raw.last_transaction_id
                : undefined
      } catch (err) {
        console.error("Trustless Work releaseEscrow failed:", err)
        return NextResponse.json(
          {
            error:
              err instanceof Error
                ? err.message
                : "Error al liberar el escrow en Trustless Work",
          },
          { status: 502 }
        )
      }
    }

    const updated = setInvoicePaid(idStr)
    if (!updated) {
      return NextResponse.json(
        { error: "No se pudo marcar la factura como pagada" },
        { status: 409 }
      )
    }
    return NextResponse.json({ ...updated, releaseTxHash: releaseTxHash ?? undefined })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Error al registrar el pago" },
      { status: 500 }
    )
  }
}
