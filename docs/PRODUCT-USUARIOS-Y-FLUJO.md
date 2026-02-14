# Faro: Usuarios y flujo del producto

## Resumen

Faro conecta **proveedores** (que emiten facturas), **negocios** (deudores que las pagan) e **inversionistas** (que adelantan el pago con descuento). La plataforma liga proveedores y negocios, y permite que inversionistas compren facturas al 8%, 9% o 10% de descuento. El negocio paga el **valor nominal** al vencimiento; el escrow libera ese monto al inversionista, y la diferencia (descuento) es la ganancia del inversionista.

---

## 1. Usuarios

### 1.1 Proveedor

- **Quién es:** Empresa o persona que **emite facturas** por bienes o servicios ya entregados.
- **Qué hace en Faro:**
  - Sube facturas emitidas (ligadas al negocio deudor correspondiente).
  - Vincula su cuenta/cuenta fiscal al negocio que le debe.
  - Recibe **liquidez anticipada** cuando un inversionista paga la factura con descuento (8%, 9% o 10%).
- **Relación:** Tiene facturas por cobrar a uno o varios **negocios**.

### 1.2 Negocio (deudor)

- **Quién es:** Empresa que **debe** el pago de la factura al proveedor.
- **Qué hace en Faro:**
  - Queda **ligado** al proveedor en la plataforma (relación comercial existente).
  - No paga en el momento de la subida de la factura; paga en el **plazo acordado** (fecha de vencimiento).
  - Al vencimiento, paga en la plataforma el **valor nominal** de la factura (100%, sin descuento).
- **Relación:** Es el deudor de las facturas que el proveedor sube.

### 1.3 Inversionista

- **Quién es:** Persona o entidad que quiere invertir comprando facturas (factoraje).
- **Qué hace en Faro:**
  - En la **plataforma abierta** ve facturas disponibles.
  - Paga la factura con un **descuento** (8%, 9% o 10%) y así le da liquidez al proveedor.
  - Al vencimiento, el negocio paga el valor nominal; el **escrow** libera ese dinero al inversionista.
  - Su **ganancia** es el descuento (menos comisiones de la plataforma, si aplican).
- **Relación:** Compra el derecho de cobro de la factura; el negocio le paga a través de Faro/escrow.

---

## 2. Ligar proveedores y negocios

- Las facturas que sube el **proveedor** siempre están asociadas a un **negocio** (deudor).
- La plataforma debe:
  - Permitir al proveedor **identificar o registrar** el negocio al que le emitió la factura (RFC, razón social, etc.).
  - **Vincular** en el sistema la relación proveedor ↔ negocio para cada factura.
- Así cada factura queda con:
  - **Proveedor** (acreedor, quien sube la factura).
  - **Negocio** (deudor, quien pagará al vencimiento).

---

## 3. Flujo completo

```text
┌─────────────┐     sube factura (ligada a negocio)     ┌─────────────┐
│  Proveedor  │ ───────────────────────────────────────► │   Faro      │
└─────────────┘                                         │  (plataforma)│
       ▲                                                └──────┬──────┘
       │                                                       │
       │ liquidez anticipada (valor − descuento)                │ lista facturas
       │                                                       ▼
       │                                                ┌─────────────┐
       │     paga con 8, 9 o 10% descuento              │ Inversionista│
       └────────────────────────────────────────────────┤             │
                                                        └──────┬──────┘
                                                               │
                        al vencimiento                         │
                        negocio paga valor nominal             │
                                                               ▼
┌─────────────┐     paga 100% en plataforma            ┌─────────────┐
│   Negocio   │ ──────────────────────────────────────► │   Escrow    │
│  (deudor)   │                                         │ (Trustless  │
└─────────────┘                                         │   Work)     │
                                                       └──────┬──────┘
                                                              │
                                                              │ libera a
                                                              ▼
                                                       ┌─────────────┐
                                                       │ Inversionista│
                                                       │ (ganancia =  │
                                                       │  descuento)  │
                                                       └─────────────┘
```

### Pasos en detalle

| Paso | Actor        | Acción |
|------|--------------|--------|
| 1    | Proveedor    | Sube factura emitida y la liga al **negocio** deudor correspondiente. |
| 2    | Faro         | Valida y publica la factura en la plataforma abierta (mercado). |
| 3    | Inversionista| Elige factura y paga con **8%, 9% o 10% de descuento** (según oferta). |
| 4    | Proveedor   | **Recibe liquidez inmediata**: el pago del inversionista (valor menos descuento) se le entrega al instante. |
| 5    | Negocio     | En la **fecha de vencimiento**, paga en la plataforma el **valor nominal** (100%). Ese pago puede custodiar un **escrow**. |
| 6    | Escrow      | Recibe el pago del negocio y **libera** ese monto al **inversionista** (ganancia = descuento). |
| 7    | Resultado   | Proveedor ya cobró (liquidez). Negocio pagó la factura completa. Inversionista recibió el nominal vía escrow. |

---

## 4. Descuentos y ganancia del inversionista

- **Descuento ofrecido:** 8%, 9% o 10% sobre el valor nominal.
- **Ejemplo:** Factura de **$100,000 MXN** con 10% de descuento.
  - Inversionista paga: **$90,000** (proveedor recibe esta liquidez, menos comisiones de Faro si aplican).
  - Al vencimiento el negocio paga: **$100,000** a la plataforma/escrow.
  - Escrow entrega **$100,000** al inversionista.
  - **Ganancia bruta del inversionista:** $10,000 (el 10% de descuento).

La plataforma puede definir si el descuento lo absorbe íntegramente el proveedor o se reparte con la plataforma; el negocio **siempre paga el 100%** del valor de la factura.

---

## 5. Resumen de relaciones

| Usuario      | Relación con la factura              | Momento del dinero |
|-------------|---------------------------------------|--------------------|
| Proveedor   | Acreedor; sube y liga factura a negocio | Recibe liquidez cuando el inversionista paga (valor − descuento). |
| Negocio     | Deudor; ligado al proveedor           | Paga el 100% al vencimiento en la plataforma. |
| Inversionista | Comprador del derecho de cobro     | Paga con descuento al inicio; recibe el nominal al vencimiento vía escrow. |

---

## 6. Integración con Trustless Work (escrow)

- La **liquidez al proveedor** sale del pago del inversionista y se entrega de inmediato (no se retiene en escrow hasta que pague el negocio).
- El **escrow** protege la **segunda parte** del flujo: cuando el **negocio** paga el valor nominal al vencimiento, ese pago puede custodiar en escrow (Trustless Work) y liberarse al **inversionista** según las reglas del contrato.
- Los hitos del escrow pueden alinearse con: (1) negocio paga al vencimiento, (2) liberación al inversionista.

Este documento se puede ampliar con estados de factura (borrador, en mercado, financiada, pagada, etc.) y con los flujos de KYC/onboarding por tipo de usuario cuando los definan.
