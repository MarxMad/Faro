# Contratos Soroban – Faro

Token fungible minteable para **tokenización de facturas** en Stellar. Al tokenizar una factura, el backend puede mintear tokens al proveedor (1 token = 1 unidad en 6 decimales, o el nominal en unidades mínimas).

## Requisitos

- [Rust](https://rustup.rs/) (1.84+)
- Target WASM: `rustup target add wasm32v1-none`
- [Stellar CLI](https://developers.stellar.org/docs/build/guides/cli/install-deploy) (para desplegar)

## Contrato: Faro Invoice Token

- **Carpeta:** `faro_invoice_token/`
- **Stack:** OpenZeppelin [stellar-tokens](https://crates.io/crates/stellar-tokens) (fungible Base + mint), [stellar-access](https://crates.io/crates/stellar-access) (Ownable), [stellar-macros](https://crates.io/crates/stellar-macros) (`#[only_owner]`).
- **Constructor:** `name`, `symbol`, `admin` (cuenta que podrá llamar a `mint`).
- **Mint:** Solo el `admin` puede llamar `mint(to, amount)`.

## Build

```bash
cd contracts/faro_invoice_token
cargo build --target wasm32v1-none --release
```

El WASM queda en `target/wasm32v1-none/release/faro_invoice_token.wasm`.

## Crear una wallet para desplegar

Con Stellar CLI puedes generar una keypair y usarla como `--source` y `--admin`:

1. **Generar keypair** (guarda un alias, p. ej. `faro-deploy`):
   ```bash
   stellar keys generate faro-deploy
   ```
   La clave se guarda en `~/.config/stellar/identity/faro-deploy.toml` (o `~/.config/soroban/identity/` en versiones antiguas de la CLI).

2. **Ver dirección pública (G...)** y **clave secreta (S...)**:
   ```bash
   stellar keys public-key faro-deploy
   stellar keys secret faro-deploy
   ```
   Anota la pública para el paso siguiente; la secreta la usarás en `--source` (no la compartas).

3. **Fondear en Futurenet** (elegir una opción):

   **Opción A – Stellar CLI** (reemplaza `faro-deploy` por tu alias si usaste otro):
   ```bash
   stellar keys fund faro-deploy \
     --network futurenet \
     --rpc-url https://rpc-futurenet.stellar.org \
     --network-passphrase "Test SDF Future Network ; October 2022"
   ```

   **Opción B – curl (Friendbot):** sustituye `<TU_DIRECCION_G...>` por la dirección pública del paso 2.
   ```bash
   curl "https://friendbot-futurenet.stellar.org/?addr=<TU_DIRECCION_G...>"
   ```

   **Opción C – Web:** [Friendbot Futurenet](https://friendbot-futurenet.stellar.org/) — pega la dirección pública y pulsa el botón para recibir XLM.

4. **Usar la wallet al desplegar:** en el comando de deploy usa:
   - `--source faro-deploy` (alias) **o** `--source S...` (secret key).
   - `--admin G...` con la misma dirección pública (o otra si quieres otro admin).

## Desplegar en Futurenet

1. **Instalar Stellar CLI** (si no lo tienes):
   ```bash
   curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh
   ```

2. **Crear cuenta y conseguir XLM** en Futurenet:
   - [Friendbot Futurenet](https://friendbot-futurenet.stellar.org/) (pasa tu dirección pública para recibir XLM).

3. **Desplegar** (sustituye `ADMIN_ADDRESS` por la cuenta G... que será owner/minter):
   ```bash
   stellar contract deploy \
     --wasm target/wasm32v1-none/release/faro_invoice_token.wasm \
     --source <TU_CUENTA_CLAVE> \
     --network futurenet \
     --rpc-url https://rpc-futurenet.stellar.org \
     --network-passphrase "Test SDF Future Network ; October 2022" \
     -- \
     --name "Faro Invoice Token" \
     --symbol "FIT" \
     --admin ADMIN_ADDRESS
   ```

4. Anota el **contract ID** que devuelve el deploy. Ese ID se usa en el backend para invocar `mint` al tokenizar.

## Uso desde el backend

Cuando una factura se tokeniza (p. ej. `POST /api/invoices`), el backend debería:

1. Construir una transacción Soroban que invoque `mint(provider_address, amount)` en el contrato desplegado.
2. Firmar con la cuenta **admin** (la que pasaste en `--admin`).
3. Enviar la transacción al RPC de Futurenet (o testnet/mainnet).

La cantidad `amount` puede ser el nominal en unidades mínimas (6 decimales), p. ej. `invoice.amount * 1_000_000`. El contrato usa 6 decimales.

Variables de entorno sugeridas para el backend:

```env
SOROBAN_RPC_URL=https://rpc-futurenet.stellar.org
SOROBAN_NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
FARO_INVOICE_TOKEN_CONTRACT_ID=<contract_id_del_deploy>
FARO_TOKEN_ADMIN_SECRET_KEY=<secret_key_de_la_cuenta_admin>
```

## Trustless Work vs tokenización

- **Trustless Work** = escrow (retención de fondos, negocio paga → inversionista recibe). No sustituye la tokenización.
- **Este contrato** = activo on-chain que representa la factura tokenizada (el proveedor recibe tokens al tokenizar; luego pueden listarse/transferirse en el mercado).

Ambos se usan: tokenización con este contrato + flujo de pago/escrow con Trustless Work.
