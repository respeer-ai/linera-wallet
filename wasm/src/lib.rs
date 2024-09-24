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
use linera_base::{crypto::{CryptoHash, KeyPair, PublicKey}, data_types::{BlockHeight, Timestamp}, identifiers::ChainId};
use linera_chain::data_types::IncomingBundle;
use linera_core::{data_types::NodeChainInfo, node::{
    LocalValidatorNode as _,
    LocalValidatorNodeProvider as _,
}};
use linera_execution::Operation;

use log::info;
use wasm_bindgen::prelude::*;
use web_sys::*;
use serde::Serialize;

use linera_client::{chain_listener::ClientContext as _, client_options::ClientOptions, wallet::{Wallet, FakeWallet}};

// TODO convert to IndexedDbStore once we refactor Context
type WebStorage = linera_storage::DbStorage<
    linera_views::memory::MemoryStore,
    linera_storage::WallClock,
>;

pub async fn get_storage() -> Result<WebStorage, <WebStorage as linera_storage::Storage>::StoreError> {
    let root_key = &[];
    linera_storage::DbStorage::initialize(
        linera_views::memory::MemoryStoreConfig::new(1),
        "linera",
        root_key,
        None,
    ).await
}

pub async fn get_fake_storage() -> Result<WebStorage, <WebStorage as linera_storage::Storage>::StoreError> {
    let root_key = &[];
    linera_storage::MemoryStorage::initialize(
        linera_views::memory::MemoryStoreConfig::new(1),
        "linera",
        root_key,
        None,
    ).await
}

type PersistentWallet = linera_client::persistent::LocalStorage<Wallet>;
type ClientContext = linera_client::client_context::ClientContext<WebStorage, PersistentWallet>;

type MemoryFakeWallet = linera_client::persistent::Memory<FakeWallet>;
type SignClientContext = linera_client::client_context::ClientContext<WebStorage, MemoryFakeWallet>;

// TODO get from config
pub const OPTIONS: ClientOptions = ClientOptions {
    wallet_state_path: None,
    storage_config: None,
    with_wallet: None,

    // Timeout for sending queries (milliseconds)
    send_timeout: std::time::Duration::from_millis(4000),
    recv_timeout: std::time::Duration::from_millis(4000),
    max_pending_messages: 10,

    // The WebAssembly runtime to use.
    wasm_runtime: None,

    // The maximal number of simultaneous queries to the database
    max_concurrent_queries: None,

    // The maximal number of simultaneous stream queries to the database
    max_stream_queries: 10,

    // The maximal number of entries in the storage cache.
    cache_size: 1000,

    // Delay increment for retrying to connect to a validator for notifications.
    notification_retry_delay: std::time::Duration::from_millis(1000),

    // Number of times to retry connecting to a validator for notifications.
    notification_retries: 10,

    // Whether to wait until a quorum of validators has confirmed that all sent cross-chain
    // messages have been delivered.
    wait_for_outgoing_messages: false,

    // The policy for handling incoming messages.
    blanket_message_policy: linera_core::client::BlanketMessagePolicy::Accept,

    // A dummy command, for now
    command: linera_client::client_options::ClientCommand::Keygen,

    restrict_chain_ids_to: None,

    tokio_threads: Some(1),
};

pub async fn get_fake_client_context() -> Result<SignClientContext, JsError> {
    let wallet = linera_client::config::WalletState::new_no_storage(FakeWallet::new());
    Ok(SignClientContext::new_no_storage(get_fake_storage().await?, OPTIONS, wallet))
}

// pub async fn get_client_context() -> Result<ClientContext, JsError> {
//     info!(">>get_client_context");
//     let wallet = linera_client::config::WalletState::read_from_local_storage("checko-wallet")?;
//     // let wallet = linera_client::config::WalletState::new(Option<None>);
//     info!(">>get wallet successful");
//     let mut storage = get_storage().await?;
//     info!(">>get storage successful");
//     wallet.genesis_config().initialize_storage(&mut storage).await?;
//     info!(">>genesis_config successful");
//     Ok(ClientContext::new(get_storage().await?, OPTIONS, wallet))
// }

// #[wasm_bindgen]
// pub async fn dapp_query_validators() -> Result<(), JsError> {
//     let mut client_context: ClientContext = get_client_context().await?;
//     let chain_id = client_context.wallet().default_chain().expect("No default chain");

//     let mut chain_client = client_context.make_chain_client(chain_id);
//     log::info!(
//         "Querying the validators of the current epoch of chain {}",
//         chain_id
//     );
//     chain_client.synchronize_from_validators().await?;
//     log::info!("Synchronized state from validators");
//     let result = chain_client.local_committee().await;
//     client_context.update_and_save_wallet(&mut chain_client).await;
//     let committee = result?;
//     log::info!("{:?}", committee.validators());
//     let node_provider = client_context.make_node_provider();
//     for (name, state) in committee.validators() {
//         match node_provider
//             .make_node(&state.network_address)?
//             .get_version_info()
//             .await
//         {
//             Ok(version_info) => {
//                 log::info!(
//                     "Version information for validator {name:?}:{}",
//                     version_info
//                 );
//             }
//             Err(e) => {
//                 log::warn!("Failed to get version information for validator {name:?}:\n{e}")
//             }
//         }
//     }

//     Ok(())
// }

#[wasm_bindgen]
#[cfg(not(feature = "no-storage"))]
pub async fn set_wallet(wallet: &str) -> Result<(), wasm_bindgen::JsError> {
    linera_client::config::WalletState::create_from_local_storage("checko-wallet", serde_json::from_str(wallet)?)?;
    Ok(())
}

#[wasm_bindgen]
pub async fn dapp_query(n: u32) -> u32 {
    n + 1
}

// Execute operation to get
#[wasm_bindgen]
pub async fn execute_operation_with_messages_no_storage(chain_id: &str, operation: &str, messages: &str, chain_info: &str, execution_state_hash: &str, public_key: &str, next_block_height: &str, block_hash: &str, admin_id: &str, timestamp: &str) -> Result<Option<String>, JsError> {
  let _chain_id: ChainId = ChainId::from_str(chain_id)?;
  let operations: Vec<Operation> = match serde_json::from_str(operation) {
    Ok(operation) => [operation].to_vec(),
    Err(_) => Vec::new(),
  };
  let _messages: Vec<IncomingBundle> = serde_json::from_str(messages)?;
  let key_pair: Option<KeyPair> = Some(KeyPair::from_public_key(PublicKey::from_str(public_key)?));
  let _admin_id: ChainId = ChainId::from_str(admin_id)?;
  let _block_hash: Option<CryptoHash> = Some(CryptoHash::from_str(block_hash)?);
  let number = match timestamp.parse::<u64>() {
    Ok(num) => num,
    Err(_) => {
      Err(JsError::new("invalid timestamp"))?
    }
  };
  let _timestamp: Timestamp = Timestamp::from(number);
  let _next_block_height: BlockHeight = BlockHeight::from_str(next_block_height)?;
  let client_context: SignClientContext = get_fake_client_context().await?;
  let chain_client = client_context.make_chain_client_without_wallet_state(_chain_id, key_pair, _admin_id, _block_hash, _timestamp, _next_block_height);
  
  let _chain_info: Box<NodeChainInfo> = serde_json::from_str(chain_info)?;
  let _execution_state_hash: CryptoHash = CryptoHash::from_str(execution_state_hash)?;
  chain_client.execute_block_without_block_proposal_no_storage(_messages, operations, _chain_info, _execution_state_hash).await?;
  match chain_client.peek_candidate_block_proposal().await {
    Some(block_proposal) => {
      let json = serde_json::to_string(&block_proposal)?;
      log::info!("json {:?}", json);
    }
    None => {},
  }
    Ok(None)
}


// // Execute operation to get
// #[wasm_bindgen]
// pub async fn execute_operation_with_messages_without_wallet(chain_id: &str, operation: &str, messages: &str, public_key: &str, nextBlockHeight: &str, blockHash: &str, adminId: &str, timestamp: &str) -> Result<Option<String>, JsError> {
//   log::info!("----execute_operation_with_messages");
//   let chain_id: ChainId = ChainId::from_str(chain_id)?;
//   log::info!("--chain_id: {:?}", chain_id);
//   let operations: Vec<Operation> = match serde_json::from_str(operation) {
//     Ok(operation) => [operation].to_vec(),
//     Err(_) => Vec::new(),
//   };
//   log::info!("--operations: {:?}", operations);
//   log::info!("--messages: {:?}", messages);
//   let messages: Vec<IncomingBundle> = serde_json::from_str(messages)?;
//   log::info!("--get client_context");
//   let client_context: ClientContext = get_client_context().await?;
//   //   let chain_client = client_context.make_chain_client(chain_id);
// //   let key_pair = KeyPair::try_from(keyPair);
//   let key_pair: Option<KeyPair> = Some(KeyPair::from_public_key(PublicKey::from_str(public_key)?));
//   let admin_id: ChainId = ChainId::from_str(adminId)?;
//   let block_hash: Option<CryptoHash> = Some(CryptoHash::from_str(blockHash)?);
//   let number = match timestamp.parse::<u64>() {
//     Ok(num) => num,
//     Err(_) => {
//         Err(JsError::new("invalid timestamp"))?
//     }
//   };
//   let timestamp: Timestamp = Timestamp::from(number);
//   let next_block_height: BlockHeight = BlockHeight::from_str(nextBlockHeight)?;

//   let chain_client = client_context.make_chain_client_without_wallet_state(chain_id, key_pair, admin_id, block_hash, timestamp, next_block_height);
//   log::info!("--chain_client {:?}", chain_client);

//   chain_client.execute_block_without_block_proposal(messages, operations).await?;
//   match chain_client.peek_candidate_block_proposal().await {
//     Some(block_proposal) => {
//       let json = serde_json::to_string(&block_proposal)?;
//       log::info!("--json {:?}", json);
//     }
//     None => {},
//   }
//     Ok(None)
// }

// // Execute operation to get
// #[wasm_bindgen]
// pub async fn execute_operation_with_messages(chain_id: &str, operation: &str, messages: &str) -> Result<Option<String>, JsError> {
//   log::info!("----execute_operation_with_messages");
//   let chain_id: ChainId = ChainId::from_str(chain_id)?;
//   log::info!("--chain_id: {:?}", chain_id);
//   let operations: Vec<Operation> = match serde_json::from_str(operation) {
//     Ok(operation) => [operation].to_vec(),
//     Err(_) => Vec::new(),
//   };
//   log::info!("--operations: {:?}", operations);
//   log::info!("--messages: {:?}", messages);
//   let messages: Vec<IncomingBundle> = serde_json::from_str(messages)?;
//   log::info!("--get client_context");
//   let client_context: ClientContext = get_client_context().await?;
//   let chain_client = client_context.make_chain_client(chain_id);
//   log::info!("--chain_client {:?}", chain_client);

//   chain_client.execute_block_without_block_proposal(messages, operations).await?;
//   match chain_client.peek_candidate_block_proposal().await {
//     Some(block_proposal) => {
//       let json = serde_json::to_string(&block_proposal)?;
//       log::info!("--json {:?}", json);
//     }
//     None => {},
//   }
//     Ok(None)
// }


#[derive(Serialize)]
struct MnemonicKeyPair {
    mnemonic: Mnemonic,
    secret_key: String
}

#[wasm_bindgen]
pub async fn generate_key_pair(passphrase: &str) -> Result<String, JsError> {
    let mut rng = bip39::rand::thread_rng();
    let mnemonic = bip39::Mnemonic::generate_in_with(&mut rng, bip39::Language::English, 24)?;
    let secret_key = generate_key_pair_from_mnemonic(mnemonic.to_string().as_str(), passphrase).await?;
    let secret_key = secret_key.replace("\"", "");
    Ok(serde_json::to_string(&MnemonicKeyPair {
        mnemonic: mnemonic.clone(),
        secret_key
    })?)
}

#[wasm_bindgen]
pub async fn generate_key_pair_from_mnemonic(mnemonic: &str, passphrase: &str) -> Result<String, JsError> {
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

#[wasm_bindgen(start)]
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    console_log::init_with_level(log::Level::Debug).unwrap();

    log::info!("Hello World!");
}
