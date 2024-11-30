/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** An account */
  Account: { input: any; output: any; }
  /** A non-negative amount of tokens. */
  Amount: { input: any; output: any; }
  /** A unique identifier for a user application */
  ApplicationId: { input: any; output: any; }
  /** A block height to identify blocks in a chain */
  BlockHeight: { input: any; output: any; }
  /** A WebAssembly module's bytecode */
  Bytecode: { input: any; output: any; }
  /** A unique identifier for an application bytecode */
  BytecodeId: { input: any; output: any; }
  /** How to create a chain */
  ChainDescription: { input: any; output: any; }
  /** The unique identifier (UID) of a chain. This is currently computed as the hash value of a ChainDescription. */
  ChainId: { input: any; output: any; }
  /** The state of the certification process for a chain's next block */
  ChainManager: { input: any; output: any; }
  /** Represents the owner(s) of a chain */
  ChainOwnership: { input: any; output: any; }
  /** A channel name together with its application ID. */
  ChannelFullName: { input: any; output: any; }
  /** The name of a subscription channel */
  ChannelName: { input: any; output: any; }
  /** The version of the Linera crates used in this build */
  CrateVersion: { input: any; output: any; }
  /** A Sha3-256 value */
  CryptoHash: { input: any; output: any; }
  /** The destination of a message, relative to a particular application. */
  Destination: { input: any; output: any; }
  /** A number identifying the configuration of the chain (aka the committee) */
  Epoch: { input: any; output: any; }
  /** A unique identifier for a user application or for the system application */
  GenericApplicationId: { input: any; output: any; }
  /** A scalar that can represent any JSON Object value. */
  JSONObject: { input: any; output: any; }
  /** An message to be sent and possibly executed in the receiver's block. */
  Message: { input: any; output: any; }
  /** Whether an incoming message is accepted or rejected. */
  MessageAction: { input: any; output: any; }
  /** The index of a message in a chain */
  MessageId: { input: any; output: any; }
  /** The kind of outgoing message being sent */
  MessageKind: { input: any; output: any; }
  /** Notify that a chain has a new certified block or a new message */
  Notification: { input: any; output: any; }
  /** An operation to be executed in a block */
  Operation: { input: any; output: any; }
  /** A record of a single oracle response. */
  OracleResponse: { input: any; output: any; }
  /** The origin of a message, relative to a particular application. Used to identify each inbox. */
  Origin: { input: any; output: any; }
  /** The owner of a chain. This is currently the hash of the owner's public key used to verify signatures. */
  Owner: { input: any; output: any; }
  /** A signature public key */
  PublicKey: { input: any; output: any; }
  /** The recipient of a transfer */
  Recipient: { input: any; output: any; }
  /** A number to identify successive attempts to decide a value in a consensus protocol. */
  Round: { input: any; output: any; }
  /** A signature value */
  Signature: { input: any; output: any; }
  /** The name of an event stream */
  StreamName: { input: any; output: any; }
  /** The target of a message, relative to a particular application. Used to identify each outbox. */
  Target: { input: any; output: any; }
  /** A timestamp, in microseconds since the Unix epoch */
  Timestamp: { input: any; output: any; }
  /** Description of the necessary information to run a user application */
  UserApplicationDescription: { input: any; output: any; }
  /** A executed block which will be submitted to blockchain with its signature. */
  UserExecutedBlock: { input: any; output: any; }
  /** Input shadow of IncomingBundle. */
  UserIncomingBundle: { input: any; output: any; }
};

export type ApplicationOverview = {
  __typename?: 'ApplicationOverview';
  description: Scalars['UserApplicationDescription']['output'];
  id: Scalars['ApplicationId']['output'];
  link: Scalars['String']['output'];
};

/** Permissions for applications on a chain. */
export type ApplicationPermissions = {
  /** These applications are allowed to close the current chain using the system API. */
  closeChain?: Array<Scalars['ApplicationId']['input']>;
  /**
   * If this is `None`, all system operations and application operations are allowed.
   * If it is `Some`, only operations from the specified applications are allowed, and
   * no system operations.
   */
  executeOperations?: InputMaybe<Array<Scalars['ApplicationId']['input']>>;
  /**
   * At least one operation or incoming message from each of these applications must occur in
   * every block.
   */
  mandatoryApplications?: Array<Scalars['ApplicationId']['input']>;
};

/**
 * A block containing operations to apply on a given chain, as well as the
 * acknowledgment of a number of incoming messages from other chains.
 * * Incoming messages must be selected in the order they were
 * produced by the sending chain, but can be skipped.
 * * When a block is proposed to a validator, all cross-chain messages must have been
 * received ahead of time in the inbox of the chain.
 * * This constraint does not apply to the execution of confirmed blocks.
 */
export type Block = {
  __typename?: 'Block';
  /**
   * The user signing for the operations in the block and paying for their execution
   * fees. If set, this must be the `owner` in the block proposal. `None` means that
   * the default account of the chain is used. This value is also used as recipient of
   * potential refunds for the message grants created by the operations.
   */
  authenticatedSigner?: Maybe<Scalars['Owner']['output']>;
  /** The chain to which this block belongs. */
  chainId: Scalars['ChainId']['output'];
  /** The number identifying the current configuration. */
  epoch: Scalars['Epoch']['output'];
  /** The block height. */
  height: Scalars['BlockHeight']['output'];
  /**
   * A selection of incoming messages to be executed first. Successive messages of same
   * sender and height are grouped together for conciseness.
   */
  incomingBundles: Array<IncomingBundle>;
  /** The operations to execute. */
  operations: Array<Scalars['Operation']['output']>;
  /**
   * Certified hash (see `Certificate` below) of the previous block in the
   * chain, if any.
   */
  previousBlockHash?: Maybe<Scalars['CryptoHash']['output']>;
  /**
   * The timestamp when this block was created. This must be later than all messages received
   * in this block, but no later than the current time.
   */
  timestamp: Scalars['Timestamp']['output'];
};

/** The messages and the state hash resulting from a [`Block`]'s execution. */
export type BlockExecutionOutcome = {
  __typename?: 'BlockExecutionOutcome';
  /** The list of events produced by each transaction. */
  events: Array<Array<EventRecord>>;
  /** The list of outgoing messages for each transaction. */
  messages: Array<Array<OutgoingMessage>>;
  /** The record of oracle responses for each transaction. */
  oracleResponses: Array<Array<Scalars['OracleResponse']['output']>>;
  /** The hash of the chain's execution state after this block. */
  stateHash: Scalars['CryptoHash']['output'];
};

/** An origin and cursor of a unskippable bundle that is no longer in our inbox. */
export type BundleInInbox = {
  __typename?: 'BundleInInbox';
  /** The cursor of the bundle in the inbox. */
  cursor: Cursor;
  /** The origin from which we received the bundle. */
  origin: Scalars['Origin']['output'];
};

export type CandidateBlockMaterial = {
  __typename?: 'CandidateBlockMaterial';
  incomingBundles: Array<IncomingBundle>;
  localTime: Scalars['Timestamp']['output'];
  round: Scalars['Round']['output'];
};

export type CertificateValue = {
  __typename?: 'CertificateValue';
  executedBlock?: Maybe<ExecutedBlock>;
  status: Scalars['String']['output'];
};

/** A chain ID with a block height. */
export type ChainAndHeight = {
  __typename?: 'ChainAndHeight';
  chainId: Scalars['ChainId']['output'];
  height: Scalars['BlockHeight']['output'];
};

export type ChainStateExtendedView = {
  __typename?: 'ChainStateExtendedView';
  chainId: Scalars['ChainId']['output'];
  /** Channels able to multicast messages to subscribers. */
  channels: ReentrantCollectionView_ChannelFullName_ChannelStateView_3998371610;
  /**
   * Hashes of all certified blocks for this sender.
   * This ends with `block_hash` and has length `usize::from(next_block_height)`.
   */
  confirmedLog: LogView_CryptoHash_5f6ab77f;
  /** Execution state, including system and user applications. */
  executionState: ExecutionStateView;
  /** Hash of the execution state. */
  executionStateHash?: Maybe<Scalars['CryptoHash']['output']>;
  /** Mailboxes used to receive messages indexed by their origin. */
  inboxes: ReentrantCollectionView_Origin_InboxStateView_1582851290;
  /** Consensus state. */
  manager: Scalars['ChainManager']['output'];
  /**
   * Number of outgoing messages in flight for each block height.
   * We use a `RegisterView` to prioritize speed for small maps.
   */
  outboxCounters: Scalars['JSONObject']['output'];
  /** Mailboxes used to send messages, indexed by their target. */
  outboxes: ReentrantCollectionView_Target_OutboxStateView_146266995;
  /** Sender chain and height of all certified blocks known as a receiver (local ordering). */
  receivedLog: LogView_ChainAndHeight_7af83576;
  /** Unskippable bundles that have been removed but are still in the queue. */
  removedUnskippableBundles: Array<BundleInInbox>;
  /** Block-chaining state. */
  tipState: ChainTipState;
  /** A queue of unskippable bundles, with the timestamp when we added them to the inbox. */
  unskippableBundles: QueueView_TimestampedBundleInInbox_5a630c55;
};

/** Block-chaining state. */
export type ChainTipState = {
  __typename?: 'ChainTipState';
  /** Hash of the latest certified block in this chain, if any. */
  blockHash?: Maybe<Scalars['CryptoHash']['output']>;
  /** Sequence number tracking blocks. */
  nextBlockHeight: Scalars['BlockHeight']['output'];
  /** Number of incoming message bundles. */
  numIncomingBundles: Scalars['Int']['output'];
  /** Number of operations. */
  numOperations: Scalars['Int']['output'];
  /** Number of outgoing messages. */
  numOutgoingMessages: Scalars['Int']['output'];
};

export type Chains = {
  __typename?: 'Chains';
  default?: Maybe<Scalars['ChainId']['output']>;
  list: Array<Scalars['ChainId']['output']>;
};

/** The state of a channel followed by subscribers. */
export type ChannelStateView = {
  __typename?: 'ChannelStateView';
  /** The block heights so far, to be sent to future subscribers. */
  blockHeights: LogView_BlockHeight_E824a938;
  /** The current subscribers. */
  subscribers: Array<Scalars['ChainId']['output']>;
};

/** The identifier of a channel, relative to a particular application. */
export type ChannelSubscription = {
  __typename?: 'ChannelSubscription';
  /** The chain ID broadcasting on this channel. */
  chainId: Scalars['ChainId']['output'];
  /** The name of the channel. */
  name: Scalars['ChannelName']['output'];
};

/** A set of validators (identified by their public keys) and their voting rights. */
export type Committee = {
  /** The policy agreed on for this epoch. */
  policy: ResourceControlPolicy;
  /** The threshold to form a quorum. */
  quorumThreshold: Scalars['Int']['input'];
  /** The sum of all voting rights. */
  totalVotes: Scalars['Int']['input'];
  /** The validators in the committee. */
  validators: Scalars['JSONObject']['input'];
  /** The threshold to prove the validity of a statement. */
  validityThreshold: Scalars['Int']['input'];
};

export type Cursor = {
  __typename?: 'Cursor';
  height: Scalars['BlockHeight']['output'];
  index: Scalars['Int']['output'];
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_ChannelFullName_ChannelStateView_49fbbcde = {
  __typename?: 'Entry_ChannelFullName_ChannelStateView_49fbbcde';
  key: Scalars['ChannelFullName']['output'];
  value: ChannelStateView;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_Origin_InboxStateView_Ca7c8bfe = {
  __typename?: 'Entry_Origin_InboxStateView_ca7c8bfe';
  key: Scalars['Origin']['output'];
  value: InboxStateView;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_Owner_Amount_202623bd = {
  __typename?: 'Entry_Owner_Amount_202623bd';
  key: Scalars['Owner']['output'];
  value?: Maybe<Scalars['Amount']['output']>;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_Target_OutboxStateView_A1a071a7 = {
  __typename?: 'Entry_Target_OutboxStateView_a1a071a7';
  key: Scalars['Target']['output'];
  value: OutboxStateView;
};

/** An event recorded in an executed block. */
export type EventRecord = {
  __typename?: 'EventRecord';
  /** The event key. */
  key: Array<Scalars['Int']['output']>;
  /** The ID of the stream this event belongs to. */
  streamId: StreamId;
  /** The payload data. */
  value: Array<Scalars['Int']['output']>;
};

/** A [`Block`], together with the outcome from its execution. */
export type ExecutedBlock = {
  __typename?: 'ExecutedBlock';
  block: Block;
  outcome: BlockExecutionOutcome;
};

export type ExecutedBlockMaterial = {
  __typename?: 'ExecutedBlockMaterial';
  executedBlock: ExecutedBlock;
  retry: Scalars['Boolean']['output'];
  validatedBlockCertificateHash?: Maybe<Scalars['CryptoHash']['output']>;
};

export type ExecutionStateView = {
  __typename?: 'ExecutionStateView';
  system: SystemExecutionStateView;
};

export type HashedCertificateValue = {
  __typename?: 'HashedCertificateValue';
  hash: Scalars['CryptoHash']['output'];
  value: CertificateValue;
};

/**
 * The state of an inbox.
 * * An inbox is used to track bundles received and executed locally.
 * * A `MessageBundle` consists of a logical cursor `(height, index)` and some message
 * content `messages`.
 * * On the surface, an inbox looks like a FIFO queue: the main APIs are `add_bundle` and
 * `remove_bundle`.
 * * However, bundles can also be removed before they are added. When this happens,
 * the bundles removed by anticipation are tracked in a separate queue. Any bundle added
 * later will be required to match the first removed bundle and so on.
 * * The cursors of added bundles (resp. removed bundles) must be increasing over time.
 * * Reconciliation of added and removed bundles is allowed to skip some added bundles.
 * However, the opposite is not true: every removed bundle must be eventually added.
 */
export type InboxStateView = {
  __typename?: 'InboxStateView';
  /** These bundles have been added and are waiting to be removed. */
  addedBundles: QueueView_MessageBundle_F4399f0b;
  /** We have already added all the messages below this height and index. */
  nextCursorToAdd: Cursor;
  /** We have already removed all the messages below this height and index. */
  nextCursorToRemove: Cursor;
  /**
   * These bundles have been removed by anticipation and are waiting to be added.
   * At least one of `added_bundles` and `removed_bundles` should be empty.
   */
  removedBundles: QueueView_MessageBundle_F4399f0b;
};

/** A bundle of cross-chain messages. */
export type IncomingBundle = {
  __typename?: 'IncomingBundle';
  /** What to do with the message. */
  action: Scalars['MessageAction']['output'];
  /** The messages to be delivered to the inbox identified by `origin`. */
  bundle: MessageBundle;
  /** The origin of the messages (chain and channel if any). */
  origin: Scalars['Origin']['output'];
};

export type LogView_BlockHeight_E824a938 = {
  __typename?: 'LogView_BlockHeight_e824a938';
  entries: Array<Scalars['BlockHeight']['output']>;
};


export type LogView_BlockHeight_E824a938EntriesArgs = {
  end?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type LogView_ChainAndHeight_7af83576 = {
  __typename?: 'LogView_ChainAndHeight_7af83576';
  entries: Array<ChainAndHeight>;
};


export type LogView_ChainAndHeight_7af83576EntriesArgs = {
  end?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type LogView_CryptoHash_5f6ab77f = {
  __typename?: 'LogView_CryptoHash_5f6ab77f';
  entries: Array<Scalars['CryptoHash']['output']>;
};


export type LogView_CryptoHash_5f6ab77fEntriesArgs = {
  end?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type MapFilters_ChannelFullName_3b59bf69 = {
  keys?: InputMaybe<Array<Scalars['ChannelFullName']['input']>>;
};

export type MapFilters_Origin_742d451b = {
  keys?: InputMaybe<Array<Scalars['Origin']['input']>>;
};

export type MapFilters_Owner_6898ce22 = {
  keys?: InputMaybe<Array<Scalars['Owner']['input']>>;
};

export type MapFilters_Target_7aac1e1c = {
  keys?: InputMaybe<Array<Scalars['Target']['input']>>;
};

export type MapInput_ChannelFullName_3b59bf69 = {
  filters?: InputMaybe<MapFilters_ChannelFullName_3b59bf69>;
};

export type MapInput_Origin_742d451b = {
  filters?: InputMaybe<MapFilters_Origin_742d451b>;
};

export type MapInput_Owner_6898ce22 = {
  filters?: InputMaybe<MapFilters_Owner_6898ce22>;
};

export type MapInput_Target_7aac1e1c = {
  filters?: InputMaybe<MapFilters_Target_7aac1e1c>;
};

export type MapView_Owner_Amount_Ef5edbab = {
  __typename?: 'MapView_Owner_Amount_ef5edbab';
  entries: Array<Entry_Owner_Amount_202623bd>;
  entry: Entry_Owner_Amount_202623bd;
  keys: Array<Scalars['Owner']['output']>;
};


export type MapView_Owner_Amount_Ef5edbabEntriesArgs = {
  input?: InputMaybe<MapInput_Owner_6898ce22>;
};


export type MapView_Owner_Amount_Ef5edbabEntryArgs = {
  key: Scalars['Owner']['input'];
};


export type MapView_Owner_Amount_Ef5edbabKeysArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

/** A set of messages from a single block, for a single destination. */
export type MessageBundle = {
  __typename?: 'MessageBundle';
  /** The confirmed block certificate hash. */
  certificateHash: Scalars['CryptoHash']['output'];
  /** The block height. */
  height: Scalars['BlockHeight']['output'];
  /** The relevant messages. */
  messages: Array<PostedMessage>;
  /** The block's timestamp. */
  timestamp: Scalars['Timestamp']['output'];
  /** The index of the transaction in the block that is sending this bundle. */
  transactionIndex: Scalars['Int']['output'];
};

export type MutationRoot = {
  __typename?: 'MutationRoot';
  /** Changes the application permissions configuration on this chain. */
  changeApplicationPermissions: Scalars['CryptoHash']['output'];
  /** Changes the authentication key of the chain. */
  changeMultipleOwners: Scalars['CryptoHash']['output'];
  /** Changes the authentication key of the chain. */
  changeOwner: Scalars['CryptoHash']['output'];
  /**
   * Claims `amount` units of value from the given owner's account in the remote
   * `target` chain. Depending on its configuration, the `target` chain may refuse to
   * process the message.
   */
  claim: Scalars['CryptoHash']['output'];
  /** Closes the chain. */
  closeChain: Scalars['CryptoHash']['output'];
  /** Creates a new application. */
  createApplication: Scalars['ApplicationId']['output'];
  /**
   * (admin chain only) Registers a new committee. This will notify the subscribers of
   * the admin chain so that they can migrate to the new epoch (by accepting the
   * notification as an "incoming message" in a next block).
   */
  createCommittee: Scalars['CryptoHash']['output'];
  /** Calculate block execution state hash */
  executeBlockWithFullMaterials: ExecutedBlockMaterial;
  /**
   * Creates (or activates) a new chain by installing the given authentication key.
   * This will automatically subscribe to the future committees created by `admin_id`.
   */
  openChain: Scalars['ChainId']['output'];
  /**
   * Creates (or activates) a new chain by installing the given authentication keys.
   * This will automatically subscribe to the future committees created by `admin_id`.
   */
  openMultiOwnerChain: Scalars['ChainId']['output'];
  /** Processes the inbox and returns the lists of certificate hashes that were created, if any. */
  processInbox: Array<Scalars['CryptoHash']['output']>;
  /** Publishes a new application bytecode. */
  publishBytecode: Scalars['BytecodeId']['output'];
  /** Publishes a new data blob. */
  publishDataBlob: Scalars['CryptoHash']['output'];
  /** Test if a data blob is readable from a transaction in the current chain. */
  readDataBlob: Scalars['CryptoHash']['output'];
  /**
   * (admin chain only) Removes a committee. Once this message is accepted by a chain,
   * blocks from the retired epoch will not be accepted until they are followed (hence
   * re-certified) by a block certified by a recent committee.
   */
  removeCommittee: Scalars['CryptoHash']['output'];
  /**
   * Requests a `RegisterApplications` message from another chain so the application can be used
   * on this one.
   */
  requestApplication: Scalars['CryptoHash']['output'];
  /** Retries the pending block that was unsuccessfully proposed earlier. */
  retryPendingBlock?: Maybe<Scalars['CryptoHash']['output']>;
  /** Submit block proposal with signature */
  submitBlockAndSignature: Scalars['CryptoHash']['output'];
  /** Subscribes to a system channel. */
  subscribe: Scalars['CryptoHash']['output'];
  /**
   * Transfers `amount` units of value from the given owner's account to the recipient.
   * If no owner is given, try to take the units out of the unattributed account.
   */
  transfer: Scalars['CryptoHash']['output'];
  /** Unsubscribes from a system channel. */
  unsubscribe: Scalars['CryptoHash']['output'];
  /** ResPeer::CheCko::Initialize offline wallet */
  walletInitWithoutKeypair: Scalars['ChainId']['output'];
};


export type MutationRootChangeApplicationPermissionsArgs = {
  chainId: Scalars['ChainId']['input'];
  closeChain: Array<Scalars['ApplicationId']['input']>;
  executeOperations?: InputMaybe<Array<Scalars['ApplicationId']['input']>>;
  mandatoryApplications: Array<Scalars['ApplicationId']['input']>;
};


export type MutationRootChangeMultipleOwnersArgs = {
  baseTimeoutMs?: Scalars['Int']['input'];
  chainId: Scalars['ChainId']['input'];
  fallbackDurationMs?: Scalars['Int']['input'];
  fastRoundMs?: InputMaybe<Scalars['Int']['input']>;
  multiLeaderRounds: Scalars['Int']['input'];
  newPublicKeys: Array<Scalars['PublicKey']['input']>;
  newWeights: Array<Scalars['Int']['input']>;
  timeoutIncrementMs?: Scalars['Int']['input'];
};


export type MutationRootChangeOwnerArgs = {
  chainId: Scalars['ChainId']['input'];
  newPublicKey: Scalars['PublicKey']['input'];
};


export type MutationRootClaimArgs = {
  amount: Scalars['Amount']['input'];
  chainId: Scalars['ChainId']['input'];
  owner: Scalars['Owner']['input'];
  recipient: Scalars['Recipient']['input'];
  targetId: Scalars['ChainId']['input'];
};


export type MutationRootCloseChainArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootCreateApplicationArgs = {
  bytecodeId: Scalars['BytecodeId']['input'];
  chainId: Scalars['ChainId']['input'];
  instantiationArgument: Scalars['String']['input'];
  parameters: Scalars['String']['input'];
  requiredApplicationIds: Array<Scalars['ApplicationId']['input']>;
};


export type MutationRootCreateCommitteeArgs = {
  chainId: Scalars['ChainId']['input'];
  committee: Committee;
  epoch: Scalars['Epoch']['input'];
};


export type MutationRootExecuteBlockWithFullMaterialsArgs = {
  chainId: Scalars['ChainId']['input'];
  incomingBundles: Array<Scalars['UserIncomingBundle']['input']>;
  localTime: Scalars['Timestamp']['input'];
  operations: Array<Scalars['Operation']['input']>;
};


export type MutationRootOpenChainArgs = {
  balance?: InputMaybe<Scalars['Amount']['input']>;
  chainId: Scalars['ChainId']['input'];
  publicKey: Scalars['PublicKey']['input'];
};


export type MutationRootOpenMultiOwnerChainArgs = {
  applicationPermissions?: InputMaybe<ApplicationPermissions>;
  balance?: InputMaybe<Scalars['Amount']['input']>;
  baseTimeoutMs?: Scalars['Int']['input'];
  chainId: Scalars['ChainId']['input'];
  fallbackDurationMs?: Scalars['Int']['input'];
  fastRoundMs?: InputMaybe<Scalars['Int']['input']>;
  multiLeaderRounds?: InputMaybe<Scalars['Int']['input']>;
  publicKeys: Array<Scalars['PublicKey']['input']>;
  timeoutIncrementMs?: Scalars['Int']['input'];
  weights?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type MutationRootProcessInboxArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootPublishBytecodeArgs = {
  chainId: Scalars['ChainId']['input'];
  contract: Scalars['Bytecode']['input'];
  service: Scalars['Bytecode']['input'];
};


export type MutationRootPublishDataBlobArgs = {
  bytes: Array<Scalars['Int']['input']>;
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootReadDataBlobArgs = {
  chainId: Scalars['ChainId']['input'];
  hash: Scalars['CryptoHash']['input'];
};


export type MutationRootRemoveCommitteeArgs = {
  chainId: Scalars['ChainId']['input'];
  epoch: Scalars['Epoch']['input'];
};


export type MutationRootRequestApplicationArgs = {
  applicationId: Scalars['ApplicationId']['input'];
  chainId: Scalars['ChainId']['input'];
  targetChainId?: InputMaybe<Scalars['ChainId']['input']>;
};


export type MutationRootRetryPendingBlockArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootSubmitBlockAndSignatureArgs = {
  chainId: Scalars['ChainId']['input'];
  executedBlock: Scalars['UserExecutedBlock']['input'];
  height: Scalars['BlockHeight']['input'];
  retry: Scalars['Boolean']['input'];
  round: Scalars['Round']['input'];
  signature: Scalars['Signature']['input'];
  validatedBlockCertificateHash?: InputMaybe<Scalars['CryptoHash']['input']>;
};


export type MutationRootSubscribeArgs = {
  channel: SystemChannel;
  publisherChainId: Scalars['ChainId']['input'];
  subscriberChainId: Scalars['ChainId']['input'];
};


export type MutationRootTransferArgs = {
  amount: Scalars['Amount']['input'];
  chainId: Scalars['ChainId']['input'];
  owner?: InputMaybe<Scalars['Owner']['input']>;
  recipient: Scalars['Recipient']['input'];
};


export type MutationRootUnsubscribeArgs = {
  channel: SystemChannel;
  publisherChainId: Scalars['ChainId']['input'];
  subscriberChainId: Scalars['ChainId']['input'];
};


export type MutationRootWalletInitWithoutKeypairArgs = {
  certificateHash: Scalars['CryptoHash']['input'];
  chainId: Scalars['ChainId']['input'];
  faucetUrl: Scalars['String']['input'];
  messageId: Scalars['MessageId']['input'];
  publicKey: Scalars['PublicKey']['input'];
  signature: Scalars['Signature']['input'];
};

/**
 * The state of an outbox
 * * An outbox is used to send messages to another chain.
 * * Internally, this is implemented as a FIFO queue of (increasing) block heights.
 * Messages are contained in blocks, together with destination information, so currently
 * we just send the certified blocks over and let the receivers figure out what were the
 * messages for them.
 * * When marking block heights as received, messages at lower heights are also marked (ie. dequeued).
 */
export type OutboxStateView = {
  __typename?: 'OutboxStateView';
  /** The minimum block height accepted in the future. */
  nextHeightToSchedule: Scalars['BlockHeight']['output'];
  /**
   * Keep sending these certified blocks of ours until they are acknowledged by
   * receivers.
   */
  queue: QueueView_BlockHeight_E824a938;
};

/** A posted message together with routing information. */
export type OutgoingMessage = {
  __typename?: 'OutgoingMessage';
  /** The user authentication carried by the message, if any. */
  authenticatedSigner?: Maybe<Scalars['Owner']['output']>;
  /** The destination of the message. */
  destination: Scalars['Destination']['output'];
  /** A grant to pay for the message execution. */
  grant: Scalars['Amount']['output'];
  /** The kind of message being sent. */
  kind: Scalars['MessageKind']['output'];
  /** The message itself. */
  message: Scalars['Message']['output'];
  /** Where to send a refund for the unused part of the grant after execution, if any. */
  refundGrantTo?: Maybe<Scalars['Account']['output']>;
};

/** A message together with kind, authentication and grant information. */
export type PostedMessage = {
  __typename?: 'PostedMessage';
  /** The user authentication carried by the message, if any. */
  authenticatedSigner?: Maybe<Scalars['Owner']['output']>;
  /** A grant to pay for the message execution. */
  grant: Scalars['Amount']['output'];
  /** The index of the message in the sending block. */
  index: Scalars['Int']['output'];
  /** The kind of message being sent. */
  kind: Scalars['MessageKind']['output'];
  /** The message itself. */
  message: Scalars['Message']['output'];
  /** Where to send a refund for the unused part of the grant after execution, if any. */
  refundGrantTo?: Maybe<Scalars['Account']['output']>;
};

export type QueryRoot = {
  __typename?: 'QueryRoot';
  applications: Array<ApplicationOverview>;
  /** Returns the balance of given owner */
  balance: Scalars['Amount']['output'];
  /** Returns the balances of given owners */
  balances: Scalars['JSONObject']['output'];
  block?: Maybe<HashedCertificateValue>;
  /** Returns block material of the chain */
  blockMaterial: CandidateBlockMaterial;
  blocks: Array<HashedCertificateValue>;
  chain: ChainStateExtendedView;
  chains: Chains;
  /** Returns the maintained chains of given owner */
  chainsWithPublicKey: Chains;
  /** Returns the pending message of the chain */
  pendingMessages: Array<IncomingBundle>;
  /** Returns the version information on this node service. */
  version: VersionInfo;
};


export type QueryRootApplicationsArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type QueryRootBalanceArgs = {
  chainId: Scalars['ChainId']['input'];
  publicKey?: InputMaybe<Scalars['PublicKey']['input']>;
};


export type QueryRootBalancesArgs = {
  chainIds: Array<Scalars['ChainId']['input']>;
  publicKeys: Array<Scalars['PublicKey']['input']>;
};


export type QueryRootBlockArgs = {
  chainId: Scalars['ChainId']['input'];
  hash?: InputMaybe<Scalars['CryptoHash']['input']>;
};


export type QueryRootBlockMaterialArgs = {
  chainId: Scalars['ChainId']['input'];
  maxPendingMessages: Scalars['Int']['input'];
};


export type QueryRootBlocksArgs = {
  chainId: Scalars['ChainId']['input'];
  from?: InputMaybe<Scalars['CryptoHash']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRootChainArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type QueryRootChainsWithPublicKeyArgs = {
  publicKey: Scalars['PublicKey']['input'];
};


export type QueryRootPendingMessagesArgs = {
  chainId: Scalars['ChainId']['input'];
};

export type QueueView_BlockHeight_E824a938 = {
  __typename?: 'QueueView_BlockHeight_e824a938';
  entries: Array<Scalars['BlockHeight']['output']>;
};


export type QueueView_BlockHeight_E824a938EntriesArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type QueueView_MessageBundle_F4399f0b = {
  __typename?: 'QueueView_MessageBundle_f4399f0b';
  entries: Array<MessageBundle>;
};


export type QueueView_MessageBundle_F4399f0bEntriesArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type QueueView_TimestampedBundleInInbox_5a630c55 = {
  __typename?: 'QueueView_TimestampedBundleInInbox_5a630c55';
  entries: Array<TimestampedBundleInInbox>;
};


export type QueueView_TimestampedBundleInInbox_5a630c55EntriesArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type ReentrantCollectionView_ChannelFullName_ChannelStateView_3998371610 = {
  __typename?: 'ReentrantCollectionView_ChannelFullName_ChannelStateView_3998371610';
  entries: Array<Entry_ChannelFullName_ChannelStateView_49fbbcde>;
  entry: Entry_ChannelFullName_ChannelStateView_49fbbcde;
  keys: Array<Scalars['ChannelFullName']['output']>;
};


export type ReentrantCollectionView_ChannelFullName_ChannelStateView_3998371610EntriesArgs = {
  input?: InputMaybe<MapInput_ChannelFullName_3b59bf69>;
};


export type ReentrantCollectionView_ChannelFullName_ChannelStateView_3998371610EntryArgs = {
  key: Scalars['ChannelFullName']['input'];
};

export type ReentrantCollectionView_Origin_InboxStateView_1582851290 = {
  __typename?: 'ReentrantCollectionView_Origin_InboxStateView_1582851290';
  entries: Array<Entry_Origin_InboxStateView_Ca7c8bfe>;
  entry: Entry_Origin_InboxStateView_Ca7c8bfe;
  keys: Array<Scalars['Origin']['output']>;
};


export type ReentrantCollectionView_Origin_InboxStateView_1582851290EntriesArgs = {
  input?: InputMaybe<MapInput_Origin_742d451b>;
};


export type ReentrantCollectionView_Origin_InboxStateView_1582851290EntryArgs = {
  key: Scalars['Origin']['input'];
};

export type ReentrantCollectionView_Target_OutboxStateView_146266995 = {
  __typename?: 'ReentrantCollectionView_Target_OutboxStateView_146266995';
  entries: Array<Entry_Target_OutboxStateView_A1a071a7>;
  entry: Entry_Target_OutboxStateView_A1a071a7;
  keys: Array<Scalars['Target']['output']>;
};


export type ReentrantCollectionView_Target_OutboxStateView_146266995EntriesArgs = {
  input?: InputMaybe<MapInput_Target_7aac1e1c>;
};


export type ReentrantCollectionView_Target_OutboxStateView_146266995EntryArgs = {
  key: Scalars['Target']['input'];
};

/** A collection of prices and limits associated with block execution. */
export type ResourceControlPolicy = {
  /** The base price for creating a new block. */
  block: Scalars['Amount']['input'];
  /** The price of reading a byte. */
  byteRead: Scalars['Amount']['input'];
  /** The price of increasing storage by a byte. */
  byteStored: Scalars['Amount']['input'];
  /** The price of writing a byte */
  byteWritten: Scalars['Amount']['input'];
  /** The price per unit of fuel (aka gas) for VM execution. */
  fuelUnit: Scalars['Amount']['input'];
  /** The maximum data to read per block */
  maximumBytesReadPerBlock: Scalars['Int']['input'];
  /** The maximum data to write per block */
  maximumBytesWrittenPerBlock: Scalars['Int']['input'];
  /**
   * The maximum size of an executed block. This includes the block proposal itself as well as
   * the execution outcome.
   */
  maximumExecutedBlockSize: Scalars['Int']['input'];
  /** The maximum amount of fuel a block can consume. */
  maximumFuelPerBlock: Scalars['Int']['input'];
  /** The base price of sending a message from a block. */
  message: Scalars['Amount']['input'];
  /** The additional price for each byte in the argument of a user message. */
  messageByte: Scalars['Amount']['input'];
  /** The base price of adding an operation to a block. */
  operation: Scalars['Amount']['input'];
  /** The additional price for each byte in the argument of a user operation. */
  operationByte: Scalars['Amount']['input'];
  /** The price of one read operation. */
  readOperation: Scalars['Amount']['input'];
  /** The price of one write operation. */
  writeOperation: Scalars['Amount']['input'];
};

/** An event stream ID. */
export type StreamId = {
  __typename?: 'StreamId';
  /** The application that can add events to this stream. */
  applicationId: Scalars['GenericApplicationId']['output'];
  /** The name of this stream: an application can have multiple streams with different names. */
  streamName: Scalars['StreamName']['output'];
};

export type SubscriptionRoot = {
  __typename?: 'SubscriptionRoot';
  /** Subscribes to notifications from the specified chain. */
  notifications: Scalars['Notification']['output'];
};


export type SubscriptionRootNotificationsArgs = {
  chainId: Scalars['ChainId']['input'];
};

/** The channels available in the system application. */
export enum SystemChannel {
  /** Channel used to broadcast reconfigurations. */
  Admin = 'ADMIN'
}

export type SystemExecutionStateView = {
  __typename?: 'SystemExecutionStateView';
  adminId?: Maybe<Scalars['ChainId']['output']>;
  balance: Scalars['Amount']['output'];
  balances: MapView_Owner_Amount_Ef5edbab;
  committees: Scalars['JSONObject']['output'];
  description?: Maybe<Scalars['ChainDescription']['output']>;
  epoch?: Maybe<Scalars['Epoch']['output']>;
  ownership: Scalars['ChainOwnership']['output'];
  subscriptions: Array<ChannelSubscription>;
  timestamp: Scalars['Timestamp']['output'];
};

/** An origin, cursor and timestamp of a unskippable bundle in our inbox. */
export type TimestampedBundleInInbox = {
  __typename?: 'TimestampedBundleInInbox';
  /** The origin and cursor of the bundle. */
  entry: BundleInInbox;
  /** The timestamp when the bundle was added to the inbox. */
  seen: Scalars['Timestamp']['output'];
};

/** The version info of a build of Linera. */
export type VersionInfo = {
  __typename?: 'VersionInfo';
  /** The crate version */
  crateVersion: Scalars['CrateVersion']['output'];
  /** The git commit hash */
  gitCommit: Scalars['String']['output'];
  /** Whether the git checkout was dirty */
  gitDirty: Scalars['Boolean']['output'];
  /** A hash of the GraphQL API */
  graphqlHash: Scalars['String']['output'];
  /** A hash of the RPC API */
  rpcHash: Scalars['String']['output'];
  /** A hash of the WIT API */
  witHash: Scalars['String']['output'];
};

export type GetAccountBalanceQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  publicKey?: InputMaybe<Scalars['PublicKey']['input']>;
}>;


export type GetAccountBalanceQuery = { __typename?: 'QueryRoot', balance: any };

export type GetChainAccountBalancesQueryVariables = Exact<{
  chainIds: Array<Scalars['ChainId']['input']> | Scalars['ChainId']['input'];
  publicKeys: Array<Scalars['PublicKey']['input']> | Scalars['PublicKey']['input'];
}>;


export type GetChainAccountBalancesQuery = { __typename?: 'QueryRoot', balances: any };

export type ApplicationsWithOperationsQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
}>;


export type ApplicationsWithOperationsQuery = { __typename?: 'QueryRoot', applications: Array<{ __typename?: 'ApplicationOverview', id: any, link: string, description: any }> };

export type ApplicationsQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
}>;


export type ApplicationsQuery = { __typename?: 'QueryRoot', applications: Array<{ __typename?: 'ApplicationOverview', id: any, link: string }> };

export type ChainsWithPublicKeyQueryVariables = Exact<{
  publicKey: Scalars['PublicKey']['input'];
}>;


export type ChainsWithPublicKeyQuery = { __typename?: 'QueryRoot', chainsWithPublicKey: { __typename?: 'Chains', list: Array<any>, default?: any | null } };

export type WalletInitWithoutKeypairMutationVariables = Exact<{
  publicKey: Scalars['PublicKey']['input'];
  signature: Scalars['Signature']['input'];
  faucetUrl: Scalars['String']['input'];
  chainId: Scalars['ChainId']['input'];
  messageId: Scalars['MessageId']['input'];
  certificateHash: Scalars['CryptoHash']['input'];
}>;


export type WalletInitWithoutKeypairMutation = { __typename?: 'MutationRoot', walletInitWithoutKeypair: any };

export type SubmitBlockAndSignatureMutationVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  height: Scalars['BlockHeight']['input'];
  executedBlock: Scalars['UserExecutedBlock']['input'];
  round: Scalars['Round']['input'];
  signature: Scalars['Signature']['input'];
  retry: Scalars['Boolean']['input'];
  validatedBlockCertificateHash?: InputMaybe<Scalars['CryptoHash']['input']>;
}>;


export type SubmitBlockAndSignatureMutation = { __typename?: 'MutationRoot', submitBlockAndSignature: any };

export type NotificationsSubscriptionVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
}>;


export type NotificationsSubscription = { __typename?: 'SubscriptionRoot', notifications: any };

export type BlockQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  hash: Scalars['CryptoHash']['input'];
}>;


export type BlockQuery = { __typename?: 'QueryRoot', block?: { __typename?: 'HashedCertificateValue', hash: any, value: { __typename?: 'CertificateValue', status: string, executedBlock?: { __typename?: 'ExecutedBlock', block: { __typename?: 'Block', chainId: any, epoch: any, operations: Array<any>, height: any, timestamp: any, authenticatedSigner?: any | null, previousBlockHash?: any | null, incomingBundles: Array<{ __typename?: 'IncomingBundle', origin: any, action: any, bundle: { __typename?: 'MessageBundle', height: any, timestamp: any, certificateHash: any, transactionIndex: number, messages: Array<{ __typename?: 'PostedMessage', authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, index: number, message: any }> } }> }, outcome: { __typename?: 'BlockExecutionOutcome', stateHash: any, oracleResponses: Array<Array<any>>, messages: Array<Array<{ __typename?: 'OutgoingMessage', destination: any, authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, message: any }>>, events: Array<Array<{ __typename?: 'EventRecord', key: Array<number>, value: Array<number>, streamId: { __typename?: 'StreamId', applicationId: any, streamName: any } }>> } } | null } } | null };

export type BlockMaterialQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  maxPendingMessages: Scalars['Int']['input'];
}>;


export type BlockMaterialQuery = { __typename?: 'QueryRoot', blockMaterial: { __typename?: 'CandidateBlockMaterial', localTime: any, round: any, incomingBundles: Array<{ __typename?: 'IncomingBundle', action: any, origin: any, bundle: { __typename?: 'MessageBundle', height: any, timestamp: any, certificateHash: any, transactionIndex: number, messages: Array<{ __typename?: 'PostedMessage', authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, index: number, message: any }> } }> } };

export type ExecuteBlockWithFullMaterialsMutationVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  operations: Array<Scalars['Operation']['input']> | Scalars['Operation']['input'];
  incomingBundles: Array<Scalars['UserIncomingBundle']['input']> | Scalars['UserIncomingBundle']['input'];
  localTime: Scalars['Timestamp']['input'];
}>;


export type ExecuteBlockWithFullMaterialsMutation = { __typename?: 'MutationRoot', executeBlockWithFullMaterials: { __typename?: 'ExecutedBlockMaterial', validatedBlockCertificateHash?: any | null, retry: boolean, executedBlock: { __typename?: 'ExecutedBlock', block: { __typename?: 'Block', chainId: any, epoch: any, height: any, timestamp: any, authenticatedSigner?: any | null, previousBlockHash?: any | null, operations: Array<any>, incomingBundles: Array<{ __typename?: 'IncomingBundle', origin: any, action: any, bundle: { __typename?: 'MessageBundle', height: any, timestamp: any, certificateHash: any, transactionIndex: number, messages: Array<{ __typename?: 'PostedMessage', authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, index: number, message: any }> } }> }, outcome: { __typename?: 'BlockExecutionOutcome', stateHash: any, oracleResponses: Array<Array<any>>, messages: Array<Array<{ __typename?: 'OutgoingMessage', destination: any, authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, message: any }>>, events: Array<Array<{ __typename?: 'EventRecord', key: Array<number>, value: Array<number>, streamId: { __typename?: 'StreamId', applicationId: any, streamName: any } }>> } } } };

export type PendingMessagesQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
}>;


export type PendingMessagesQuery = { __typename?: 'QueryRoot', pendingMessages: Array<{ __typename?: 'IncomingBundle', action: any, origin: any, bundle: { __typename?: 'MessageBundle', height: any, timestamp: any, certificateHash: any, transactionIndex: number, messages: Array<{ __typename?: 'PostedMessage', authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, index: number, message: any }> } }> };

export type TransferMutationVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  owner?: InputMaybe<Scalars['Owner']['input']>;
  recipient: Scalars['Recipient']['input'];
  amount: Scalars['Amount']['input'];
}>;


export type TransferMutation = { __typename?: 'MutationRoot', transfer: any };

export type RequestApplicationMutationVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  applicationId: Scalars['ApplicationId']['input'];
  targetChainId: Scalars['ChainId']['input'];
}>;


export type RequestApplicationMutation = { __typename?: 'MutationRoot', requestApplication: any };


export const GetAccountBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getAccountBalance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicKey"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PublicKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"publicKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicKey"}}}]}]}}]} as unknown as DocumentNode<GetAccountBalanceQuery, GetAccountBalanceQueryVariables>;
export const GetChainAccountBalancesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getChainAccountBalances"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicKeys"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublicKey"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"publicKeys"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicKeys"}}}]}]}}]} as unknown as DocumentNode<GetChainAccountBalancesQuery, GetChainAccountBalancesQueryVariables>;
export const ApplicationsWithOperationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"applicationsWithOperations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"link"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<ApplicationsWithOperationsQuery, ApplicationsWithOperationsQueryVariables>;
export const ApplicationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"applications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"link"}}]}}]}}]} as unknown as DocumentNode<ApplicationsQuery, ApplicationsQueryVariables>;
export const ChainsWithPublicKeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"chainsWithPublicKey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublicKey"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chainsWithPublicKey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"publicKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicKey"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"}},{"kind":"Field","name":{"kind":"Name","value":"default"}}]}}]}}]} as unknown as DocumentNode<ChainsWithPublicKeyQuery, ChainsWithPublicKeyQueryVariables>;
export const WalletInitWithoutKeypairDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"walletInitWithoutKeypair"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"publicKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublicKey"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Signature"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"faucetUrl"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"messageId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MessageId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"certificateHash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CryptoHash"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"walletInitWithoutKeypair"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"publicKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"publicKey"}}},{"kind":"Argument","name":{"kind":"Name","value":"signature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signature"}}},{"kind":"Argument","name":{"kind":"Name","value":"faucetUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"faucetUrl"}}},{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"messageId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"messageId"}}},{"kind":"Argument","name":{"kind":"Name","value":"certificateHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"certificateHash"}}}]}]}}]} as unknown as DocumentNode<WalletInitWithoutKeypairMutation, WalletInitWithoutKeypairMutationVariables>;
export const SubmitBlockAndSignatureDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"submitBlockAndSignature"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"height"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BlockHeight"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"executedBlock"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserExecutedBlock"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"round"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Round"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Signature"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"retry"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"validatedBlockCertificateHash"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CryptoHash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitBlockAndSignature"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"height"},"value":{"kind":"Variable","name":{"kind":"Name","value":"height"}}},{"kind":"Argument","name":{"kind":"Name","value":"executedBlock"},"value":{"kind":"Variable","name":{"kind":"Name","value":"executedBlock"}}},{"kind":"Argument","name":{"kind":"Name","value":"round"},"value":{"kind":"Variable","name":{"kind":"Name","value":"round"}}},{"kind":"Argument","name":{"kind":"Name","value":"signature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signature"}}},{"kind":"Argument","name":{"kind":"Name","value":"retry"},"value":{"kind":"Variable","name":{"kind":"Name","value":"retry"}}},{"kind":"Argument","name":{"kind":"Name","value":"validatedBlockCertificateHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"validatedBlockCertificateHash"}}}]}]}}]} as unknown as DocumentNode<SubmitBlockAndSignatureMutation, SubmitBlockAndSignatureMutationVariables>;
export const NotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"notifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}}]}]}}]} as unknown as DocumentNode<NotificationsSubscription, NotificationsSubscriptionVariables>;
export const BlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"block"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CryptoHash"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"hash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"value"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"executedBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chainId"}},{"kind":"Field","name":{"kind":"Name","value":"epoch"}},{"kind":"Field","name":{"kind":"Name","value":"incomingBundles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"bundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"certificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIndex"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"action"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operations"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockHash"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outcome"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"destination"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stateHash"}},{"kind":"Field","name":{"kind":"Name","value":"oracleResponses"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streamId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applicationId"}},{"kind":"Field","name":{"kind":"Name","value":"streamName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<BlockQuery, BlockQueryVariables>;
export const BlockMaterialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"blockMaterial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxPendingMessages"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockMaterial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxPendingMessages"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxPendingMessages"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"incomingBundles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"bundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"certificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIndex"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"origin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"localTime"}},{"kind":"Field","name":{"kind":"Name","value":"round"}}]}}]}}]} as unknown as DocumentNode<BlockMaterialQuery, BlockMaterialQueryVariables>;
export const ExecuteBlockWithFullMaterialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"executeBlockWithFullMaterials"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"operations"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Operation"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"incomingBundles"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserIncomingBundle"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"localTime"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Timestamp"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"executeBlockWithFullMaterials"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"operations"},"value":{"kind":"Variable","name":{"kind":"Name","value":"operations"}}},{"kind":"Argument","name":{"kind":"Name","value":"incomingBundles"},"value":{"kind":"Variable","name":{"kind":"Name","value":"incomingBundles"}}},{"kind":"Argument","name":{"kind":"Name","value":"localTime"},"value":{"kind":"Variable","name":{"kind":"Name","value":"localTime"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"executedBlock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chainId"}},{"kind":"Field","name":{"kind":"Name","value":"epoch"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockHash"}},{"kind":"Field","name":{"kind":"Name","value":"incomingBundles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"bundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"certificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIndex"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"action"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operations"}}]}},{"kind":"Field","name":{"kind":"Name","value":"outcome"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"destination"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stateHash"}},{"kind":"Field","name":{"kind":"Name","value":"oracleResponses"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streamId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applicationId"}},{"kind":"Field","name":{"kind":"Name","value":"streamName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"validatedBlockCertificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"retry"}}]}}]}}]} as unknown as DocumentNode<ExecuteBlockWithFullMaterialsMutation, ExecuteBlockWithFullMaterialsMutationVariables>;
export const PendingMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"pendingMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pendingMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"bundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"certificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIndex"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"origin"}}]}}]}}]} as unknown as DocumentNode<PendingMessagesQuery, PendingMessagesQueryVariables>;
export const TransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"transfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owner"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Owner"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Recipient"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Amount"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"owner"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owner"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipient"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}]}]}}]} as unknown as DocumentNode<TransferMutation, TransferMutationVariables>;
export const RequestApplicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"requestApplication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"applicationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"targetChainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestApplication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"applicationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"applicationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"targetChainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"targetChainId"}}}]}]}}]} as unknown as DocumentNode<RequestApplicationMutation, RequestApplicationMutationVariables>;