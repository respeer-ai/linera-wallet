use bip39::Mnemonic;
/**
This module defines the client API for the Web extension.

Exported (marked with `#[wasm_bindgen]`) functions will be callable from the extension frontend.

Exported functions prefixed with `dapp_` _will additionally be
callable from all Web pages to which the Web client has been
connected_.  Outside of their type, which is checked at call time,
arguments to these functions cannot be trusted and _must_ be verified!
*/
use std::str::FromStr;

use async_graphql::{http::parse_query_string, EmptySubscription, Schema};
use linera_base::{
    crypto::{CryptoHash, KeyPair, PublicKey},
    data_types::{BlockHeight, OracleResponse, Round, Timestamp},
    identifiers::{ApplicationId, ChainId},
};
use linera_chain::data_types::{Block, IncomingBundle, ProposalContent};
use linera_execution::Operation;
use linera_views::crypto::Hashable;
use spec::erc20::{ERC20Message, ERC20Operation};

use serde::Serialize;
use wasm_bindgen::prelude::*;
use web_sys::*;

mod fake_service;
use fake_service::{MutationRoot, QueryRoot};

#[cfg(feature = "no-storage")]
use linera_client::fake_wallet::FakeWallet;
#[cfg(not(feature = "no-storage"))]
use linera_client::wallet::Wallet;
use linera_client::{chain_listener::ClientContext as _, client_options::ClientOptions};

// TODO convert to IndexedDbStore once we refactor Context
type WebStorage =
    linera_storage::DbStorage<linera_views::memory::MemoryStore, linera_storage::WallClock>;

pub async fn get_storage() -> Result<WebStorage, JsError> {
    let root_key = &[];
    Ok(linera_storage::DbStorage::new(
        linera_views::memory::MemoryStoreConfig::new(1),
        "linera",
        root_key,
        None,
    )
    .await?)
}

#[cfg(not(feature = "no-storage"))]
type PersistentWallet = linera_client::persistent::LocalStorage<Wallet>;
#[cfg(not(feature = "no-storage"))]
type ClientContext = linera_client::client_context::ClientContext<WebStorage, PersistentWallet>;

#[cfg(feature = "no-storage")]
type MemoryFakeWallet = linera_client::persistent::Memory<FakeWallet>;
#[cfg(feature = "no-storage")]
type SignClientContext = linera_client::client_context::ClientContext<WebStorage, MemoryFakeWallet>;

// TODO get from config
pub const OPTIONS: ClientOptions = ClientOptions {
    wallet_state_path: None,
    storage_config: None,
    with_wallet: None,

    // Timeout for sending queries (milliseconds)
    send_timeout: std::time::Duration::from_millis(4000),
    recv_timeout: std::time::Duration::from_millis(4000),
    max_pending_message_bundles: 10,

    // The WebAssembly runtime to use.
    wasm_runtime: None,

    // The maximal number of simultaneous queries to the database
    max_concurrent_queries: None,

    // The maximal number of simultaneous stream queries to the database
    max_stream_queries: 10,

    // The maximal number of entries in the storage cache.
    cache_size: 1000,

    // Delay increment for retrying to connect to a validator for notifications.
    retry_delay: std::time::Duration::from_millis(1000),

    // Number of times to retry connecting to a validator for notifications.
    max_retries: 10,

    // Whether to wait until a quorum of validators has confirmed that all sent cross-chain
    // messages have been delivered.
    wait_for_outgoing_messages: false,

    // The policy for handling incoming messages.
    blanket_message_policy: linera_core::client::BlanketMessagePolicy::Accept,

    // A dummy command, for now
    command: linera_client::client_options::ClientCommand::Keygen,

    restrict_chain_ids_to: None,

    long_lived_services: false,

    tokio_threads: Some(1),
};

#[cfg(not(feature = "no-storage"))]
pub async fn get_client_context() -> Result<ClientContext, JsError> {
    let wallet = linera_client::config::WalletState::read_from_local_storage("linera-wallet")?;
    let mut storage = get_storage().await?;
    wallet
        .genesis_config()
        .initialize_storage(&mut storage)
        .await?;
    Ok(ClientContext::new(get_storage().await?, OPTIONS, wallet))
}

pub async fn get_fake_client_context() -> Result<SignClientContext, JsError> {
    let wallet = linera_client::config::WalletState::new(FakeWallet::new());
    let storage = get_storage().await?;
    Ok(SignClientContext::new(storage, OPTIONS, wallet))
}

#[wasm_bindgen]
#[cfg(not(feature = "no-storage"))]
pub async fn dapp_query_validators() -> Result<(), JsError> {
    let mut client_context: ClientContext = get_client_context().await?;
    let chain_id = client_context
        .wallet()
        .default_chain()
        .expect("No default chain");

    let mut chain_client = client_context.make_chain_client(chain_id);
    log::info!(
        "Querying the validators of the current epoch of chain {}",
        chain_id
    );
    chain_client.synchronize_from_validators().await?;
    log::info!("Synchronized state from validators");
    let result = chain_client.local_committee().await;
    client_context
        .update_and_save_wallet(&mut chain_client)
        .await;
    let committee = result?;
    log::info!("{:?}", committee.validators());
    let node_provider = client_context.make_node_provider();
    for (name, state) in committee.validators() {
        match node_provider
            .make_node(&state.network_address)?
            .get_version_info()
            .await
        {
            Ok(version_info) => {
                log::info!(
                    "Version information for validator {name:?}:{}",
                    version_info
                );
            }
            Err(e) => {
                log::warn!("Failed to get version information for validator {name:?}:\n{e}")
            }
        }
    }

    Ok(())
}

#[wasm_bindgen]
pub async fn set_wallet(wallet: &str) -> Result<(), wasm_bindgen::JsError> {
    #[cfg(not(feature = "no-storage"))]
    linera_client::config::WalletState::create_from_local_storage(
        "linera-wallet",
        serde_json::from_str(wallet)?,
    )?;
    Ok(())
}

#[wasm_bindgen]
pub async fn dapp_query(n: u32) -> u32 {
    n + 1
}

#[wasm_bindgen]
pub async fn application_creation_chain_id(application_id: &str) -> Result<String, JsError> {
    let application_id: ApplicationId = ApplicationId::from_str(application_id)?;
    Ok(application_id.creation.chain_id.to_string())
}

#[wasm_bindgen]
pub async fn executed_block_payload(
    block: &str,
    round: &str,
    oracle_responses: &str,
) -> Result<String, JsError> {
    let deserializer = &mut serde_json::Deserializer::from_str(block);
    let block: Block = serde_path_to_error::deserialize(deserializer)?;

    let round: Round = serde_json::from_str(round)?;
    let oracle_responses: Option<Vec<Vec<OracleResponse>>> =
        match serde_json::from_str(oracle_responses) {
            Ok(responses) => Some(responses),
            Err(_) => None,
        };
    let content = ProposalContent {
        block,
        round,
        forced_oracle_responses: oracle_responses,
    };
    let mut message = Vec::new();
    content.write(&mut message);
    Ok(serde_json::to_string(&message)?)
}

// Execute operation to get
#[wasm_bindgen]
#[cfg(feature = "no-storage")]
pub async fn construct_block(
    chain_id: &str,
    public_key: &str,
    admin_id: &str,
    block_hash: &str,
    operations: &str,
    incoming_bundles: &str,
    local_time: u64,
    next_block_height: u64,
) -> Result<Option<String>, JsError> {
    let chain_id: ChainId = ChainId::from_str(chain_id)?;
    let operations: Vec<Operation> = serde_json::from_str(operations)?;
    let incoming_bundles: Vec<IncomingBundle> = serde_json::from_str(incoming_bundles)?;
    let client_context: SignClientContext = get_fake_client_context().await?;
    let key_pair = KeyPair::from_public_key(PublicKey::from_str(public_key)?);
    let admin_id: ChainId = ChainId::from_str(admin_id)?;
    let block_hash: Option<CryptoHash> = Some(CryptoHash::from_str(block_hash)?);

    let chain_client = client_context.make_chain_client_ext(
        chain_id,
        key_pair,
        admin_id,
        block_hash,
        Timestamp::from(local_time),
        BlockHeight::from(next_block_height),
    )?;

    let executed_block = chain_client
        .execute_block_with_full_materials(
            operations.clone(),
            incoming_bundles,
            Timestamp::from(local_time),
        )
        .await?;

    let json = serde_json::to_string(&executed_block)?;
    Ok(Some(String::from(json)))
}

#[derive(Serialize)]
struct MnemonicKeyPair {
    mnemonic: Mnemonic,
    secret_key: String,
}

#[wasm_bindgen]
pub async fn generate_key_pair(passphrase: &str) -> Result<String, JsError> {
    let mut rng = bip39::rand::thread_rng();
    let mnemonic = bip39::Mnemonic::generate_in_with(&mut rng, bip39::Language::English, 24)?;
    let secret_key =
        generate_key_pair_from_mnemonic(mnemonic.to_string().as_str(), passphrase).await?;
    let secret_key = secret_key.replace("\"", "");
    Ok(serde_json::to_string(&MnemonicKeyPair {
        mnemonic: mnemonic.clone(),
        secret_key,
    })?)
}

#[wasm_bindgen]
pub async fn generate_key_pair_from_mnemonic(
    mnemonic: &str,
    passphrase: &str,
) -> Result<String, JsError> {
    let mnemonic = bip39::Mnemonic::parse_normalized(mnemonic)?;
    let seed = mnemonic.to_seed(passphrase);
    use rand_chacha::rand_core::SeedableRng;
    let mut _seed = [0u8; 32];
    _seed.copy_from_slice(&seed[0..32]);
    let mut rng = rand_chacha::ChaCha20Rng::from_seed(_seed);
    let key_pair = KeyPair::generate_from(&mut rng);
    let key_str = format!("{}", serde_json::to_string(&key_pair)?);
    let key_str = key_str.replace("\"", "");
    Ok(key_str[..64].to_string())
}

#[wasm_bindgen]
pub async fn bcs_deserialize_erc20_operation(bytes_str: &str) -> Result<String, JsError> {
    let bytes: Vec<u8> = serde_json::from_str(bytes_str)?;
    let operation: ERC20Operation = bcs::from_bytes(&bytes)?;
    let operation_str = serde_json::to_string(&operation)?;
    Ok(operation_str)
}

#[wasm_bindgen]
pub async fn bcs_deserialize_erc20_message(bytes_str: &str) -> Result<String, JsError> {
    let bytes: Vec<u8> = serde_json::from_str(bytes_str)?;
    let message: ERC20Message = bcs::from_bytes(&bytes)?;
    let message_str = serde_json::to_string(&message)?;
    Ok(message_str)
}

#[wasm_bindgen]
pub async fn graphql_deserialize_operation(
    query: &str,
    variables: &str,
) -> Result<String, JsError> {
    let request = parse_query_string(&format!("query={}&variables={}", query, variables))?;
    let schema = Schema::new(QueryRoot, MutationRoot, EmptySubscription);
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
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    console_log::init_with_level(log::Level::Debug).unwrap();

    log::info!("Hello World!");
}
