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
  /** A unique identifier for a user or an application. */
  AccountOwner: { input: any; output: any; }
  /** A crypto signature. */
  AccountSignature: { input: any; output: any; }
  /** A non-negative amount of tokens. */
  Amount: { input: any; output: any; }
  /** Description of a user application */
  ApplicationDescription: { input: any; output: any; }
  /** A unique identifier for a user application */
  ApplicationId: { input: any; output: any; }
  /** A blob of binary data, with its content-addressed blob ID. */
  Blob: { input: any; output: any; }
  /** A content-addressed blob ID i.e. the hash of the `BlobContent` */
  BlobId: { input: any; output: any; }
  /** A block height to identify blocks in a chain */
  BlockHeight: { input: any; output: any; }
  /** Materials of a new block. */
  BlockMaterial: { input: any; output: any; }
  /** A WebAssembly module's bytecode */
  Bytecode: { input: any; output: any; }
  /** Initial chain configuration and chain origin. */
  ChainDescription: { input: any; output: any; }
  /** The unique identifier (UID) of a chain. This is currently computed as the hash value of a ChainDescription. */
  ChainId: { input: any; output: any; }
  /** Represents the owner(s) of a chain */
  ChainOwnership: { input: any; output: any; }
  /** A Keccak256 value */
  CryptoHash: { input: any; output: any; }
  /** A number identifying the configuration of the chain (aka the committee) */
  Epoch: { input: any; output: any; }
  /** A unique identifier for a user application or for the system application */
  GenericApplicationId: { input: any; output: any; }
  /** A scalar that can represent any JSON Object value. */
  JSONObject: { input: any; output: any; }
  /** A message to be sent and possibly executed in the receiver's block. */
  Message: { input: any; output: any; }
  /** Whether an incoming message is accepted or rejected. */
  MessageAction: { input: any; output: any; }
  /** The kind of outgoing message being sent */
  MessageKind: { input: any; output: any; }
  /** A unique identifier for an application module */
  ModuleId: { input: any; output: any; }
  /** Notify that a chain has a new certified block or a new message */
  Notification: { input: any; output: any; }
  /** The execution result of a single operation. */
  OperationResult: { input: any; output: any; }
  /** A record of a single oracle response. */
  OracleResponse: { input: any; output: any; }
  /** Exists proposal of new block. */
  OriginalProposal: { input: any; output: any; }
  /** A collection of prices and limits associated with block execution */
  ResourceControlPolicyScalar: { input: any; output: any; }
  /** A number to identify successive attempts to decide a value in a consensus protocol. */
  Round: { input: any; output: any; }
  /** A signed block which will be submitted to blockchain with its signature. */
  SignedBlockBcs: { input: any; output: any; }
  /** The name of an event stream */
  StreamName: { input: any; output: any; }
  /** A timestamp, in microseconds since the Unix epoch */
  Timestamp: { input: any; output: any; }
  VersionInfo: { input: any; output: any; }
  VmRuntime: { input: any; output: any; }
};

export type ApplicationOverview = {
  __typename?: 'ApplicationOverview';
  description: Scalars['ApplicationDescription']['output'];
  id: Scalars['ApplicationId']['output'];
  link: Scalars['String']['output'];
};

/** Permissions for applications on a chain. */
export type ApplicationPermissions = {
  /** These applications are allowed to perform calls to services as oracles. */
  callServiceAsOracle?: InputMaybe<Array<Scalars['ApplicationId']['input']>>;
  /** These applications are allowed to change the application permissions using the system API. */
  changeApplicationPermissions?: Array<Scalars['ApplicationId']['input']>;
  /** These applications are allowed to close the current chain using the system API. */
  closeChain?: Array<Scalars['ApplicationId']['input']>;
  /**
   * If this is `None`, all system operations and application operations are allowed.
   * If it is `Some`, only operations from the specified applications are allowed, and
   * no system operations.
   */
  executeOperations?: InputMaybe<Array<Scalars['ApplicationId']['input']>>;
  /** These applications are allowed to perform HTTP requests. */
  makeHttpRequests?: InputMaybe<Array<Scalars['ApplicationId']['input']>>;
  /**
   * At least one operation or incoming message from each of these applications must occur in
   * every block.
   */
  mandatoryApplications?: Array<Scalars['ApplicationId']['input']>;
};

/**
 * Block defines the atomic unit of growth of the Linera chain.
 *
 * As part of the block body, contains all the incoming messages
 * and operations to execute which define a state transition of the chain.
 * Resulting messages produced by the operations are also included in the block body,
 * together with oracle responses and events.
 */
export type Block = {
  __typename?: 'Block';
  /** Body of the block containing all of the data. */
  body: BlockBody;
  /** Header of the block containing metadata of the block. */
  header: BlockHeader;
};

/** The body of a block containing all the data included in the block. */
export type BlockBody = {
  __typename?: 'BlockBody';
  /** The list of blobs produced by each transaction. */
  blobs: Array<Array<Scalars['Blob']['output']>>;
  /** The list of events produced by each transaction. */
  events: Array<Array<Event>>;
  /** The list of outgoing messages for each transaction. */
  messages: Array<Array<OutgoingMessage>>;
  /** The execution result for each operation. */
  operationResults: Array<Scalars['OperationResult']['output']>;
  /** The record of oracle responses for each transaction. */
  oracleResponses: Array<Array<Scalars['OracleResponse']['output']>>;
  /** The hashes and heights of previous blocks that published events to the same channels. */
  previousEventBlocks: Scalars['JSONObject']['output'];
  /** The hashes and heights of previous blocks that sent messages to the same recipients. */
  previousMessageBlocks: Scalars['JSONObject']['output'];
  /** Metadata about the transactions in this block. */
  transactionMetadata: Array<TransactionMetadata>;
};

/** The messages and the state hash resulting from a [`ProposedBlock`]'s execution. */
export type BlockExecutionOutcome = {
  __typename?: 'BlockExecutionOutcome';
  /** The list of blobs created by each transaction. */
  blobs: Array<Array<Scalars['Blob']['output']>>;
  /** The list of events produced by each transaction. */
  events: Array<Array<Event>>;
  /** The list of outgoing messages for each transaction. */
  messages: Array<Array<OutgoingMessage>>;
  /** The execution result for each operation. */
  operationResults: Array<Scalars['OperationResult']['output']>;
  /** The record of oracle responses for each transaction. */
  oracleResponses: Array<Array<Scalars['OracleResponse']['output']>>;
  /** The hashes and heights of previous blocks that published events to the same channels. */
  previousEventBlocks: Scalars['JSONObject']['output'];
  /** The hashes and heights of previous blocks that sent messages to the same recipients. */
  previousMessageBlocks: Scalars['JSONObject']['output'];
  /** The hash of the chain's execution state after this block. */
  stateHash: Scalars['CryptoHash']['output'];
};

/**
 * Succinct representation of a block.
 * Contains all the metadata to follow the chain of blocks or verifying
 * inclusion (event, message, oracle response, etc.) in the block's body.
 */
export type BlockHeader = {
  __typename?: 'BlockHeader';
  /**
   * The user signing for the operations in the block and paying for their execution
   * fees. If set, this must be the `owner` in the block proposal. `None` means that
   * the default account of the chain is used. This value is also used as recipient of
   * potential refunds for the message grants created by the operations.
   */
  authenticatedSigner?: Maybe<Scalars['AccountOwner']['output']>;
  /** Cryptographic hash of all the created blobs in the block. */
  blobsHash: Scalars['CryptoHash']['output'];
  /** The chain to which this block belongs. */
  chainId: Scalars['ChainId']['output'];
  /** The number identifying the current configuration. */
  epoch: Scalars['Epoch']['output'];
  /** Cryptographic hash of all the events in the block. */
  eventsHash: Scalars['CryptoHash']['output'];
  /** The block height. */
  height: Scalars['BlockHeight']['output'];
  /** Cryptographic hash of all the messages in the block. */
  messagesHash: Scalars['CryptoHash']['output'];
  /** A cryptographic hash of the execution results of all operations in a block. */
  operationResultsHash: Scalars['CryptoHash']['output'];
  /** Cryptographic hash of all the oracle responses in the block. */
  oracleResponsesHash: Scalars['CryptoHash']['output'];
  /** Certified hash of the previous block in the chain, if any. */
  previousBlockHash?: Maybe<Scalars['CryptoHash']['output']>;
  /** Cryptographic hash of the lookup table for previous blocks publishing events. */
  previousEventBlocksHash: Scalars['CryptoHash']['output'];
  /** Cryptographic hash of the lookup table for previous sending blocks. */
  previousMessageBlocksHash: Scalars['CryptoHash']['output'];
  /** The hash of the chain's execution state after this block. */
  stateHash: Scalars['CryptoHash']['output'];
  /** The timestamp when this block was created. */
  timestamp: Scalars['Timestamp']['output'];
  /** Cryptographic hash of all the transactions in the block. */
  transactionsHash: Scalars['CryptoHash']['output'];
};

export type BucketQueueView_BlockHeight_E824a938 = {
  __typename?: 'BucketQueueView_BlockHeight_e824a938';
  entries: Array<Scalars['BlockHeight']['output']>;
};


export type BucketQueueView_BlockHeight_E824a938EntriesArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type BucketQueueView_TimestampedBundleInInbox_5a630c55 = {
  __typename?: 'BucketQueueView_TimestampedBundleInInbox_5a630c55';
  entries: Array<TimestampedBundleInInbox>;
};


export type BucketQueueView_TimestampedBundleInInbox_5a630c55EntriesArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

/** An origin and cursor of a unskippable bundle that is no longer in our inbox. */
export type BundleInInbox = {
  __typename?: 'BundleInInbox';
  /** The cursor of the bundle in the inbox. */
  cursor: Cursor;
  /** The origin from which we received the bundle. */
  origin: Scalars['ChainId']['output'];
};

export type CandidateBlockMaterial = {
  __typename?: 'CandidateBlockMaterial';
  incomingBundles: Array<IncomingBundle>;
  localTime: Scalars['Timestamp']['output'];
  round: Scalars['Round']['output'];
};

/** A chain ID with a block height. */
export type ChainAndHeight = {
  __typename?: 'ChainAndHeight';
  chainId: Scalars['ChainId']['output'];
  height: Scalars['BlockHeight']['output'];
};

/** The state of the certification process for a chain's next block. */
export type ChainManager = {
  __typename?: 'ChainManager';
  /**
   * Returns the lowest round where we can still vote to validate or confirm a block. This is
   * the round to which the timeout applies.
   *
   * Having a leader timeout certificate in any given round causes the next one to become
   * current. Seeing a validated block certificate or a valid proposal in any round causes that
   * round to become current, unless a higher one already is.
   */
  currentRound: Scalars['Round']['output'];
  /** The owners that take over in fallback mode. */
  fallbackOwners: Scalars['JSONObject']['output'];
  /** These are blobs published or read by the locking block. */
  lockingBlobs: MapView_BlobId_Blob_3711e760;
  /** The public keys, weights and types of the chain's owners. */
  ownership: Scalars['ChainOwnership']['output'];
  /** These are blobs published or read by the proposed block. */
  proposedBlobs: MapView_BlobId_Blob_3711e760;
  /** The time after which we are ready to sign a timeout certificate for the current round. */
  roundTimeout?: Maybe<Scalars['Timestamp']['output']>;
  /** The seed for the pseudo-random number generator that determines the round leaders. */
  seed: Scalars['Int']['output'];
};

export type ChainOwners = {
  chainId: Scalars['ChainId']['input'];
  owners: Array<Scalars['AccountOwner']['input']>;
};

export type ChainStateExtendedView = {
  __typename?: 'ChainStateExtendedView';
  chainId: Scalars['ChainId']['output'];
  /**
   * Hashes of all certified blocks for this sender.
   * This ends with `block_hash` and has length `usize::from(next_block_height)`.
   */
  confirmedLog: LogView_CryptoHash_87fbb60c;
  /** Execution state, including system and user applications. */
  executionState: ExecutionStateView;
  /** Hash of the execution state. */
  executionStateHash?: Maybe<Scalars['CryptoHash']['output']>;
  /** Mailboxes used to receive messages indexed by their origin. */
  inboxes: ReentrantCollectionView_ChainId_InboxStateView_1a7dccb2;
  /** Consensus state. */
  manager: ChainManager;
  /** Outboxes with at least one pending message. This allows us to avoid loading all outboxes. */
  nonemptyOutboxes: Array<Scalars['ChainId']['output']>;
  /**
   * Number of outgoing messages in flight for each block height.
   * We use a `RegisterView` to prioritize speed for small maps.
   */
  outboxCounters: Scalars['JSONObject']['output'];
  /** Mailboxes used to send messages, indexed by their target. */
  outboxes: ReentrantCollectionView_ChainId_OutboxStateView_1aed8f3a;
  /** The incomplete sets of blobs for upcoming proposals. */
  pendingProposedBlobs: ReentrantCollectionView_AccountOwner_PendingBlobsView_C7f51b33;
  /**
   * Pending validated block that is still missing blobs.
   * The incomplete set of blobs for the pending validated block.
   */
  pendingValidatedBlobs: PendingBlobsView;
  /** Blocks that have been verified but not executed yet, and that may not be contiguous. */
  preprocessedBlocks: MapView_BlockHeight_CryptoHash_1bae6d76;
  /** The heights of previous blocks that published events to the same streams. */
  previousEventBlocks: MapView_StreamId_BlockHeight_E6657ad9;
  /** The heights of previous blocks that sent messages to the same recipients. */
  previousMessageBlocks: MapView_ChainId_BlockHeight_F2e56e12;
  /** The number of `received_log` entries we have synchronized, for each validator. */
  receivedCertificateTrackers: Scalars['JSONObject']['output'];
  /** Sender chain and height of all certified blocks known as a receiver (local ordering). */
  receivedLog: LogView_ChainAndHeight_7af83576;
  /** Unskippable bundles that have been removed but are still in the queue. */
  removedUnskippableBundles: Array<BundleInInbox>;
  /** Block-chaining state. */
  tipState: ChainTipState;
  /** A queue of unskippable bundles, with the timestamp when we added them to the inbox. */
  unskippableBundles: BucketQueueView_TimestampedBundleInInbox_5a630c55;
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

/** A set of validators (identified by their public keys) and their voting rights. */
export type Committee = {
  /** The policy agreed on for this epoch. */
  policy: Scalars['ResourceControlPolicyScalar']['input'];
  /** The threshold to form a quorum. */
  quorumThreshold: Scalars['Int']['input'];
  /** The sum of all voting rights. */
  totalVotes: Scalars['Int']['input'];
  /** The validators in the committee. */
  validators: Scalars['JSONObject']['input'];
  /** The threshold to prove the validity of a statement. */
  validityThreshold: Scalars['Int']['input'];
};

export type ConfirmedBlock = {
  __typename?: 'ConfirmedBlock';
  block: Block;
  hash: Scalars['CryptoHash']['output'];
  status: Scalars['String']['output'];
};

export type Cursor = {
  __typename?: 'Cursor';
  height: Scalars['BlockHeight']['output'];
  index: Scalars['Int']['output'];
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_AccountOwner_Amount_Aaf96548 = {
  __typename?: 'Entry_AccountOwner_Amount_aaf96548';
  key: Scalars['AccountOwner']['output'];
  value?: Maybe<Scalars['Amount']['output']>;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_AccountOwner_PendingBlobsView_27889bdf = {
  __typename?: 'Entry_AccountOwner_PendingBlobsView_27889bdf';
  key: Scalars['AccountOwner']['output'];
  value: PendingBlobsView;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_BlobId_Blob_9f0b41f3 = {
  __typename?: 'Entry_BlobId_Blob_9f0b41f3';
  key: Scalars['BlobId']['output'];
  value?: Maybe<Scalars['Blob']['output']>;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_BlobId_Blob_50b95aa1 = {
  __typename?: 'Entry_BlobId_Blob_50b95aa1';
  key: Scalars['BlobId']['output'];
  value?: Maybe<Scalars['Blob']['output']>;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_BlockHeight_CryptoHash_74e16b71 = {
  __typename?: 'Entry_BlockHeight_CryptoHash_74e16b71';
  key: Scalars['BlockHeight']['output'];
  value?: Maybe<Scalars['CryptoHash']['output']>;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_ChainId_BlockHeight_2fe78645 = {
  __typename?: 'Entry_ChainId_BlockHeight_2fe78645';
  key: Scalars['ChainId']['output'];
  value?: Maybe<Scalars['BlockHeight']['output']>;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_ChainId_InboxStateView_1352ee45 = {
  __typename?: 'Entry_ChainId_InboxStateView_1352ee45';
  key: Scalars['ChainId']['output'];
  value: InboxStateView;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_ChainId_OutboxStateView_D43a9885 = {
  __typename?: 'Entry_ChainId_OutboxStateView_d43a9885';
  key: Scalars['ChainId']['output'];
  value: OutboxStateView;
};

/** A GraphQL-visible map item, complete with key. */
export type Entry_StreamId_BlockHeight_50cd702e = {
  __typename?: 'Entry_StreamId_BlockHeight_50cd702e';
  key: StreamId;
  value?: Maybe<Scalars['BlockHeight']['output']>;
};

/** An event recorded in a block. */
export type Event = {
  __typename?: 'Event';
  /** The event index, i.e. the number of events in the stream before this one. */
  index: Scalars['Int']['output'];
  /** The ID of the stream this event belongs to. */
  streamId: StreamId;
  /** The payload data. */
  value: Array<Scalars['Int']['output']>;
};

export type ExecutionStateView = {
  __typename?: 'ExecutionStateView';
  system: SystemExecutionStateView;
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
  /** The origin of the messages. */
  origin: Scalars['ChainId']['output'];
};

/** The result of an `events_from_index`. */
export type IndexAndEvent = {
  __typename?: 'IndexAndEvent';
  /** The event being returned. */
  event: Array<Scalars['Int']['output']>;
  /** The index of the found event. */
  index: Scalars['Int']['output'];
};

/** The messages and the state hash resulting from a [`ProposedBlock`]'s execution. */
export type InputBlockExecutionOutcome = {
  /** The list of blobs created by each transaction. */
  blobs: Array<Array<Scalars['Blob']['input']>>;
  /** The list of events produced by each transaction. */
  events: Array<Array<InputEvent>>;
  /** The list of outgoing messages for each transaction. */
  messages: Array<Array<InputOutgoingMessage>>;
  /** The execution result for each operation. */
  operationResults: Array<Scalars['OperationResult']['input']>;
  /** The record of oracle responses for each transaction. */
  oracleResponses: Array<Array<Scalars['OracleResponse']['input']>>;
  /** The hashes and heights of previous blocks that published events to the same channels. */
  previousEventBlocks: Scalars['JSONObject']['input'];
  /** The hashes and heights of previous blocks that sent messages to the same recipients. */
  previousMessageBlocks: Scalars['JSONObject']['input'];
  /** The hash of the chain's execution state after this block. */
  stateHash: Scalars['CryptoHash']['input'];
};

/** An event recorded in a block. */
export type InputEvent = {
  /** The event index, i.e. the number of events in the stream before this one. */
  index: Scalars['Int']['input'];
  /** The ID of the stream this event belongs to. */
  streamId: StreamIdInput;
  /** The payload data. */
  value: Array<Scalars['Int']['input']>;
};

/** A posted message together with routing information. */
export type InputOutgoingMessage = {
  /** The user authentication carried by the message, if any. */
  authenticatedSigner?: InputMaybe<Scalars['AccountOwner']['input']>;
  /** The destination of the message. */
  destination: Scalars['ChainId']['input'];
  /** A grant to pay for the message execution. */
  grant: Scalars['Amount']['input'];
  /** The kind of message being sent. */
  kind: Scalars['MessageKind']['input'];
  /** The message itself. */
  message: Scalars['Message']['input'];
  /** Where to send a refund for the unused part of the grant after execution, if any. */
  refundGrantTo?: InputMaybe<Scalars['Account']['input']>;
};

/** The data a block proposer signs. */
export type InputProposalContent = {
  /** The proposed block. */
  block: InputProposedBlock;
  /** If this is a retry from an earlier round, the execution outcome. */
  outcome?: InputMaybe<InputBlockExecutionOutcome>;
  /** The consensus round in which this proposal is made. */
  round: Scalars['Round']['input'];
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
export type InputProposedBlock = {
  /**
   * The user signing for the operations in the block and paying for their execution
   * fees. If set, this must be the `owner` in the block proposal. `None` means that
   * the default account of the chain is used. This value is also used as recipient of
   * potential refunds for the message grants created by the operations.
   */
  authenticatedSigner?: InputMaybe<Scalars['AccountOwner']['input']>;
  /** The chain to which this block belongs. */
  chainId: Scalars['ChainId']['input'];
  /** The number identifying the current configuration. */
  epoch: Scalars['Epoch']['input'];
  /** The block height. */
  height: Scalars['BlockHeight']['input'];
  /**
   * Certified hash (see `Certificate` below) of the previous block in the
   * chain, if any.
   */
  previousBlockHash?: InputMaybe<Scalars['CryptoHash']['input']>;
  /**
   * The timestamp when this block was created. This must be later than all messages received
   * in this block, but no later than the current time.
   */
  timestamp: Scalars['Timestamp']['input'];
};

export type InputUnsignedBlockProposal = {
  content: InputProposalContent;
  originalProposal?: InputMaybe<Scalars['OriginalProposal']['input']>;
  outcome: InputBlockExecutionOutcome;
};

export type LogView_ChainAndHeight_7af83576 = {
  __typename?: 'LogView_ChainAndHeight_7af83576';
  entries: Array<ChainAndHeight>;
};


export type LogView_ChainAndHeight_7af83576EntriesArgs = {
  end?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type LogView_CryptoHash_87fbb60c = {
  __typename?: 'LogView_CryptoHash_87fbb60c';
  entries: Array<Scalars['CryptoHash']['output']>;
};


export type LogView_CryptoHash_87fbb60cEntriesArgs = {
  end?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type MapFilters_AccountOwner_D6668c53 = {
  keys?: InputMaybe<Array<Scalars['AccountOwner']['input']>>;
};

export type MapFilters_BlobId_4d2a0555 = {
  keys?: InputMaybe<Array<Scalars['BlobId']['input']>>;
};

export type MapFilters_BlockHeight_E824a938 = {
  keys?: InputMaybe<Array<Scalars['BlockHeight']['input']>>;
};

export type MapFilters_ChainId_37f83aa9 = {
  keys?: InputMaybe<Array<Scalars['ChainId']['input']>>;
};

export type MapFilters_StreamIdInput_B7c3909d = {
  keys?: InputMaybe<Array<StreamIdInput>>;
};

export type MapInput_AccountOwner_D6668c53 = {
  filters?: InputMaybe<MapFilters_AccountOwner_D6668c53>;
};

export type MapInput_BlobId_4d2a0555 = {
  filters?: InputMaybe<MapFilters_BlobId_4d2a0555>;
};

export type MapInput_BlockHeight_E824a938 = {
  filters?: InputMaybe<MapFilters_BlockHeight_E824a938>;
};

export type MapInput_ChainId_37f83aa9 = {
  filters?: InputMaybe<MapFilters_ChainId_37f83aa9>;
};

export type MapInput_StreamIdInput_B7c3909d = {
  filters?: InputMaybe<MapFilters_StreamIdInput_B7c3909d>;
};

export type MapView_AccountOwner_Amount_11ef1379 = {
  __typename?: 'MapView_AccountOwner_Amount_11ef1379';
  entries: Array<Entry_AccountOwner_Amount_Aaf96548>;
  entry: Entry_AccountOwner_Amount_Aaf96548;
  keys: Array<Scalars['AccountOwner']['output']>;
};


export type MapView_AccountOwner_Amount_11ef1379EntriesArgs = {
  input?: InputMaybe<MapInput_AccountOwner_D6668c53>;
};


export type MapView_AccountOwner_Amount_11ef1379EntryArgs = {
  key: Scalars['AccountOwner']['input'];
};


export type MapView_AccountOwner_Amount_11ef1379KeysArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type MapView_BlobId_Blob_9f0b41f3 = {
  __typename?: 'MapView_BlobId_Blob_9f0b41f3';
  entries: Array<Entry_BlobId_Blob_50b95aa1>;
  entry: Entry_BlobId_Blob_50b95aa1;
  keys: Array<Scalars['BlobId']['output']>;
};


export type MapView_BlobId_Blob_9f0b41f3EntriesArgs = {
  input?: InputMaybe<MapInput_BlobId_4d2a0555>;
};


export type MapView_BlobId_Blob_9f0b41f3EntryArgs = {
  key: Scalars['BlobId']['input'];
};


export type MapView_BlobId_Blob_9f0b41f3KeysArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type MapView_BlobId_Blob_3711e760 = {
  __typename?: 'MapView_BlobId_Blob_3711e760';
  entries: Array<Entry_BlobId_Blob_9f0b41f3>;
  entry: Entry_BlobId_Blob_9f0b41f3;
  keys: Array<Scalars['BlobId']['output']>;
};


export type MapView_BlobId_Blob_3711e760EntriesArgs = {
  input?: InputMaybe<MapInput_BlobId_4d2a0555>;
};


export type MapView_BlobId_Blob_3711e760EntryArgs = {
  key: Scalars['BlobId']['input'];
};


export type MapView_BlobId_Blob_3711e760KeysArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type MapView_BlockHeight_CryptoHash_1bae6d76 = {
  __typename?: 'MapView_BlockHeight_CryptoHash_1bae6d76';
  entries: Array<Entry_BlockHeight_CryptoHash_74e16b71>;
  entry: Entry_BlockHeight_CryptoHash_74e16b71;
  keys: Array<Scalars['BlockHeight']['output']>;
};


export type MapView_BlockHeight_CryptoHash_1bae6d76EntriesArgs = {
  input?: InputMaybe<MapInput_BlockHeight_E824a938>;
};


export type MapView_BlockHeight_CryptoHash_1bae6d76EntryArgs = {
  key: Scalars['BlockHeight']['input'];
};


export type MapView_BlockHeight_CryptoHash_1bae6d76KeysArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type MapView_ChainId_BlockHeight_F2e56e12 = {
  __typename?: 'MapView_ChainId_BlockHeight_f2e56e12';
  entries: Array<Entry_ChainId_BlockHeight_2fe78645>;
  entry: Entry_ChainId_BlockHeight_2fe78645;
  keys: Array<Scalars['ChainId']['output']>;
};


export type MapView_ChainId_BlockHeight_F2e56e12EntriesArgs = {
  input?: InputMaybe<MapInput_ChainId_37f83aa9>;
};


export type MapView_ChainId_BlockHeight_F2e56e12EntryArgs = {
  key: Scalars['ChainId']['input'];
};


export type MapView_ChainId_BlockHeight_F2e56e12KeysArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type MapView_StreamId_BlockHeight_E6657ad9 = {
  __typename?: 'MapView_StreamId_BlockHeight_e6657ad9';
  entries: Array<Entry_StreamId_BlockHeight_50cd702e>;
  entry: Entry_StreamId_BlockHeight_50cd702e;
  keys: Array<StreamId>;
};


export type MapView_StreamId_BlockHeight_E6657ad9EntriesArgs = {
  input?: InputMaybe<MapInput_StreamIdInput_B7c3909d>;
};


export type MapView_StreamId_BlockHeight_E6657ad9EntryArgs = {
  key: StreamIdInput;
};


export type MapView_StreamId_BlockHeight_E6657ad9KeysArgs = {
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
  /** Closes the chain. Returns `None` if it was already closed. */
  closeChain?: Maybe<Scalars['CryptoHash']['output']>;
  /** Creates a new application. */
  createApplication: Scalars['ApplicationId']['output'];
  /**
   * (admin chain only) Registers a new committee. This will notify the subscribers of
   * the admin chain so that they can migrate to the new epoch (by accepting the
   * notification as an "incoming message" in a next block).
   */
  createCommittee: Scalars['CryptoHash']['output'];
  /** ResPeer::CheCko::Initialize offline wallet */
  importChain: Scalars['ChainId']['output'];
  /**
   * Creates (or activates) a new chain with the given owner.
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
  /** Publishes a new data blob. */
  publishDataBlob: Scalars['CryptoHash']['output'];
  /** Publishes a new application module. */
  publishModule: Scalars['ModuleId']['output'];
  /** Test if a data blob is readable from a transaction in the current chain. */
  readDataBlob: Scalars['CryptoHash']['output'];
  /**
   * (admin chain only) Removes a committee. Once this message is accepted by a chain,
   * blocks from the retired epoch will not be accepted until they are followed (hence
   * re-certified) by a block certified by a recent committee.
   */
  removeCommittee: Scalars['CryptoHash']['output'];
  /** Retries the pending block that was unsuccessfully proposed earlier. */
  retryPendingBlock?: Maybe<Scalars['CryptoHash']['output']>;
  /** Calculate block execution state hash */
  simulateExecuteBlock?: Maybe<SimulatedBlockMaterial>;
  /** Submit block proposal with signature */
  submitSignedBlock: Scalars['CryptoHash']['output'];
  /** Submit block proposal with signature */
  submitSignedBlockBcs: Scalars['CryptoHash']['output'];
  /**
   * Transfers `amount` units of value from the given owner's account to the recipient.
   * If no owner is given, try to take the units out of the chain account.
   */
  transfer: Scalars['CryptoHash']['output'];
};


export type MutationRootChangeApplicationPermissionsArgs = {
  callServiceAsOracle?: InputMaybe<Array<Scalars['ApplicationId']['input']>>;
  chainId: Scalars['ChainId']['input'];
  changeApplicationPermissions: Array<Scalars['ApplicationId']['input']>;
  closeChain: Array<Scalars['ApplicationId']['input']>;
  executeOperations?: InputMaybe<Array<Scalars['ApplicationId']['input']>>;
  makeHttpRequests?: InputMaybe<Array<Scalars['ApplicationId']['input']>>;
  mandatoryApplications: Array<Scalars['ApplicationId']['input']>;
};


export type MutationRootChangeMultipleOwnersArgs = {
  baseTimeoutMs?: Scalars['Int']['input'];
  chainId: Scalars['ChainId']['input'];
  fallbackDurationMs?: Scalars['Int']['input'];
  fastRoundMs?: InputMaybe<Scalars['Int']['input']>;
  multiLeaderRounds: Scalars['Int']['input'];
  newOwners: Array<Scalars['AccountOwner']['input']>;
  newWeights: Array<Scalars['Int']['input']>;
  openMultiLeaderRounds: Scalars['Boolean']['input'];
  timeoutIncrementMs?: Scalars['Int']['input'];
};


export type MutationRootChangeOwnerArgs = {
  chainId: Scalars['ChainId']['input'];
  newOwner: Scalars['AccountOwner']['input'];
};


export type MutationRootClaimArgs = {
  amount: Scalars['Amount']['input'];
  chainId: Scalars['ChainId']['input'];
  owner: Scalars['AccountOwner']['input'];
  recipient: Scalars['Account']['input'];
  targetId: Scalars['ChainId']['input'];
};


export type MutationRootCloseChainArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootCreateApplicationArgs = {
  chainId: Scalars['ChainId']['input'];
  instantiationArgument: Scalars['String']['input'];
  moduleId: Scalars['ModuleId']['input'];
  parameters: Scalars['String']['input'];
  requiredApplicationIds: Array<Scalars['ApplicationId']['input']>;
};


export type MutationRootCreateCommitteeArgs = {
  chainId: Scalars['ChainId']['input'];
  committee: Committee;
};


export type MutationRootImportChainArgs = {
  chainId: Scalars['ChainId']['input'];
  creatorChainId: Scalars['ChainId']['input'];
  owner: Scalars['AccountOwner']['input'];
  signature: Scalars['AccountSignature']['input'];
};


export type MutationRootOpenChainArgs = {
  balance?: InputMaybe<Scalars['Amount']['input']>;
  chainId: Scalars['ChainId']['input'];
  owner: Scalars['AccountOwner']['input'];
};


export type MutationRootOpenMultiOwnerChainArgs = {
  applicationPermissions?: InputMaybe<ApplicationPermissions>;
  balance?: InputMaybe<Scalars['Amount']['input']>;
  baseTimeoutMs?: Scalars['Int']['input'];
  chainId: Scalars['ChainId']['input'];
  fallbackDurationMs?: Scalars['Int']['input'];
  fastRoundMs?: InputMaybe<Scalars['Int']['input']>;
  multiLeaderRounds?: InputMaybe<Scalars['Int']['input']>;
  owners: Array<Scalars['AccountOwner']['input']>;
  timeoutIncrementMs?: Scalars['Int']['input'];
  weights?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type MutationRootProcessInboxArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootPublishDataBlobArgs = {
  bytes: Array<Scalars['Int']['input']>;
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootPublishModuleArgs = {
  chainId: Scalars['ChainId']['input'];
  contract: Scalars['Bytecode']['input'];
  service: Scalars['Bytecode']['input'];
  vmRuntime: Scalars['VmRuntime']['input'];
};


export type MutationRootReadDataBlobArgs = {
  chainId: Scalars['ChainId']['input'];
  hash: Scalars['CryptoHash']['input'];
};


export type MutationRootRemoveCommitteeArgs = {
  chainId: Scalars['ChainId']['input'];
  epoch: Scalars['Epoch']['input'];
};


export type MutationRootRetryPendingBlockArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootSimulateExecuteBlockArgs = {
  blockMaterial: Scalars['BlockMaterial']['input'];
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootSubmitSignedBlockArgs = {
  block: SignedBlock;
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootSubmitSignedBlockBcsArgs = {
  block: Scalars['SignedBlockBcs']['input'];
  chainId: Scalars['ChainId']['input'];
};


export type MutationRootTransferArgs = {
  amount: Scalars['Amount']['input'];
  chainId: Scalars['ChainId']['input'];
  owner: Scalars['AccountOwner']['input'];
  recipient: Scalars['Account']['input'];
};

export type Operation = {
  __typename?: 'Operation';
  /** For user operations, the application ID */
  applicationId?: Maybe<Scalars['ApplicationId']['output']>;
  /** The type of operation: "System" or "User" */
  operationType: Scalars['String']['output'];
  /** For system operations, the serialized bytes (as a hex string for GraphQL) */
  systemBytesHex?: Maybe<Scalars['String']['output']>;
  /** For user operations, the serialized bytes (as a hex string for GraphQL) */
  userBytesHex?: Maybe<Scalars['String']['output']>;
};

/**
 * The state of an outbox
 * * An outbox is used to send messages to another chain.
 * * Internally, this is implemented as a FIFO queue of (increasing) block heights.
 * Messages are contained in blocks, together with destination information, so currently
 * we just send the certified blocks over and let the receivers figure out what were the
 * messages for them.
 * * When marking block heights as received, messages at lower heights are also marked (i.e. dequeued).
 */
export type OutboxStateView = {
  __typename?: 'OutboxStateView';
  /** The minimum block height accepted in the future. */
  nextHeightToSchedule: Scalars['BlockHeight']['output'];
  /**
   * Keep sending these certified blocks of ours until they are acknowledged by
   * receivers.
   */
  queue: BucketQueueView_BlockHeight_E824a938;
};

/** A posted message together with routing information. */
export type OutgoingMessage = {
  __typename?: 'OutgoingMessage';
  /** The user authentication carried by the message, if any. */
  authenticatedSigner?: Maybe<Scalars['AccountOwner']['output']>;
  /** The destination of the message. */
  destination: Scalars['ChainId']['output'];
  /** A grant to pay for the message execution. */
  grant: Scalars['Amount']['output'];
  /** The kind of message being sent. */
  kind: Scalars['MessageKind']['output'];
  /** The message itself. */
  message: Scalars['Message']['output'];
  /** Where to send a refund for the unused part of the grant after execution, if any. */
  refundGrantTo?: Maybe<Scalars['Account']['output']>;
};

/** The pending blobs belonging to a block that can't be processed without them. */
export type PendingBlobsView = {
  __typename?: 'PendingBlobsView';
  /** The map of blobs needed to process the block. */
  pendingBlobs: MapView_BlobId_Blob_9f0b41f3;
  /** The round in which the block is validated. */
  round: Scalars['Round']['output'];
  /**
   * Whether these blobs were already validated.
   *
   * This is only `false` for _new_ block proposals, not when re-proposing blocks from earlier
   * rounds or when handling validated block certificates. If it is false, the pending blobs are
   * only the ones published by the new block, not the ones that are only read.
   */
  validated: Scalars['Boolean']['output'];
};

/** A message together with kind, authentication and grant information. */
export type PostedMessage = {
  __typename?: 'PostedMessage';
  /** The user authentication carried by the message, if any. */
  authenticatedSigner?: Maybe<Scalars['AccountOwner']['output']>;
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

/** The data a block proposer signs. */
export type ProposalContent = {
  __typename?: 'ProposalContent';
  /** The proposed block. */
  block: ProposedBlock;
  /** If this is a retry from an earlier round, the execution outcome. */
  outcome?: Maybe<BlockExecutionOutcome>;
  /** The consensus round in which this proposal is made. */
  round: Scalars['Round']['output'];
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
export type ProposedBlock = {
  __typename?: 'ProposedBlock';
  /**
   * The user signing for the operations in the block and paying for their execution
   * fees. If set, this must be the `owner` in the block proposal. `None` means that
   * the default account of the chain is used. This value is also used as recipient of
   * potential refunds for the message grants created by the operations.
   */
  authenticatedSigner?: Maybe<Scalars['AccountOwner']['output']>;
  /** The chain to which this block belongs. */
  chainId: Scalars['ChainId']['output'];
  /** The number identifying the current configuration. */
  epoch: Scalars['Epoch']['output'];
  /** The block height. */
  height: Scalars['BlockHeight']['output'];
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
  /** Metadata about the transactions in this block. */
  transactionMetadata: Array<TransactionMetadata>;
};

export type QueryRoot = {
  __typename?: 'QueryRoot';
  applications: Array<ApplicationOverview>;
  /** Returns the balance of given owner */
  balance: Scalars['Amount']['output'];
  /** Returns the balances of given owners */
  balances: Scalars['JSONObject']['output'];
  block?: Maybe<ConfirmedBlock>;
  /** Returns block material of the chain */
  blockMaterial: CandidateBlockMaterial;
  blocks: Array<ConfirmedBlock>;
  chain: ChainStateExtendedView;
  chains: Chains;
  eventsFromIndex: Array<IndexAndEvent>;
  /** Returns the maintained chains of given owner */
  ownerChains: Chains;
  /** Returns the pending message of the chain */
  pendingMessages: Array<IncomingBundle>;
  /** Returns the version information on this node service. */
  version: Scalars['VersionInfo']['output'];
};


export type QueryRootApplicationsArgs = {
  chainId: Scalars['ChainId']['input'];
};


export type QueryRootBalanceArgs = {
  chainId: Scalars['ChainId']['input'];
  owner?: InputMaybe<Scalars['AccountOwner']['input']>;
};


export type QueryRootBalancesArgs = {
  chainOwners: Array<ChainOwners>;
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


export type QueryRootEventsFromIndexArgs = {
  chainId: Scalars['ChainId']['input'];
  startIndex: Scalars['Int']['input'];
  streamId: StreamIdInput;
};


export type QueryRootOwnerChainsArgs = {
  owner: Scalars['AccountOwner']['input'];
};


export type QueryRootPendingMessagesArgs = {
  chainId: Scalars['ChainId']['input'];
};

export type QueueView_MessageBundle_F4399f0b = {
  __typename?: 'QueueView_MessageBundle_f4399f0b';
  entries: Array<MessageBundle>;
};


export type QueueView_MessageBundle_F4399f0bEntriesArgs = {
  count?: InputMaybe<Scalars['Int']['input']>;
};

export type ReentrantCollectionView_AccountOwner_PendingBlobsView_C7f51b33 = {
  __typename?: 'ReentrantCollectionView_AccountOwner_PendingBlobsView_c7f51b33';
  entries: Array<Entry_AccountOwner_PendingBlobsView_27889bdf>;
  entry: Entry_AccountOwner_PendingBlobsView_27889bdf;
  keys: Array<Scalars['AccountOwner']['output']>;
};


export type ReentrantCollectionView_AccountOwner_PendingBlobsView_C7f51b33EntriesArgs = {
  input?: InputMaybe<MapInput_AccountOwner_D6668c53>;
};


export type ReentrantCollectionView_AccountOwner_PendingBlobsView_C7f51b33EntryArgs = {
  key: Scalars['AccountOwner']['input'];
};

export type ReentrantCollectionView_ChainId_InboxStateView_1a7dccb2 = {
  __typename?: 'ReentrantCollectionView_ChainId_InboxStateView_1a7dccb2';
  entries: Array<Entry_ChainId_InboxStateView_1352ee45>;
  entry: Entry_ChainId_InboxStateView_1352ee45;
  keys: Array<Scalars['ChainId']['output']>;
};


export type ReentrantCollectionView_ChainId_InboxStateView_1a7dccb2EntriesArgs = {
  input?: InputMaybe<MapInput_ChainId_37f83aa9>;
};


export type ReentrantCollectionView_ChainId_InboxStateView_1a7dccb2EntryArgs = {
  key: Scalars['ChainId']['input'];
};

export type ReentrantCollectionView_ChainId_OutboxStateView_1aed8f3a = {
  __typename?: 'ReentrantCollectionView_ChainId_OutboxStateView_1aed8f3a';
  entries: Array<Entry_ChainId_OutboxStateView_D43a9885>;
  entry: Entry_ChainId_OutboxStateView_D43a9885;
  keys: Array<Scalars['ChainId']['output']>;
};


export type ReentrantCollectionView_ChainId_OutboxStateView_1aed8f3aEntriesArgs = {
  input?: InputMaybe<MapInput_ChainId_37f83aa9>;
};


export type ReentrantCollectionView_ChainId_OutboxStateView_1aed8f3aEntryArgs = {
  key: Scalars['ChainId']['input'];
};

export type SignedBlock = {
  blobBytes: Array<Array<Scalars['Int']['input']>>;
  signature: Scalars['AccountSignature']['input'];
  unsignedBlockProposal: InputUnsignedBlockProposal;
};

export type SimulatedBlockMaterial = {
  __typename?: 'SimulatedBlockMaterial';
  blobBytes: Array<Array<Scalars['Int']['output']>>;
  blockProposal: UnsignedBlockProposal;
};

/** An event stream ID. */
export type StreamId = {
  __typename?: 'StreamId';
  /** The application that can add events to this stream. */
  applicationId: Scalars['GenericApplicationId']['output'];
  /** The name of this stream: an application can have multiple streams with different names. */
  streamName: Scalars['StreamName']['output'];
};

/** An event stream ID. */
export type StreamIdInput = {
  /** The application that can add events to this stream. */
  applicationId: Scalars['GenericApplicationId']['input'];
  /** The name of this stream: an application can have multiple streams with different names. */
  streamName: Scalars['StreamName']['input'];
};

export type SubscriptionRoot = {
  __typename?: 'SubscriptionRoot';
  /** Subscribes to notifications from the specified chain. */
  notifications: Scalars['Notification']['output'];
};


export type SubscriptionRootNotificationsArgs = {
  chainId: Scalars['ChainId']['input'];
};

export type SystemExecutionStateView = {
  __typename?: 'SystemExecutionStateView';
  adminId?: Maybe<Scalars['ChainId']['output']>;
  balance: Scalars['Amount']['output'];
  balances: MapView_AccountOwner_Amount_11ef1379;
  committees: Scalars['JSONObject']['output'];
  description?: Maybe<Scalars['ChainDescription']['output']>;
  epoch: Scalars['Epoch']['output'];
  ownership: Scalars['ChainOwnership']['output'];
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

/** GraphQL-compatible metadata about a transaction. */
export type TransactionMetadata = {
  __typename?: 'TransactionMetadata';
  /** The incoming bundle, if this is a ReceiveMessages transaction */
  incomingBundle?: Maybe<IncomingBundle>;
  /** The operation, if this is an ExecuteOperation transaction */
  operation?: Maybe<Operation>;
  /** The type of transaction: "ReceiveMessages" or "ExecuteOperation" */
  transactionType: Scalars['String']['output'];
};

export type UnsignedBlockProposal = {
  __typename?: 'UnsignedBlockProposal';
  content: ProposalContent;
  originalProposal?: Maybe<Scalars['OriginalProposal']['output']>;
  outcome: BlockExecutionOutcome;
};

export type BalanceQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  owner?: InputMaybe<Scalars['AccountOwner']['input']>;
}>;


export type BalanceQuery = { __typename?: 'QueryRoot', balance: any };

export type BalancesQueryVariables = Exact<{
  chainOwners: Array<ChainOwners> | ChainOwners;
}>;


export type BalancesQuery = { __typename?: 'QueryRoot', balances: any };

export type ApplicationsQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
}>;


export type ApplicationsQuery = { __typename?: 'QueryRoot', applications: Array<{ __typename?: 'ApplicationOverview', id: any, link: string }> };

export type OwnerChainsQueryVariables = Exact<{
  owner: Scalars['AccountOwner']['input'];
}>;


export type OwnerChainsQuery = { __typename?: 'QueryRoot', ownerChains: { __typename?: 'Chains', list: Array<any>, default?: any | null } };

export type ImportChainMutationVariables = Exact<{
  owner: Scalars['AccountOwner']['input'];
  chainId: Scalars['ChainId']['input'];
  signature: Scalars['AccountSignature']['input'];
  creatorChainId: Scalars['ChainId']['input'];
}>;


export type ImportChainMutation = { __typename?: 'MutationRoot', importChain: any };

export type SubmitSignedBlockMutationVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  block: SignedBlock;
}>;


export type SubmitSignedBlockMutation = { __typename?: 'MutationRoot', submitSignedBlock: any };

export type SubmitSignedBlockBcsMutationVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  block: Scalars['SignedBlockBcs']['input'];
}>;


export type SubmitSignedBlockBcsMutation = { __typename?: 'MutationRoot', submitSignedBlockBcs: any };

export type NotificationsSubscriptionVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
}>;


export type NotificationsSubscription = { __typename?: 'SubscriptionRoot', notifications: any };

export type BlockQueryVariables = Exact<{
  hash?: InputMaybe<Scalars['CryptoHash']['input']>;
  chainId: Scalars['ChainId']['input'];
}>;


export type BlockQuery = { __typename?: 'QueryRoot', block?: { __typename?: 'ConfirmedBlock', status: string, hash: any, block: { __typename?: 'Block', header: { __typename?: 'BlockHeader', chainId: any, epoch: any, height: any, timestamp: any, stateHash: any, previousBlockHash?: any | null, authenticatedSigner?: any | null, transactionsHash: any, messagesHash: any, previousMessageBlocksHash: any, previousEventBlocksHash: any, oracleResponsesHash: any, eventsHash: any, blobsHash: any, operationResultsHash: any }, body: { __typename?: 'BlockBody', previousMessageBlocks: any, previousEventBlocks: any, oracleResponses: Array<Array<any>>, blobs: Array<Array<any>>, operationResults: Array<any>, messages: Array<Array<{ __typename?: 'OutgoingMessage', destination: any, authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, message: any }>>, events: Array<Array<{ __typename?: 'Event', index: number, value: Array<number>, streamId: { __typename?: 'StreamId', applicationId: any, streamName: any } }>>, transactionMetadata: Array<{ __typename?: 'TransactionMetadata', transactionType: string, incomingBundle?: { __typename?: 'IncomingBundle', origin: any, action: any, bundle: { __typename?: 'MessageBundle', height: any, timestamp: any, certificateHash: any, transactionIndex: number, messages: Array<{ __typename?: 'PostedMessage', authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, index: number, message: any }> } } | null, operation?: { __typename?: 'Operation', operationType: string, applicationId?: any | null, userBytesHex?: string | null, systemBytesHex?: string | null } | null }> } } } | null };

export type BlockMaterialQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  maxPendingMessages: Scalars['Int']['input'];
}>;


export type BlockMaterialQuery = { __typename?: 'QueryRoot', blockMaterial: { __typename?: 'CandidateBlockMaterial', localTime: any, round: any, incomingBundles: Array<{ __typename?: 'IncomingBundle', action: any, origin: any, bundle: { __typename?: 'MessageBundle', height: any, timestamp: any, certificateHash: any, transactionIndex: number, messages: Array<{ __typename?: 'PostedMessage', authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, index: number, message: any }> } }> } };

export type SimulateExecuteBlockMutationVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  blockMaterial: Scalars['BlockMaterial']['input'];
}>;


export type SimulateExecuteBlockMutation = { __typename?: 'MutationRoot', simulateExecuteBlock?: { __typename?: 'SimulatedBlockMaterial', blobBytes: Array<Array<number>>, blockProposal: { __typename?: 'UnsignedBlockProposal', originalProposal?: any | null, content: { __typename?: 'ProposalContent', round: any, block: { __typename?: 'ProposedBlock', chainId: any, epoch: any, height: any, timestamp: any, authenticatedSigner?: any | null, previousBlockHash?: any | null, transactionMetadata: Array<{ __typename?: 'TransactionMetadata', transactionType: string, incomingBundle?: { __typename?: 'IncomingBundle', origin: any, action: any, bundle: { __typename?: 'MessageBundle', height: any, timestamp: any, certificateHash: any, transactionIndex: number, messages: Array<{ __typename?: 'PostedMessage', authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, index: number, message: any }> } } | null, operation?: { __typename?: 'Operation', operationType: string, applicationId?: any | null, userBytesHex?: string | null, systemBytesHex?: string | null } | null }> }, outcome?: { __typename?: 'BlockExecutionOutcome', previousMessageBlocks: any, previousEventBlocks: any, stateHash: any, oracleResponses: Array<Array<any>>, blobs: Array<Array<any>>, operationResults: Array<any>, messages: Array<Array<{ __typename?: 'OutgoingMessage', destination: any, authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, message: any }>>, events: Array<Array<{ __typename?: 'Event', index: number, value: Array<number>, streamId: { __typename?: 'StreamId', applicationId: any, streamName: any } }>> } | null }, outcome: { __typename?: 'BlockExecutionOutcome', previousMessageBlocks: any, previousEventBlocks: any, stateHash: any, oracleResponses: Array<Array<any>>, blobs: Array<Array<any>>, operationResults: Array<any>, messages: Array<Array<{ __typename?: 'OutgoingMessage', destination: any, authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, message: any }>>, events: Array<Array<{ __typename?: 'Event', index: number, value: Array<number>, streamId: { __typename?: 'StreamId', applicationId: any, streamName: any } }>> } } } | null };

export type PendingMessagesQueryVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
}>;


export type PendingMessagesQuery = { __typename?: 'QueryRoot', pendingMessages: Array<{ __typename?: 'IncomingBundle', action: any, origin: any, bundle: { __typename?: 'MessageBundle', height: any, timestamp: any, certificateHash: any, transactionIndex: number, messages: Array<{ __typename?: 'PostedMessage', authenticatedSigner?: any | null, grant: any, refundGrantTo?: any | null, kind: any, index: number, message: any }> } }> };

export type TransferMutationVariables = Exact<{
  chainId: Scalars['ChainId']['input'];
  owner: Scalars['AccountOwner']['input'];
  recipient: Scalars['Account']['input'];
  amount: Scalars['Amount']['input'];
}>;


export type TransferMutation = { __typename?: 'MutationRoot', transfer: any };


export const BalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"balance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owner"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AccountOwner"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"owner"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owner"}}}]}]}}]} as unknown as DocumentNode<BalanceQuery, BalanceQueryVariables>;
export const BalancesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"balances"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainOwners"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainOwners"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"balances"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainOwners"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainOwners"}}}]}]}}]} as unknown as DocumentNode<BalancesQuery, BalancesQueryVariables>;
export const ApplicationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"applications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"link"}}]}}]}}]} as unknown as DocumentNode<ApplicationsQuery, ApplicationsQueryVariables>;
export const OwnerChainsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ownerChains"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owner"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AccountOwner"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ownerChains"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"owner"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owner"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"list"}},{"kind":"Field","name":{"kind":"Name","value":"default"}}]}}]}}]} as unknown as DocumentNode<OwnerChainsQuery, OwnerChainsQueryVariables>;
export const ImportChainDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"importChain"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owner"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AccountOwner"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signature"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AccountSignature"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"creatorChainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importChain"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"owner"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owner"}}},{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"signature"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signature"}}},{"kind":"Argument","name":{"kind":"Name","value":"creatorChainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"creatorChainId"}}}]}]}}]} as unknown as DocumentNode<ImportChainMutation, ImportChainMutationVariables>;
export const SubmitSignedBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"submitSignedBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"block"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignedBlock"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitSignedBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"block"},"value":{"kind":"Variable","name":{"kind":"Name","value":"block"}}}]}]}}]} as unknown as DocumentNode<SubmitSignedBlockMutation, SubmitSignedBlockMutationVariables>;
export const SubmitSignedBlockBcsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"submitSignedBlockBcs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"block"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignedBlockBcs"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitSignedBlockBcs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"block"},"value":{"kind":"Variable","name":{"kind":"Name","value":"block"}}}]}]}}]} as unknown as DocumentNode<SubmitSignedBlockBcsMutation, SubmitSignedBlockBcsMutationVariables>;
export const NotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"notifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}}]}]}}]} as unknown as DocumentNode<NotificationsSubscription, NotificationsSubscriptionVariables>;
export const BlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"block"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hash"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CryptoHash"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"hash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hash"}}},{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"header"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chainId"}},{"kind":"Field","name":{"kind":"Name","value":"epoch"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"stateHash"}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockHash"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"transactionsHash"}},{"kind":"Field","name":{"kind":"Name","value":"messagesHash"}},{"kind":"Field","name":{"kind":"Name","value":"previousMessageBlocksHash"}},{"kind":"Field","name":{"kind":"Name","value":"previousEventBlocksHash"}},{"kind":"Field","name":{"kind":"Name","value":"oracleResponsesHash"}},{"kind":"Field","name":{"kind":"Name","value":"eventsHash"}},{"kind":"Field","name":{"kind":"Name","value":"blobsHash"}},{"kind":"Field","name":{"kind":"Name","value":"operationResultsHash"}}]}},{"kind":"Field","name":{"kind":"Name","value":"body"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"destination"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousMessageBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"previousEventBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"oracleResponses"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streamId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applicationId"}},{"kind":"Field","name":{"kind":"Name","value":"streamName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blobs"}},{"kind":"Field","name":{"kind":"Name","value":"operationResults"}},{"kind":"Field","name":{"kind":"Name","value":"transactionMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"incomingBundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"bundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"certificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIndex"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"action"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operationType"}},{"kind":"Field","name":{"kind":"Name","value":"applicationId"}},{"kind":"Field","name":{"kind":"Name","value":"userBytesHex"}},{"kind":"Field","name":{"kind":"Name","value":"systemBytesHex"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<BlockQuery, BlockQueryVariables>;
export const BlockMaterialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"blockMaterial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxPendingMessages"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockMaterial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxPendingMessages"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxPendingMessages"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"incomingBundles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"bundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"certificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIndex"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"origin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"localTime"}},{"kind":"Field","name":{"kind":"Name","value":"round"}}]}}]}}]} as unknown as DocumentNode<BlockMaterialQuery, BlockMaterialQueryVariables>;
export const SimulateExecuteBlockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"simulateExecuteBlock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blockMaterial"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BlockMaterial"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"simulateExecuteBlock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"blockMaterial"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blockMaterial"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blockProposal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"chainId"}},{"kind":"Field","name":{"kind":"Name","value":"epoch"}},{"kind":"Field","name":{"kind":"Name","value":"transactionMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionType"}},{"kind":"Field","name":{"kind":"Name","value":"incomingBundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"origin"}},{"kind":"Field","name":{"kind":"Name","value":"bundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"certificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIndex"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"action"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operationType"}},{"kind":"Field","name":{"kind":"Name","value":"applicationId"}},{"kind":"Field","name":{"kind":"Name","value":"userBytesHex"}},{"kind":"Field","name":{"kind":"Name","value":"systemBytesHex"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"previousBlockHash"}}]}},{"kind":"Field","name":{"kind":"Name","value":"round"}},{"kind":"Field","name":{"kind":"Name","value":"outcome"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"destination"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousMessageBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"previousEventBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"stateHash"}},{"kind":"Field","name":{"kind":"Name","value":"oracleResponses"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streamId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applicationId"}},{"kind":"Field","name":{"kind":"Name","value":"streamName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blobs"}},{"kind":"Field","name":{"kind":"Name","value":"operationResults"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"outcome"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"destination"}},{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousMessageBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"previousEventBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"stateHash"}},{"kind":"Field","name":{"kind":"Name","value":"oracleResponses"}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"streamId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applicationId"}},{"kind":"Field","name":{"kind":"Name","value":"streamName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blobs"}},{"kind":"Field","name":{"kind":"Name","value":"operationResults"}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalProposal"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blobBytes"}}]}}]}}]} as unknown as DocumentNode<SimulateExecuteBlockMutation, SimulateExecuteBlockMutationVariables>;
export const PendingMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"pendingMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pendingMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"bundle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"certificateHash"}},{"kind":"Field","name":{"kind":"Name","value":"transactionIndex"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authenticatedSigner"}},{"kind":"Field","name":{"kind":"Name","value":"grant"}},{"kind":"Field","name":{"kind":"Name","value":"refundGrantTo"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"origin"}}]}}]}}]} as unknown as DocumentNode<PendingMessagesQuery, PendingMessagesQueryVariables>;
export const TransferDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"transfer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainId"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owner"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AccountOwner"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Amount"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transfer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"chainId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"chainId"}}},{"kind":"Argument","name":{"kind":"Name","value":"owner"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owner"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipient"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipient"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}]}]}}]} as unknown as DocumentNode<TransferMutation, TransferMutationVariables>;