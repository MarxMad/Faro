# Wallet y SEPs en Faro

## En el front: Entrar / Comenzar = conectar wallet

En la web **no pedimos ni mostramos opción de frase de recuperación (semilla)**. Pedir claves o frases semilla en un sitio web es un patrón típico de phishing y genera desconfianza. Los usuarios deben **nunca** introducir su frase en una página.

- **Entrar** (navbar) y **Comenzar** (hero) son el mismo flujo: al hacer clic se abre el modal del **Stellar Wallet Kit**, donde el usuario elige su wallet (Freighter, xBull, Albedo, Rabet, Lobstr, etc.) y autoriza en la extensión o app. La clave no se escribe en Faro.
- La lógica de derivación SEP-0005 (mnemónico) existe en código para compatibilidad o herramientas internas, pero **no se expone en la UI** del front.

Referencia: [Stellar Ecosystem Proposals – Notable SEPs](https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals#notable-seps).

## Stellar Wallet Kit

Usamos [@creit.tech/stellar-wallets-kit](https://www.npmjs.com/package/@creit.tech/stellar-wallets-kit) para unificar la conexión:

- Un solo botón de entrada (**Entrar** / **Comenzar**) que abre el modal del Kit.
- El usuario elige la wallet que prefiera (Freighter, xBull, Albedo, Rabet, Lobstr, Hana, Hot Wallet, Klever, etc.).
- Tras conectar, se persiste la dirección en `localStorage` y, desde la landing, se redirige a `/app`.

## Qué SEPs usa Faro

| SEP | Uso en Faro |
|-----|-------------|
| **SEP-0010** | **Autenticación.** El estándar correcto para “login” con Stellar: el backend envía un challenge, el usuario firma con su wallet y el servidor verifica. No se exponen claves ni frases en la web. |
| **SEP-0002** | Federation: resolver `nombre*dominio.com` a `account_id` (y memo). |
| **SEP-0006** | Deposit/Withdrawal API: depósitos y retiros con el anchor (con JWT de SEP-0010). |
| **SEP-0004** | Tx Status: consultar estado de un pago (pending, delivered, etc.). |
| **SEP-0005** | Key derivation para wallets. Lo usan **wallets** (p. ej. Freighter) para derivar claves desde una frase. Una web como Faro **no** debe pedir la frase; solo integra wallets que ya implementan SEP-0005. |

Para autenticación en producción, implementa **SEP-0010** en tu backend y que el front use el Wallet Kit (o Freighter) para firmar el challenge.

## Código

- **`lib/wallet/stellar-wallet-kit-provider.tsx`** — Provider del Stellar Wallet Kit (modal, estado, persistencia). Envuelve la app en `app/layout.tsx` vía `ClientProviders`.
- **`lib/wallet/sep-0005.ts`** — Constantes y path de derivación (uso interno).
- **`lib/wallet/adapters/freighter.ts`** — Adaptador Freighter (el Kit lo usa internamente).
- **`lib/wallet/adapters/sep5-mnemonic.ts`** — Derivación desde mnemónico (solo uso interno/dev; no se muestra en la UI).
- **`lib/wallet/wallet-context.tsx`** — Contexto legacy (opcional); el flujo principal usa el Wallet Kit.
- **`components/wallet/connect-wallet-button.tsx`** — Botón único: “Entrar” / “Comenzar” cuando no conectado; dirección + desconectar cuando conectado. Props: `label`, `redirectOnConnect`, `variant`.

## Uso del hook (Wallet Kit)

```tsx
import { useStellarWalletKit } from "@/lib/wallet"

const {
  address,
  isConnected,
  openConnectModal,
  disconnect,
  error,
  clearError,
} = useStellarWalletKit()

// Abrir modal (opcional: redirigir al conectar)
openConnectModal({ onConnected: () => router.push("/app") })
```

## Red de Stellar

La red (testnet / mainnet) se toma de `NEXT_PUBLIC_STELLAR_NETWORK` en `.env`. El Kit usa esa variable para mostrar la red correcta a la wallet.
