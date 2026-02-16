# Cómo usar lib/stellarsep en Faro

Propuestas concretas para integrar **Federation (SEP-0002)**, **Tx Status (SEP-0004)** y **Transfer (SEP-0006)** en el flujo actual.

---

## 1. Federation (SEP-0002) – Dirección del deudor al tokenizar

**Dónde:** Paso «Detalles» de Tokenizar factura (`app/app/tokenize/page.tsx`).

**Qué hace:** Permitir que el proveedor ingrese la dirección del deudor como **dirección federada** (`nombre*dominio.com`) además de una cuenta `G...`. Al enviar, si el texto contiene `*`, se llama a `resolveStellarAddress()` y se guarda el `account_id` (y opcionalmente `memo`) en la factura.

**Configuración:** En `.env`:
```env
NEXT_PUBLIC_FEDERATION_SERVER_URL=https://tu-federation-server.com
```
Si no está definida, se sigue aceptando solo `G...` (sin resolver).

**Implementación:** Ver más abajo (código de ejemplo en tokenize).

---

## 2. Federation – Mostrar nombres amigables en listados

**Dónde:** Dashboard (tabla Actividad reciente), Mercado (tarjetas), detalle de factura.

**Qué hace:** Donde hoy se muestra solo `debtorName` o una dirección `G...`, opcionalmente mostrar la **dirección federada** (ej. `maria*banco.com`) haciendo **reverse lookup** con `resolveAccountId(account_id)` cuando tengas un Federation Server configurado. Si el servidor no conoce la cuenta, se sigue mostrando la dirección cortada (ej. `GABC...XYZ`).

**Implementación:** Un hook `useFederatedAddress(accountId: string | null)` que devuelve `{ federated: string | null, loading: boolean }` y que llame a `resolveAccountId` solo si hay `NEXT_PUBLIC_FEDERATION_SERVER_URL`. Usar ese valor en celdas o badges en lugar de (o junto a) la dirección raw.

---

## 3. Tx Status (SEP-0004) – Estado del pago en el anchor

**Dónde:** Flujo de pago del deudor o detalle de factura pagada.

**Qué hace:** Si en algún momento guardas el **transaction id** de Stellar del pago (por ejemplo cuando el deudor paga on-chain o cuando el anchor procesa un depósito), puedes consultar `getTxStatus(txId)` contra el **AUTH_SERVER** del receptor para mostrar estado: `pending`, `delivered`, `failed`, etc.

**Configuración:** En `.env`:
```env
NEXT_PUBLIC_AUTH_SERVER_URL=https://auth.tu-anchor.com
```

**Implementación:** Opcional. Requiere que tu flujo guarde un `paymentTxId` en la factura o en otro modelo. Luego, en la UI de «Factura pagada» o en el dashboard, llamar a `getTxStatus(paymentTxId)` y mostrar un badge con el estado.

---

## 4. Transfer (SEP-0006) – Depositar / Retirar con un anchor

**Dónde:** Nueva sección o página, por ejemplo «Fondos» en el dashboard o en Ajustes.

**Qué hace:** Permitir al usuario **depositar** (fiat → USDC) y **retirar** (USDC → fiat) usando el **TRANSFER_SERVER** de un anchor. Se usan `getTransferInfo()`, `getDeposit()`, `getWithdraw()`, `getTransaction()`, `getTransactions()`. La autenticación suele ser JWT (SEP-10); el backend debería exponer un endpoint que devuelva el JWT tras validar la wallet.

**Configuración:** En `.env`:
```env
NEXT_PUBLIC_TRANSFER_SERVER_URL=https://transfer.tu-anchor.com
```

**Implementación:** Una página `app/app/fondos/page.tsx` (o dentro de settings) que:
1. Llame a `getTransferInfo()` para mostrar activos y si depósito/retiro están habilitados.
2. Para depósito: formulario que llame a `getDeposit({ asset_code, account, ... }, jwt)` y muestre instrucciones o redirección.
3. Para retiro: `getWithdraw(...)` y seguir el flujo del anchor.
4. Listar transacciones con `getTransactions(account, jwt)`.

---

## Resumen de prioridad

| Uso              | Archivo lib/stellarsep | Dónde en Faro              | Prioridad |
|------------------|------------------------|----------------------------|-----------|
| Resolver deudor  | federation.ts         | Tokenize (campo dirección) | Alta      |
| Nombre federado  | federation.ts         | Dashboard, mercado, detalle| Media     |
| Tx status        | tx-status.ts          | Pago / factura pagada      | Baja*     |
| Depósito/Retiro  | transfer.ts           | Nueva página Fondos        | Baja**    |

\* Útil cuando el pago pase por un anchor que exponga `tx_status`.  
\** Útil cuando quieras onboarding/offboarding de liquidez vía un anchor.

---

## Enlaces

- [SEP-0002 Federation](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0002.md)
- [SEP-0004 Tx Status](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0004.md)
- [SEP-0006 Deposit/Withdrawal](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0006.md)
- Documentación interna: `docs/SEP-AND-TRUSTLESS-WORK.md`
