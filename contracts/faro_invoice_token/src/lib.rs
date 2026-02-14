//! Faro Invoice Token — Token fungible minteable para tokenización de facturas.
//!
//! OpenZeppelin stellar-tokens (Base + Mintable). El owner (Faro backend) puede
//! mintear tokens al proveedor cuando tokeniza una factura.
//! Unidades en 6 decimales (ej. 1_000_000 = 1 token = 1 unidad de factura).

#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, MuxedAddress, String};
use stellar_access::ownable::{self as ownable};
use stellar_macros::only_owner;
use stellar_tokens::fungible::{Base, FungibleToken};

#[contract]
pub struct FaroInvoiceToken;

#[contractimpl]
impl FaroInvoiceToken {
    /// Despliega el contrato. Llamar con Stellar CLI:
    /// stellar contract deploy --wasm target/wasm32v1-none/release/faro_invoice_token.wasm -- \
    ///   --name "Faro Invoice Token" --symbol "FIT" --admin <ADMIN_ADDRESS>
    #[allow(clippy::too_many_arguments)]
    pub fn __constructor(
        e: &Env,
        name: String,
        symbol: String,
        admin: Address,
    ) {
        Base::set_metadata(e, 6, name, symbol);
        ownable::set_owner(e, &admin);
    }

    /// Mintea tokens al destinatario (solo owner = Faro backend).
    /// Se llama cuando se tokeniza una factura: mint(provider_address, amount_in_smallest_units).
    #[only_owner]
    pub fn mint(e: &Env, to: Address, amount: i128) {
        Base::mint(e, &to, amount);
    }
}

#[contractimpl(contracttrait)]
impl FungibleToken for FaroInvoiceToken {
    type ContractType = Base;
}
