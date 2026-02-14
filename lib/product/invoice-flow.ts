/**
 * Estados de factura y flujo según PRODUCT-USUARIOS-Y-FLUJO.md
 * Proveedor sube → Plataforma lista → Inversionista paga con descuento →
 * Escrow retiene → Negocio paga nominal al vencimiento → Escrow libera al inversionista.
 */

export const INVOICE_STATUSES = [
  "borrador",       // Proveedor creando/editando
  "pendiente_validacion", // En revisión por Faro
  "en_mercado",    // Listada; disponible para inversionistas
  "financiada",    // Inversionista ya pagó; escrow tiene el flujo
  "pagada",        // Negocio pagó nominal; escrow liberó al inversionista
  "vencida",       // Pasó vencimiento sin pago (disputa / cobro)
] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  borrador: "Borrador",
  pendiente_validacion: "Pendiente de validación",
  en_mercado: "En mercado",
  financiada: "Financiada",
  pagada: "Pagada",
  vencida: "Vencida",
}
