# Roadmap MVP – Faro funcional

Objetivo: tener un **MVP que se pueda usar de punta a punta**: proveedor tokeniza una factura → aparece en el mercado → inversionista la financia → dashboard refleja el estado.

---

## Estado actual

| Área | Hecho | Falta |
|------|--------|--------|
| **Frontend** | Landing, auth (UI), wallet (Stellar Wallet Kit), dashboard, tokenize (3 pasos), mercado, ajustes | Conectar pantallas a datos reales |
| **Datos** | Tipos de estado de factura (`invoice-flow.ts`), roles | Modelo de factura completo, persistencia |
| **API** | — | Endpoints para facturas e inversiones |
| **Escrow** | Cliente Trustless Work en `lib/trustless-work` | Llamadas desde backend al crear inversión |
| **Auth** | Wallet conectada (dirección) | Identificar usuario por wallet; opcional SEP-10 |

---

## Fases para MVP funcional

### Fase 1: Datos y API mínima (empezar aquí)

1. **Tipos de factura**  
   Definir `Invoice`: id, proveedor (wallet), negocio (nombre/RFC), monto, moneda, vencimiento, tasa de descuento, estado, fecha de creación. Opcional: `escrowId` cuando esté financiada.

2. **API de facturas**  
   - `POST /api/invoices` — Crear factura (desde Tokenizar). Body: emisor, deudor, monto, vencimiento, tasa. Devuelve la factura con id.  
   - `GET /api/invoices` — Listar facturas (filtro opcional `status=en_mercado` para el mercado).  
   Persistencia inicial: en memoria o JSON (para desarrollo); luego sustituir por base de datos.

3. **Conectar Tokenizar**  
   Al confirmar en “Tokenizar factura”, enviar los datos del formulario a `POST /api/invoices` y redirigir al dashboard o a “mis facturas”. Mostrar éxito/error.

4. **Conectar Mercado**  
   En la página Mercado, hacer `GET /api/invoices?status=en_mercado` y mostrar las facturas en tarjetas. Sustituir el array estático `opportunities` por la respuesta de la API.

**Resultado Fase 1:** El proveedor puede “tokenizar” (crear factura) y verla en el mercado; el mercado muestra facturas reales desde la API.

---

### Fase 2: Flujo “Invertir”

5. **Detalle de factura**  
   Página o modal `/app/market/[id]`: ver una factura por id (GET desde API o lista en memoria). Botón “Invertir”.

6. **API de inversiones**  
   - `POST /api/invoices/[id]/invest` — Registrar que la wallet conectada invierte en la factura `id`.  
   - Backend: actualizar estado de la factura a `financiada`, guardar `investorAddress` (y opcionalmente llamar a Trustless Work para crear escrow).  
   - Si usas Trustless Work: crear escrow con monto nominal, `client_account` = inversionista, `provider_account` = proveedor (o cuenta de Faro); guardar `escrowId` en la factura.

7. **UI “Invertir”**  
   En Mercado (o detalle), al hacer clic en “Invertir”: comprobar wallet conectada, confirmar monto y descuento, llamar a `POST /api/invoices/[id]/invest`. Mostrar éxito y redirigir al dashboard.

**Resultado Fase 2:** Un inversionista puede elegir una factura y “financiarla”; la factura pasa a “Financiada” y (si está integrado) se crea el escrow.

---

### Fase 3: Dashboard con datos reales

8. **Mis facturas / mis inversiones**  
   - `GET /api/invoices?provider=:address` — Facturas creadas por el proveedor (wallet).  
   - `GET /api/invoices?investor=:address` — Facturas en las que invirtió la wallet.  
   (O un único `GET /api/invoices?mine=1` que use la wallet del usuario desde sesión/header.)

9. **Dashboard**  
   Usar la wallet conectada para pedir “mis facturas” e “inversiones”. Métricas: total tokenizado (suma de facturas del proveedor), facturas activas, etc. Tabla “Actividad reciente” con datos de la API.

**Resultado Fase 3:** Dashboard muestra solo datos del usuario (proveedor o inversionista) según la wallet.

---

### Fase 4: Pagar como negocio (opcional para MVP)

10. **Pago al vencimiento**  
    Para el rol “negocio”: vista “Facturas que debo” (facturas donde `debtor` coincide con el negocio registrado). Botón “Pagar nominal”.  
    - `POST /api/invoices/[id]/pay` — Marcar como “pagada” y, si hay integración con Trustless Work, indicar pago/liberar escrow (según API de Trustless Work).

11. **Identidad de negocio**  
    Necesitas ligar una wallet (o cuenta) al “negocio” (RFC/razón social). Puede ser: registro simple “soy el negocio X” asociado a mi wallet, o tabla `businesses` con wallet opcional.

**Resultado Fase 4:** El negocio puede ver facturas a su nombre y marcarlas como pagadas; el escrow puede liberar fondos al inversionista.

---

### Fase 5: Robustez y producción

12. **Persistencia**  
    Sustituir almacenamiento en memoria por base de datos (PostgreSQL, SQLite, etc.). Migraciones para tablas `invoices`, `investments` (si las separas), `businesses`.

13. **Auth**  
    - Identificación por wallet: ya tienes la dirección en el front; el backend puede aceptar `Authorization: Bearer <JWT>` donde el JWT se obtiene con SEP-10 (wallet firma challenge).  
    - O, para MVP rápido: enviar la wallet en header o body y confiar en que “quien firma la tx” es quien dice (y en producción pasar a SEP-10).

14. **Validación**  
    Validar CFDI (XML) en el backend al tokenizar: emisor, receptor, monto, fecha. Opcional: integración con SAT o servicio de validación.

15. **Contratos on-chain**  
    Cuando los contratos OpenZeppelin (RWA) estén desplegados, el backend puede invocar Soroban para mintear/registrar la factura tokenizada y guardar el `token_id` / `contract_id` en la factura.

---

## Orden sugerido para tener MVP “funcional” en poco tiempo

1. Implementar **Fase 1** (tipos, API crear/listar, conectar Tokenizar y Mercado).  
2. Implementar **Fase 2** (invertir: endpoint + UI).  
3. Implementar **Fase 3** (dashboard con datos por wallet).  
4. Añadir **persistencia** (Fase 5.12) cuando vayas a dejar de usar datos en memoria.  
5. Integrar **Trustless Work** en el paso de “Invertir” (Fase 2) si la API está disponible.  
6. Fase 4 y el resto de Fase 5 según prioridad (pagar como negocio, SEP-10, validación CFDI, contratos RWA).

---

## Resumen mínimo “MVP en 1–2 semanas”

- [ ] Tipos `Invoice` y API `POST/GET /api/invoices` con almacenamiento en memoria o JSON.  
- [ ] Tokenizar: formulario → `POST /api/invoices` → éxito/error.  
- [ ] Mercado: `GET /api/invoices?status=en_mercado` → listado en UI.  
- [x] Invertir: `POST /api/invoices/[id]/invest` + actualizar estado; opcional crear escrow.  
- [x] Dashboard: `GET /api/invoices?provider=:address` (y/o `?investor=:address`) y mostrar métricas y tabla.  
- [ ] (Opcional) Persistencia en DB y “Pagar nominal” para el negocio.

Con eso tienes un flujo cerrado: tokenizar → listar en mercado → financiar → ver en dashboard.
