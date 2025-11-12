/**
This module defines the client API for the Web extension.

Exported (marked with `#[wasm_bindgen]`) functions will be callable from the extension frontend.

Exported functions prefixed with `dapp_` _will additionally be
callable from all Web pages to which the Web client has been
connected_.  Outside of their type, which is checked at call time,
arguments to these functions cannot be trusted and _must_ be verified!
*/
use std::time::Duration;

use bip39::Mnemonic;

use abi::meme::{MemeMessage, MemeOperation};
use async_graphql::{http::parse_query_string, EmptySubscription, Schema};
use linera_base::{
    crypto::{AccountSecretKey, Hashable},
    data_types::ChainDescription,
};
use linera_chain::{
    data_types::{
        OperationMetadata, ProposalContent, ProposedBlock, Transaction, TransactionMetadata,
    },
    wrapper_block::{WrapperProposalContent, WrapperProposedBlock},
};
use linera_client::client_options::ClientContextOptions;
use linera_execution::Operation;

use serde::Serialize;
use wasm_bindgen::prelude::*;
use web_sys::wasm_bindgen;

mod fake_service;
use fake_service::{MutationRoot as ServiceMutationRoot, QueryRoot as ServiceQueryRoot};

mod fake_meme;
use fake_meme::{MutationRoot as MemeMutationRoot, QueryRoot as MemeQueryRoot};

mod signed_block;

pub const OPTIONS: ClientContextOptions = ClientContextOptions {
    send_timeout: linera_base::time::Duration::from_millis(4000),
    recv_timeout: linera_base::time::Duration::from_millis(4000),
    max_pending_message_bundles: 10,
    retry_delay: linera_base::time::Duration::from_millis(1000),
    max_retries: 10,
    wait_for_outgoing_messages: false,
    blanket_message_policy: linera_core::client::BlanketMessagePolicy::Accept,
    restrict_chain_ids_to: None,
    long_lived_services: false,
    blob_download_timeout: linera_base::time::Duration::from_millis(1000),
    certificate_batch_download_timeout: linera_base::time::Duration::from_millis(1000),
    certificate_download_batch_size: linera_core::client::DEFAULT_CERTIFICATE_DOWNLOAD_BATCH_SIZE,
    sender_certificate_download_batch_size:
        linera_core::client::DEFAULT_SENDER_CERTIFICATE_DOWNLOAD_BATCH_SIZE,
    chain_worker_ttl: Duration::from_secs(30),
    sender_chain_worker_ttl: Duration::from_millis(200),
    grace_period: linera_core::DEFAULT_GRACE_PERIOD,
    max_joined_tasks: 100,
    max_accepted_latency_ms: linera_core::client::requests_scheduler::MAX_ACCEPTED_LATENCY_MS,
    cache_ttl_ms: linera_core::client::requests_scheduler::CACHE_TTL_MS,
    cache_max_size: linera_core::client::requests_scheduler::CACHE_MAX_SIZE,
    max_request_ttl_ms: linera_core::client::requests_scheduler::MAX_REQUEST_TTL_MS,
    alpha: linera_core::client::requests_scheduler::ALPHA_SMOOTHING_FACTOR,
    alternative_peers_retry_delay_ms: linera_core::client::requests_scheduler::STAGGERED_DELAY_MS,

    // TODO(linera-protocol#2944): separate these out from the
    // `ClientOptions` struct, since they apply only to the CLI/native
    // client
    wallet_state_path: None,
    keystore_path: None,
    with_wallet: None,
    chrome_trace_exporter: false,
    chrome_trace_file: None,
    otlp_exporter_endpoint: None,
};

#[wasm_bindgen]
pub async fn block_payload(content: &str) -> Result<String, JsError> {
    let deserializer = &mut serde_json::Deserializer::from_str(content);
    let content: WrapperProposalContent = serde_path_to_error::deserialize(deserializer)?;

    let WrapperProposalContent {
        block,
        round,
        outcome,
    } = content;
    let WrapperProposedBlock {
        chain_id,
        epoch,
        transactions,
        height,
        timestamp,
        authenticated_signer,
        previous_block_hash,
    } = block;

    let content = ProposalContent {
        block: ProposedBlock {
            chain_id,
            epoch,
            transactions,
            height,
            timestamp,
            authenticated_signer,
            previous_block_hash,
        },
        round,
        outcome,
    };

    let mut message = Vec::new();
    content.write(&mut message);
    Ok(serde_json::to_string(&message)?)
}

#[wasm_bindgen]
pub async fn deserialize_proposal_content(content: &str) -> Result<String, JsError> {
    let deserializer = &mut serde_json::Deserializer::from_str(content);
    let content: WrapperProposalContent = serde_path_to_error::deserialize(deserializer)?;

    Ok(serde_json::to_string(&content)?)
}

#[wasm_bindgen]
pub async fn chain_description_id(chain_description: &str) -> Result<String, JsError> {
    let deserializer = &mut serde_json::Deserializer::from_str(chain_description);
    let chain_description: ChainDescription = serde_path_to_error::deserialize(deserializer)?;
    let id = chain_description.id();
    Ok(serde_json::to_string(&id)?.replace("\"", ""))
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
        return Err(JsError::new("Invalid query"));
    };
    let values = object.values().collect::<Vec<&async_graphql::Value>>();
    if values.len() == 0 {
        return Err(JsError::new("Invalid query"));
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
        return Err(JsError::new("Invalid query"));
    };
    let values = object.values().collect::<Vec<&async_graphql::Value>>();
    if values.len() == 0 {
        return Err(JsError::new("Invalid query"));
    }
    let operation: Operation = async_graphql::from_value(values[0].clone())?;
    let operation_str = serde_json::to_string(&operation)?;
    Ok(operation_str)
}

#[wasm_bindgen]
pub async fn operation_metadata(operation: &str) -> Result<String, JsError> {
    let deserializer = &mut serde_json::Deserializer::from_str(operation);
    let operation: Operation = serde_path_to_error::deserialize(deserializer)?;
    let metadata = OperationMetadata::from(&operation);
    Ok(serde_json::to_string(&metadata)?)
}

#[wasm_bindgen]
pub async fn transaction_metadata(transaction: &str) -> Result<String, JsError> {
    let deserializer = &mut serde_json::Deserializer::from_str(transaction);
    let transaction: Transaction = serde_path_to_error::deserialize(deserializer)?;
    let metadata = TransactionMetadata::from_transaction(&transaction);
    Ok(serde_json::to_string(&metadata)?)
}

#[wasm_bindgen(start)]
pub fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    linera_base::tracing::init();
    console_log::init_with_level(log::Level::Debug).unwrap();
    log::info!("Hello Linera!");
}
