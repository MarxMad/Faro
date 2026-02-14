# Integración Stellar SEP y Trustless Work

Referencia general: [Stellar Ecosystem Proposals (SEPs)](https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals#notable-seps).

## Qué SEPs usa Faro (y cuáles no en el front)

- **SEP-0010 (Stellar Authentication):** Autenticación recomendada. El usuario firma un challenge con su wallet; el backend verifica. No se piden claves ni frases en la web.
- **SEP-0002, SEP-0004, SEP-0006:** Federation, Tx Status y Deposit/Withdrawal — usados en backend o desde el front contra tu anchor (con JWT de SEP-0010).
- **SEP-0005 (Key Derivation):** Estándar para wallets que derivan claves desde mnemónico. Faro **no** pide frase de recuperación en la UI; la entrada es **Entrar** / **Comenzar** con el [Stellar Wallet Kit](https://www.npmjs.com/package/@creit.tech/stellar-wallets-kit) (Freighter, xBull, etc.). Ver [WALLET-SEP-0005.md](./WALLET-SEP-0005.md).

---

## Stellar Ecosystem Proposals (SEP)

### SEP-0002 – Federation

- **Qué hace:** Resuelve direcciones tipo `nombre*dominio.com` a `account_id` (y al revés, o por `txid`).
- **En Faro:** Útil para mostrar “pagado a María*banco.com” en lugar de una cuenta G... y para validar destinatarios.
- **Configuración:** En tu backend/anchor debes tener un **Federation Server** (o usar uno existente). En `.env` del front:

```env
NEXT_PUBLIC_FEDERATION_SERVER_URL=https://tu-federation-server.com
```

- **Uso en código:**

```ts
import { resolveStellarAddress, resolveAccountId } from "@/lib/stellarsep"

const record = await resolveStellarAddress("bob*stellar.org")
// record.account_id, record.memo_type, record.memo
```

### SEP-0004 – Tx Status

- **Qué hace:** El **receptor** del pago expone `AUTH_SERVER/tx_status?id=tx_id` y devuelve el estado del pago (pending, delivered, failed, refunded, etc.).
- **En Faro:** Para que el usuario que envía vea si el pago ya fue recibido/entregado por la contraparte.
- **Configuración:** El receptor debe definir `AUTH_SERVER` en su `stellar.toml`. En tu app (si tú eres el receptor o consultas a otro):

```env
NEXT_PUBLIC_AUTH_SERVER_URL=https://auth.tu-anchor.com
```

- **Uso:**

```ts
import { getTxStatus } from "@/lib/stellarsep"

const status = await getTxStatus("stellar_tx_hash...")
// status.status => "pending" | "delivered" | "failed" | ...
```

### SEP-0006 – Deposit / Withdrawal

- **Qué hace:** API estándar de depósitos y retiros (anchor). Endpoints: `/info`, `/deposit`, `/withdraw`, `/transaction`, `/transactions`.
- **En Faro:** Para flujos “depositar fiat → recibir token” y “enviar token → retirar fiat” desde tu anchor.
- **Configuración:** Tu anchor debe tener `TRANSFER_SERVER` en `stellar.toml` e implementar los endpoints. En el front:

```env
NEXT_PUBLIC_TRANSFER_SERVER_URL=https://transfer.tu-anchor.com
```

- **Uso:**

```ts
import {
  getTransferInfo,
  getDeposit,
  getWithdraw,
  getTransaction,
  getTransactions,
} from "@/lib/stellarsep"

const info = await getTransferInfo()
const deposit = await getDeposit(
  { asset_code: "USDC", account: "G...", funding_method: "WIRE" },
  jwt
)
const tx = await getTransaction(deposit.id!, jwt)
```

**Nota:** La autenticación JWT suele obtenerse con [SEP-10](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md). Implementa el flujo SEP-10 en tu backend y pasa el JWT a estas funciones.

---

## Trustless Work – Escrow

- **Qué es:** Escrow sin custodia con hitos (milestones), aprobaciones y disputas. Contratos en Stellar Soroban, USDC.
- **En Faro:** Puedes usarlo para pagos entre inversor y PyME con liberación por hitos (por ejemplo: factura verificada → hito 1; factura cobrada → hito 2).

### Configuración

```env
NEXT_PUBLIC_TRUSTLESS_WORK_API_URL=https://api.trustlesswork.com
TRUSTLESS_WORK_API_KEY=tu_api_key_si_la_api_lo_requiere
```

- Las llamadas que modifican estado (crear escrow, aprobar milestone) deberían hacerse desde tu **backend** con `TRUSTLESS_WORK_API_KEY` para no exponer la clave.

### Integración en Faro: escrow al invertir

Cuando un **inversionista** financia una factura (`POST /api/invoices/[id]/invest`), el backend crea un escrow en Trustless Work **si**:

- La factura tiene **dirección Stellar del deudor** (`debtorAddress`): es la cuenta del negocio que pagará el nominal al vencimiento.
- Están configuradas `NEXT_PUBLIC_TRUSTLESS_WORK_API_URL` y `TRUSTLESS_WORK_API_KEY`.

El escrow se crea con: `client_account` = deudor (negocio), `provider_account` = inversionista, `amount` = nominal en unidades mínimas (6 decimales). Así, cuando el negocio pague en Trustless Work, el inversionista recibe el nominal. Si no hay `debtorAddress` o falla la API, la inversión se registra igual en Faro pero sin `escrowId`. En el formulario de tokenizar hay un campo opcional **“Dirección Stellar del deudor”** para que el proveedor lo indique cuando el negocio tenga cuenta Stellar.

### Uso

```ts
import { createEscrow, getEscrow, approveMilestone } from "@/lib/trustless-work"

const escrow = await createEscrow({
  amount: "1000000000", // 1000 USDC (6 decimals)
  client_account: "G...",  // inversor
  provider_account: "G...", // PyME
  description: "Financiación factura FAC-001",
  milestones: [
    { amount: "500000000", description: "Hito 1: Factura verificada" },
    { amount: "500000000", description: "Hito 2: Factura cobrada" },
  ],
})

await approveMilestone(escrow.id, milestoneId)
```

- La API real de Trustless Work puede usar rutas o cuerpos distintos; ajusta `lib/trustless-work/client.ts` según su [documentación](https://docs.trustlesswork.com/trustless-work) o Swagger cuando esté disponible.

---

## Resumen de variables de entorno

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_FEDERATION_SERVER_URL` | SEP-0002 Federation |
| `NEXT_PUBLIC_AUTH_SERVER_URL` | SEP-0004 Tx Status |
| `NEXT_PUBLIC_TRANSFER_SERVER_URL` | SEP-0006 Deposit/Withdrawal |
| `NEXT_PUBLIC_TRUSTLESS_WORK_API_URL` | Trustless Work API |
| `TRUSTLESS_WORK_API_KEY` | Trustless Work (server-side) |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` \| `mainnet` (opcional) |

Tu backend/anchor debe implementar los endpoints indicados en cada SEP y publicar `stellar.toml` con `FEDERATION_SERVER`, `AUTH_SERVER` y `TRANSFER_SERVER` según corresponda.
