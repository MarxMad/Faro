/**
 * Tipos de usuario y roles según PRODUCT-USUARIOS-Y-FLUJO.md
 * Proveedor: sube facturas ligadas a un negocio.
 * Negocio: deudor; paga el valor nominal al vencimiento.
 * Inversionista: paga la factura con descuento (8, 9 o 10%); recibe el nominal vía escrow.
 */

export type UserRole = "proveedor" | "negocio" | "inversionista"

export const USER_ROLES: Record<
  UserRole,
  { label: string; description: string }
> = {
  proveedor: {
    label: "Proveedor",
    description:
      "Sube facturas emitidas ligadas al negocio deudor y recibe liquidez cuando un inversionista las financia.",
  },
  negocio: {
    label: "Negocio",
    description:
      "Deudor de la factura. Paga el valor nominal (100%) en la plataforma al vencimiento.",
  },
  inversionista: {
    label: "Inversionista",
    description:
      "Paga la factura con descuento (8, 9 o 10%) dando liquidez al proveedor. Recibe el nominal al vencimiento vía escrow; el descuento es su ganancia.",
  },
}

export const DISCOUNT_RATES = [8, 9, 10] as const
export type DiscountRate = (typeof DISCOUNT_RATES)[number]

/** Calcula el monto que paga el inversionista (valor nominal menos descuento %) */
export function amountAfterDiscount(
  nominalAmount: number,
  discountPercent: DiscountRate
): number {
  return nominalAmount * (1 - discountPercent / 100)
}

/** Ganancia bruta del inversionista = descuento aplicado al nominal */
export function investorGrossProfit(
  nominalAmount: number,
  discountPercent: DiscountRate
): number {
  return nominalAmount * (discountPercent / 100)
}
