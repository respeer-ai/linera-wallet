/**
This module defines the client API for the Web extension.

Exported (marked with `#[wasm_bindgen]`) functions will be callable from the extension frontend.

Exported functions prefixed with `dapp_` _will additionally be
callable from all Web pages to which the Web client has been
connected_.  Outside of their type, which is checked at call time,
arguments to these functions cannot be trusted and _must_ be verified!
*/
use bip39::Mnemonic;

use abi::meme::{MemeMessage, MemeOperation};
use async_graphql::{http::parse_query_string, EmptySubscription, Schema};
use linera_base::{
    crypto::{AccountSecretKey, Hashable},
    data_types::Round,
};
use linera_chain::{data_types::{
    BlockExecutionOutcome, ProposalContent,
}, types::Block};
use linera_execution::Operation;
use linera_client::client_options::ClientContextOptions;

use serde::Serialize;
use wasm_bindgen::prelude::*;
use web_sys::wasm_bindgen;

mod fake_service;
use fake_service::{MutationRoot as ServiceMutationRoot, QueryRoot as ServiceQueryRoot};

mod fake_meme;
use fake_meme::{MutationRoot as MemeMutationRoot, QueryRoot as MemeQueryRoot};

mod signed_block;
use signed_block::SignedBlockBcs;

pub const OPTIONS: ClientContextOptions = ClientContextOptions {
    send_timeout: std::time::Duration::from_millis(4000),
    recv_timeout: std::time::Duration::from_millis(4000),
    max_pending_message_bundles: 10,
    max_loaded_chains: nonzero_lit::usize!(40),
    retry_delay: std::time::Duration::from_millis(1000),
    max_retries: 10,
    wait_for_outgoing_messages: false,
    blanket_message_policy: linera_core::client::BlanketMessagePolicy::Accept,
    restrict_chain_ids_to: None,
    long_lived_services: false,
    blob_download_timeout: std::time::Duration::from_millis(1000),
    grace_period: linera_core::DEFAULT_GRACE_PERIOD,

    // TODO(linera-protocol#2944): separate these out from the
    // `ClientOptions` struct, since they apply only to the CLI/native
    // client
    wallet_state_path: None,
    with_wallet: None,
};

#[wasm_bindgen]
pub async fn bcs_serialize_signed_block(bytes_str: &str) -> Result<String, JsError> {
    let block: SignedBlockBcs = serde_json::from_str(bytes_str)?;
    let block_bytes = bcs::to_bytes(&block)?;
    let block_str = serde_json::to_string(&block_bytes)?;
    Ok(block_str)
}

#[wasm_bindgen]
pub async fn block_payload(
    block: &str,
    round: &str,
    outcome: &str,
) -> Result<String, JsError> {
    let deserializer = &mut serde_json::Deserializer::from_str(block);
    let block: Block = serde_path_to_error::deserialize(deserializer)?;
    let (proposed_block, _) = block.into_proposal();

    let round: Round = serde_json::from_str(round)?;
    let outcome: Option<BlockExecutionOutcome> = match serde_json::from_str(outcome) {
        Ok(outcome) => Some(outcome),
        Err(_) => None,
    };
    let content = ProposalContent {
        block: proposed_block,
        round,
        outcome,
    };
    let mut message = Vec::new();
    content.write(&mut message);
    Ok(serde_json::to_string(&message)?)
}

#[derive(Serialize)]
struct MnemonicKeyPair {
    mnemonic: Mnemonic,
    secret_key: String,
}

#[wasm_bindgen]
pub async fn generate_secret_key(passphrase: &str) -> Result<String, JsError> {
    let mut rng = bip39::rand::thread_rng();
    let mnemonic = bip39::Mnemonic::generate_in_with(&mut rng, bip39::Language::English, 24)?;
    let secret_key =
        generate_secret_key_from_mnemonic(mnemonic.to_string().as_str(), passphrase).await?;
    let secret_key = secret_key.replace("\"", "");
    Ok(serde_json::to_string(&MnemonicKeyPair {
        mnemonic: mnemonic.clone(),
        secret_key,
    })?)
}

#[wasm_bindgen]
pub async fn generate_secret_key_from_mnemonic(
    mnemonic: &str,
    passphrase: &str,
) -> Result<String, JsError> {
    let mnemonic = bip39::Mnemonic::parse_normalized(mnemonic)?;
    let seed = mnemonic.to_seed(passphrase);
    use rand_chacha::rand_core::SeedableRng;
    let mut _seed = [0u8; 32];
    _seed.copy_from_slice(&seed[0..32]);
    let mut rng = rand_chacha::ChaCha20Rng::from_seed(_seed);
    let secret_key = AccountSecretKey::generate_from(&mut rng);
    let AccountSecretKey::Ed25519(secret_key) = secret_key else {
        panic!("Invalid secret key");
    };
    let key_str = format!("{}", serde_json::to_string(&secret_key)?);
    let key_str = key_str.replace("\"", "");
    Ok(key_str[..64].to_string())
}

#[wasm_bindgen]
pub async fn bcs_deserialize_meme_operation(bytes_str: &str) -> Result<String, JsError> {
    let bytes: Vec<u8> = serde_json::from_str(bytes_str)?;
    let operation: MemeOperation = bcs::from_bytes(&bytes)?;
    let operation_str = serde_json::to_string(&operation)?;
    Ok(operation_str)
}

#[wasm_bindgen]
pub async fn bcs_deserialize_meme_message(bytes_str: &str) -> Result<String, JsError> {
    let bytes: Vec<u8> = serde_json::from_str(bytes_str)?;
    let message: MemeMessage = bcs::from_bytes(&bytes)?;
    let message_str = serde_json::to_string(&message)?;
    Ok(message_str)
}

#[wasm_bindgen]
pub async fn graphql_deserialize_meme_operation(
    query: &str,
    variables: &str,
) -> Result<String, JsError> {
    let request = parse_query_string(&format!("query={}&variables={}", query, variables))?;
    let schema = Schema::new(MemeQueryRoot, MemeMutationRoot, EmptySubscription);
    let value = schema.execute(request).await.into_result().unwrap().data;
    let async_graphql::Value::Object(object) = value else {
        todo!()
    };
    let values = object.values().collect::<Vec<&async_graphql::Value>>();
    if values.len() == 0 {
        todo!()
    }
    Ok(serde_json::to_string(&values[0])?)
}

#[wasm_bindgen]
pub async fn graphql_deserialize_operation(
    query: &str,
    variables: &str,
) -> Result<String, JsError> {
    let request = parse_query_string(&format!("query={}&variables={}", query, variables))?;
    let schema = Schema::new(ServiceQueryRoot, ServiceMutationRoot, EmptySubscription);
    let value = schema.execute(request).await.into_result().unwrap().data;
    let async_graphql::Value::Object(object) = value else {
        todo!()
    };
    let values = object.values().collect::<Vec<&async_graphql::Value>>();
    if values.len() == 0 {
        todo!()
    }
    let operation: Operation = async_graphql::from_value(values[0].clone())?;
    let operation_str = serde_json::to_string(&operation)?;
    Ok(operation_str)
}

#[wasm_bindgen(start)]
pub fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    linera_base::tracing::init();
    console_log::init_with_level(log::Level::Debug).unwrap();
    log::info!("Hello Linera!");
}
