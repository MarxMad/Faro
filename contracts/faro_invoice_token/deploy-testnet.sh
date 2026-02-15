#!/usr/bin/env bash
# Despliega Faro Invoice Token en Stellar Testnet.
# Requiere: cargo, stellar CLI, cuenta faro-deploy creada y fondada en Testnet.
set -e
cd "$(dirname "$0")"

ADMIN_ADDRESS="${ADMIN_ADDRESS:-GD6KXIZX6PDOFTHGFJY7OCFEGV3N5EDT6UZDB5ICYHJR5Q56KIWNGOCK}"
RPC="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"

echo "Build WASM..."
cargo build --target wasm32v1-none --release

echo "Fondear faro-deploy en Testnet..."
stellar keys fund faro-deploy \
  --network testnet \
  --rpc-url "$RPC" \
  --network-passphrase "$PASSPHRASE" \
  || true

echo "Desplegando en Testnet..."
DEPLOY_OUT=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/faro_invoice_token.wasm \
  --source faro-deploy \
  --network testnet \
  --rpc-url "$RPC" \
  --network-passphrase "$PASSPHRASE" \
  -- \
  --name "Faro Invoice Token" \
  --symbol "FIT" \
  --admin "$ADMIN_ADDRESS")
CONTRACT_ID=$(echo "$DEPLOY_OUT" | tail -1)

echo ""
echo "✅ Desplegado en Testnet"
echo "FARO_INVOICE_TOKEN_CONTRACT_ID=$CONTRACT_ID"
echo ""
echo "Añade en la raíz del proyecto (.env):"
echo "FARO_INVOICE_TOKEN_CONTRACT_ID=$CONTRACT_ID"
