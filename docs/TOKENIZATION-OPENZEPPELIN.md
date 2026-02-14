# Tokenización con OpenZeppelin Stellar

Faro usa la [suite de contratos inteligentes de OpenZeppelin para Stellar Soroban](https://docs.openzeppelin.com/stellar-contracts) como base para la **tokenización de facturas** y activos reales (RWA) en la red Stellar.

## Estado actual: contrato de tokenización

En este repo hay un **contrato Soroban** en [contracts/faro_invoice_token](../contracts/faro_invoice_token/): token fungible minteable (OpenZeppelin Base + Ownable). Ver [contracts/README.md](../contracts/README.md) para build y deploy en Futurenet. **Aún no está desplegado por defecto.** La “tokenización” actual consiste en crear un **registro de factura en la API** (`POST /api/invoices`); no se mintea ningún token on-chain. Para tener facturas on-chain: despliega el contrato (ver contracts/README.md), luego el backend puede invocar `mint(provider, amount)` al tokenizar. **Trustless Work** es solo para escrow (pago negocio → inversionista), no sustituye la tokenización.

## Por qué usar OpenZeppelin desde ya

Usamos la suite de OpenZeppelin Stellar **desde el MVP** para ahorrarnos tiempo en el futuro:

- **Mismo ecosistema:** El token actual (Base + Ownable) y un futuro RWA regulado comparten las mismas dependencias y patrones; no hay que reescribir todo al pasar a KYC/compliance.
- **Auditorías y estándares:** Contratos ya auditados y alineados con buenas prácticas; menos trabajo de seguridad y migración.
- **Trayectoria clara:** Cuando haga falta regulación (KYC/AML, restricciones de transferencia), se puede extender con los [módulos RWA de OpenZeppelin](https://docs.openzeppelin.com/stellar-contracts/tokens/rwa/rwa) (Identity Verifier, Compliance, etc.) sin cambiar de stack.

## Por qué OpenZeppelin Stellar (detalle)

- **Auditorías:** Contratos revisados; [informes públicos](https://github.com/OpenZeppelin/stellar-contracts/tree/main/audits).
- **Estándares:** Implementaciones de tokens fungibles, no fungibles, RWA y Vault alineadas con buenas prácticas.
- **Control de acceso y utilidades:** Ownable, RBAC, Pausable, Upgradeable y Fee Abstraction listos para integrar.

## Componentes que usamos en Faro

| Componente OpenZeppelin | Uso en Faro |
|------------------------|-------------|
| **RWA (Real World Assets)** | Representar **facturas tokenizadas**: cada factura (o pool de facturas) como activo real con emisor, deudor, monto, vencimiento y estado. |
| **Fungible Tokens** | Opcional: derechos de cobro fraccionados o tokens de liquidez con supply fija o variable. |
| **Vault** | Opcional: custodia de activos tokenizados o colateral en USDC. |
| **Access Control (Ownable / RBAC)** | Quién puede mintear, pausar o administrar contratos (p. ej. rol de “minter” para la plataforma). |
| **Pausable** | Pausar mint/transfer en caso de emergencia o disputa. |
| **Fee Abstraction** | Permitir que usuarios paguen fees en USDC mientras un relayer cubre los XLM. |
| **Upgradeable** | Gestionar mejoras y migraciones de contratos de forma controlada. |

## Flujo técnico (resumen)

1. **Backend/Soroban:** Los contratos que representan facturas tokenizadas se implementan con OpenZeppelin Stellar (p. ej. RWA + Ownable + Pausable). Suelen vivir en un **repositorio de contratos** separado.
2. **Frontend (este repo):** La página [Tokenizar factura](/app/tokenize) recoge datos de la factura (CFDI, monto, vencimiento, tasa de descuento) y los envía al backend.
3. **Backend** valida la factura, despliega o invoca el contrato (Soroban) usando los componentes de OpenZeppelin y devuelve el identificador del token/contrato.
4. **Trustless Work (escrow)** sigue gestionando el flujo de pago negocio → inversionista; los tokens RWA representan el derecho sobre la factura.

## Enlaces

- **Documentación:** [Stellar Smart Contracts Suite | OpenZeppelin](https://docs.openzeppelin.com/stellar-contracts)
- **Get Started:** [Get Started – OpenZeppelin Stellar](https://docs.openzeppelin.com/stellar-contracts/get-started)
- **RWAs:** [Real World Assets (RWAs)](https://docs.openzeppelin.com/stellar-contracts/tokens/rwa/rwa)
- **Auditorías:** [stellar-contracts/audits](https://github.com/OpenZeppelin/stellar-contracts/tree/main/audits)

## Variables de entorno (Soroban)

Para que el frontend (o un relayer) interactúe con los contratos en Stellar:

```env
# Opcional: URL del Soroban RPC (testnet/mainnet)
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

La red (testnet/mainnet) puede tomarse de `NEXT_PUBLIC_STELLAR_NETWORK`; el Wallet Kit y Freighter ya usan la red configurada para firmar transacciones.
