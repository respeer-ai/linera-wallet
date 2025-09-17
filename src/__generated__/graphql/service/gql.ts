/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query balance($chainId: ChainId!, $owner: AccountOwner) {\n    balance(chainId: $chainId, owner: $owner)\n  }\n": types.BalanceDocument,
    "\n  query balances($chainOwners: [ChainOwners!]!) {\n    balances(chainOwners: $chainOwners)\n  }\n": types.BalancesDocument,
    "\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n    }\n  }\n": types.ApplicationsDocument,
    "\n  query ownerChains($owner: AccountOwner!) {\n    ownerChains(owner: $owner) {\n      list\n      default\n    }\n  }\n": types.OwnerChainsDocument,
    "\n  mutation walletInitWithoutSecretKey(\n    $chainId: ChainId!\n    $initializer: WalletInitializer!\n  ) {\n    walletInitWithoutSecretKey(\n      chainId: $chainId\n      initializer: $initializer\n    )\n  }\n": types.WalletInitWithoutSecretKeyDocument,
    "\n  mutation submitSignedBlock(\n    $chainId: ChainId!\n    $block: SignedBlock!\n  ) {\n    submitSignedBlock(chainId: $chainId, block: $block)\n  }\n": types.SubmitSignedBlockDocument,
    "\n  mutation submitSignedBlockBcs(\n    $chainId: ChainId!\n    $block: SignedBlockBcs!\n  ) {\n    submitSignedBlockBcs(\n      chainId: $chainId\n      block: $block\n    )\n  }\n": types.SubmitSignedBlockBcsDocument,
    "\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }\n": types.NotificationsDocument,
    "\n  query block($hash: CryptoHash, $chainId: ChainId!) {\n    block(hash: $hash, chainId: $chainId) {\n      status\n      hash\n      block {\n        header {\n          chainId\n          epoch\n          height\n          timestamp\n          stateHash\n          previousBlockHash\n          authenticatedSigner\n          transactionsHash\n          messagesHash\n          previousMessageBlocksHash\n          previousEventBlocksHash\n          oracleResponsesHash\n          eventsHash\n          blobsHash\n          operationResultsHash\n        }\n        body {\n          messages {\n            destination\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            message\n          }\n          previousMessageBlocks\n          previousEventBlocks\n          oracleResponses\n          events {\n            streamId {\n              applicationId\n              streamName\n            }\n            index\n            value\n          }\n          blobs\n          operationResults\n          transactionMetadata {\n            transactionType\n            incomingBundle {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operation {\n              operationType\n              applicationId\n              userBytesHex\n              systemBytesHex\n            }\n          }\n        }\n      }\n    }\n  }\n": types.BlockDocument,
    "\n  query blockMaterial($chainId: ChainId!, $maxPendingMessages: Int!) {\n    blockMaterial(chainId: $chainId, maxPendingMessages: $maxPendingMessages) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }\n": types.BlockMaterialDocument,
    "\n  mutation simulateExecuteBlock(\n    $chainId: ChainId!\n    $blockMaterial: BlockMaterial!\n  ) {\n    simulateExecuteBlock(chainId: $chainId, blockMaterial: $blockMaterial) {\n      blockProposal\n      blobBytes\n    }\n  }\n": types.SimulateExecuteBlockDocument,
    "\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }\n": types.PendingMessagesDocument,
    "\n  mutation transfer(\n    $chainId: ChainId!\n    $owner: AccountOwner!\n    $recipient: Account!\n    $amount: Amount!\n  ) {\n    transfer(\n      chainId: $chainId\n      owner: $owner\n      recipient: $recipient\n      amount: $amount\n    )\n  }\n": types.TransferDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query balance($chainId: ChainId!, $owner: AccountOwner) {\n    balance(chainId: $chainId, owner: $owner)\n  }\n"): (typeof documents)["\n  query balance($chainId: ChainId!, $owner: AccountOwner) {\n    balance(chainId: $chainId, owner: $owner)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query balances($chainOwners: [ChainOwners!]!) {\n    balances(chainOwners: $chainOwners)\n  }\n"): (typeof documents)["\n  query balances($chainOwners: [ChainOwners!]!) {\n    balances(chainOwners: $chainOwners)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n    }\n  }\n"): (typeof documents)["\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ownerChains($owner: AccountOwner!) {\n    ownerChains(owner: $owner) {\n      list\n      default\n    }\n  }\n"): (typeof documents)["\n  query ownerChains($owner: AccountOwner!) {\n    ownerChains(owner: $owner) {\n      list\n      default\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation walletInitWithoutSecretKey(\n    $chainId: ChainId!\n    $initializer: WalletInitializer!\n  ) {\n    walletInitWithoutSecretKey(\n      chainId: $chainId\n      initializer: $initializer\n    )\n  }\n"): (typeof documents)["\n  mutation walletInitWithoutSecretKey(\n    $chainId: ChainId!\n    $initializer: WalletInitializer!\n  ) {\n    walletInitWithoutSecretKey(\n      chainId: $chainId\n      initializer: $initializer\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation submitSignedBlock(\n    $chainId: ChainId!\n    $block: SignedBlock!\n  ) {\n    submitSignedBlock(chainId: $chainId, block: $block)\n  }\n"): (typeof documents)["\n  mutation submitSignedBlock(\n    $chainId: ChainId!\n    $block: SignedBlock!\n  ) {\n    submitSignedBlock(chainId: $chainId, block: $block)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation submitSignedBlockBcs(\n    $chainId: ChainId!\n    $block: SignedBlockBcs!\n  ) {\n    submitSignedBlockBcs(\n      chainId: $chainId\n      block: $block\n    )\n  }\n"): (typeof documents)["\n  mutation submitSignedBlockBcs(\n    $chainId: ChainId!\n    $block: SignedBlockBcs!\n  ) {\n    submitSignedBlockBcs(\n      chainId: $chainId\n      block: $block\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }\n"): (typeof documents)["\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query block($hash: CryptoHash, $chainId: ChainId!) {\n    block(hash: $hash, chainId: $chainId) {\n      status\n      hash\n      block {\n        header {\n          chainId\n          epoch\n          height\n          timestamp\n          stateHash\n          previousBlockHash\n          authenticatedSigner\n          transactionsHash\n          messagesHash\n          previousMessageBlocksHash\n          previousEventBlocksHash\n          oracleResponsesHash\n          eventsHash\n          blobsHash\n          operationResultsHash\n        }\n        body {\n          messages {\n            destination\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            message\n          }\n          previousMessageBlocks\n          previousEventBlocks\n          oracleResponses\n          events {\n            streamId {\n              applicationId\n              streamName\n            }\n            index\n            value\n          }\n          blobs\n          operationResults\n          transactionMetadata {\n            transactionType\n            incomingBundle {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operation {\n              operationType\n              applicationId\n              userBytesHex\n              systemBytesHex\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query block($hash: CryptoHash, $chainId: ChainId!) {\n    block(hash: $hash, chainId: $chainId) {\n      status\n      hash\n      block {\n        header {\n          chainId\n          epoch\n          height\n          timestamp\n          stateHash\n          previousBlockHash\n          authenticatedSigner\n          transactionsHash\n          messagesHash\n          previousMessageBlocksHash\n          previousEventBlocksHash\n          oracleResponsesHash\n          eventsHash\n          blobsHash\n          operationResultsHash\n        }\n        body {\n          messages {\n            destination\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            message\n          }\n          previousMessageBlocks\n          previousEventBlocks\n          oracleResponses\n          events {\n            streamId {\n              applicationId\n              streamName\n            }\n            index\n            value\n          }\n          blobs\n          operationResults\n          transactionMetadata {\n            transactionType\n            incomingBundle {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operation {\n              operationType\n              applicationId\n              userBytesHex\n              systemBytesHex\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query blockMaterial($chainId: ChainId!, $maxPendingMessages: Int!) {\n    blockMaterial(chainId: $chainId, maxPendingMessages: $maxPendingMessages) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }\n"): (typeof documents)["\n  query blockMaterial($chainId: ChainId!, $maxPendingMessages: Int!) {\n    blockMaterial(chainId: $chainId, maxPendingMessages: $maxPendingMessages) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation simulateExecuteBlock(\n    $chainId: ChainId!\n    $blockMaterial: BlockMaterial!\n  ) {\n    simulateExecuteBlock(chainId: $chainId, blockMaterial: $blockMaterial) {\n      blockProposal\n      blobBytes\n    }\n  }\n"): (typeof documents)["\n  mutation simulateExecuteBlock(\n    $chainId: ChainId!\n    $blockMaterial: BlockMaterial!\n  ) {\n    simulateExecuteBlock(chainId: $chainId, blockMaterial: $blockMaterial) {\n      blockProposal\n      blobBytes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }\n"): (typeof documents)["\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation transfer(\n    $chainId: ChainId!\n    $owner: AccountOwner!\n    $recipient: Account!\n    $amount: Amount!\n  ) {\n    transfer(\n      chainId: $chainId\n      owner: $owner\n      recipient: $recipient\n      amount: $amount\n    )\n  }\n"): (typeof documents)["\n  mutation transfer(\n    $chainId: ChainId!\n    $owner: AccountOwner!\n    $recipient: Account!\n    $amount: Amount!\n  ) {\n    transfer(\n      chainId: $chainId\n      owner: $owner\n      recipient: $recipient\n      amount: $amount\n    )\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;