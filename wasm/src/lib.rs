/**
This module defines the client API for the Web extension.

Exported (marked with `#[wasm_bindgen]`) functions will be callable from the extension frontend.

Exported functions prefixed with `dapp_` _will additionally be
callable from all Web pages to which the Web client has been
connected_.  Outside of their type, which is checked at call time,
arguments to these functions cannot be trusted and _must_ be verified!
*/

use linera_base::{
    crypto::{CryptoRng, CryptoHash, KeyPair, PublicKey},
    data_types::{Amount, BlockHeight, Timestamp},
    identifiers::{
        ChainDescription,
        ChainId,
    },
};
use linera_chain::data_types::IncomingMessage;
use linera_core::{
    client::{ArcChainClient, ChainClient, Client}, data_types::RawBlockProposal, node::{
        CrossChainMessageDelivery, LocalValidatorNode as _, LocalValidatorNodeProvider as _
    }
};
use linera_execution::Operation;
use linera_rpc::node_provider::{NodeOptions, NodeProvider};
use linera_views::views::ViewError;


use linera_storage::Storage;
use wasm_bindgen::prelude::*;
use web_sys::*;
use local_encoding::{Encoding, Encoder};

use std::{collections::{BTreeMap, HashMap}, str::FromStr};
use std::sync::{RwLock, Arc};
use std::time::Duration;
use tokio::task::JoinSet;

mod config;
mod options;
mod wallet;

use options::ClientOptions;
use wallet::Wallet;

type ChainClients<P, S> = std::collections::BTreeMap<ChainId, ArcChainClient<P, S>>;

// TODO convert to IndexedDbStore once we refactor Context
type WebStorage = linera_storage::DbStorage<
    linera_views::memory::MemoryStore,
    linera_storage::WallClock,
>;

pub async fn get_storage() -> Result<WebStorage, <WebStorage as linera_storage::Storage>::ContextError> {
    linera_storage::DbStorage::new(
        linera_views::memory::MemoryStoreConfig::new(1),
        "linera",
        None,
    ).await
}

pub struct ClientContext<S>
where
    S: linera_storage::Storage,
    ViewError: From<S::ContextError>,
{
    wallet_state: WalletState,
    client: Arc<Client<NodeProvider, S>>,
    send_timeout: Duration,
    recv_timeout: Duration,
    notification_retry_delay: Duration,
    notification_retries: u32,
    chain_listeners: JoinSet<()>,
}

impl<S> ClientContext<S>
where
    S: Storage + Clone + Send + Sync + 'static,
    ViewError: From<S::ContextError>,
{
    fn wallet_state(&self) -> &WalletState {
        &self.wallet_state
    }

    pub fn new(storage: S, options: &ClientOptions, wallet_state: WalletState) -> Self {
        let node_options = NodeOptions {
            send_timeout: options.send_timeout,
            recv_timeout: options.recv_timeout,
            notification_retry_delay: options.notification_retry_delay,
            notification_retries: options.notification_retries,
        };
        let node_provider = NodeProvider::new(node_options);
        let delivery = CrossChainMessageDelivery::new(options.wait_for_outgoing_messages);
        let client = Arc::new(
            Client::new(
                node_provider,
                storage,
                options.max_pending_messages,
                delivery,
            )
            .with_message_policy(options.message_policy),
        );
        ClientContext {
            client,
            wallet_state,
            send_timeout: options.send_timeout,
            recv_timeout: options.recv_timeout,
            notification_retry_delay: options.notification_retry_delay,
            notification_retries: options.notification_retries,
            chain_listeners: JoinSet::new(),
        }
    }

    fn make_chain_client(&self, chain_id: ChainId) -> ChainClient<NodeProvider, S> {
      let chain = self
          .wallet_state.0
          .get(chain_id)
          .unwrap_or_else(|| panic!("Unknown chain: {}", chain_id));
      let known_key_pairs = chain
          .key_pair
          .as_ref()
          .map(|kp| kp.copy())
          .into_iter()
          .collect();
      self.client.build(
          chain_id,
          known_key_pairs,
          self.wallet_state.0.genesis_admin_chain(),
          chain.block_hash,
          chain.timestamp,
          chain.next_block_height,
          chain.pending_block.clone(),
          chain.pending_blobs.clone(),
      )
  }

    fn update_wallet_for_new_chain(
        &mut self,
        chain_id: ChainId,
        key_pair: Option<KeyPair>,
        timestamp: Timestamp,
    ) {
        if self.wallet_state.0.get(chain_id).is_none() {
            self.wallet_state.0.insert(wallet::UserChain {
                chain_id,
                key_pair: key_pair.as_ref().map(|kp| kp.copy()),
                block_hash: None,
                timestamp,
                next_block_height: BlockHeight::ZERO,
                pending_block: None,
                pending_blobs: BTreeMap::default(),
            });
        }
    }

    pub async fn update_and_save_wallet<'a>(&mut self, state: &mut ChainClient<NodeProvider, S>)
    where
        S: linera_storage::Storage + Clone + Send + Sync + 'static,
        linera_views::views::ViewError: From<S::ContextError>,
    {
        self.wallet_state.0.update_from_state(state).await;
        self.wallet_state.write();
    }

    pub fn make_node_provider(&self) -> NodeProvider {
        NodeProvider::new(self.make_node_options())
    }

    fn make_node_options(&self) -> NodeOptions {
        NodeOptions {
            send_timeout: self.send_timeout,
            recv_timeout: self.recv_timeout,
            notification_retry_delay: self.notification_retry_delay,
            notification_retries: self.notification_retries,
        }
    }
}

pub async fn get_client_context(wallet: &Wallet) -> Result<ClientContext<WebStorage>, JsError> {
    let mut storage = get_storage().await.expect("invalid storage");
    // TODO get from config
    let options: ClientOptions = options::OPTIONS;

    Ok(ClientContext::new(storage, &options, WalletState(wallet.copy())))
}

struct WalletState(Wallet);

impl WalletState {
    fn refresh_prng_seed(&mut self) {
        // TODO
    }

    fn write(&self) {
        // TODO
    }
}

#[wasm_bindgen]
pub async fn dapp_query_validators() -> Result<(), JsError> {
    let wallet = WALLET.read()?;
    let wallet = wallet.as_ref().ok_or(JsError::new("no wallet set"))?;

    let mut storage = get_storage().await?;

    wallet.genesis_config().initialize_storage(&mut storage).await?;

    let chain_id = wallet.default_chain().expect("No default chain");

    let mut client_context: ClientContext<WebStorage> = get_client_context(wallet).await?;

    let mut chain_client = client_context.make_chain_client(chain_id);
    log::info!(
        "Querying the validators of the current epoch of chain {}",
        chain_id
    );
    chain_client.synchronize_from_validators().await?;
    log::info!("Synchronized state from validators");
    let result = chain_client.local_committee().await;
    client_context.update_and_save_wallet(&mut chain_client).await;
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

static WALLET: RwLock<Option<Wallet>> = RwLock::new(None);

#[wasm_bindgen]
pub async fn set_wallet(wallet: &str) -> Result<(), wasm_bindgen::JsError> {
    *WALLET.write()? = serde_json::from_str(wallet)?;
    Ok(())
}

#[wasm_bindgen]
pub async fn dapp_query(n: u32) -> u32 {
    n + 1
}

// Execute operation to get
#[wasm_bindgen]
pub async fn execute_operation_with_messages(chain_id: &str, operation: &str, messages: &str) -> Result<Option<String>, JsError> {
  let chain_id: ChainId = ChainId::from_str(chain_id)?;
  let operations: Vec<Operation> = match serde_json::from_str(operation) {
    Ok(operation) => [operation].to_vec(),
    Err(_) => Vec::new(),
  };
  let messages: Vec<IncomingMessage> = serde_json::from_str(messages)?;

  let wallet = WALLET.read()?;
  let wallet = wallet.as_ref().ok_or(JsError::new("no wallet set"))?;
  let mut storage = get_storage().await?;
  wallet.genesis_config().initialize_storage(&mut storage).await?;
  let mut client_context: ClientContext<WebStorage> = get_client_context(wallet).await?;
  let mut chain_client = client_context.make_chain_client(chain_id);

  chain_client.execute_block_without_block_proposal(messages, operations).await?;
  match chain_client.peek_candidate_block_proposal().await {
    Some(block_proposal) => {
      let json = serde_json::to_string(block_proposal)?;
      Ok(Some(String::from(json)))
    }
    _ => Ok(None),
  }
}

#[wasm_bindgen(start)]
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    console_log::init_with_level(log::Level::Debug);

    log::info!("Hello World!");
}
