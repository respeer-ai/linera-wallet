/* eslint-disable */
import * as types from './graphql'
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

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
  '\n  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {\n    balance(chainId: $chainId, publicKey: $publicKey)\n  }':
    types.GetAccountBalanceDocument,
  '\n  query getChainAccountBalances($chainIds: [ChainId!]!, $publicKeys: [PublicKey!]!) {\n    balances(chainIds: $chainIds, publicKeys: $publicKeys)\n  }':
    types.GetChainAccountBalancesDocument,
  '\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n      description\n    }\n  }':
    types.ApplicationsDocument,
  '\n  query chainsWithPublicKey ($publicKey: PublicKey!) {\n    chainsWithPublicKey(publicKey: $publicKey) {\n      list\n      default\n    }\n  }':
    types.ChainsWithPublicKeyDocument,
  '\n  mutation walletInitWithoutKeypair ($publicKey: PublicKey!, $signature: Signature!, $faucetUrl: String!, $chainId: ChainId!, $messageId: MessageId!, $certificateHash: CryptoHash!) {\n    walletInitWithoutKeypair(publicKey: $publicKey, signature: $signature, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, certificateHash: $certificateHash)\n  }':
    types.WalletInitWithoutKeypairDocument,
  '\n  query getPendingRawBlock($chainId: ChainId!) {\n    peekCandidateRawBlockPayload(chainId: $chainId) {\n      height\n      payloadBytes\n    }\n  }':
    types.GetPendingRawBlockDocument,
  '\n  mutation submitBlockSignature ($chainId: ChainId!, $height: BlockHeight!, $signature: Signature!) {\n    submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)\n  }':
    types.SubmitBlockSignatureDocument,
  '\n  mutation submitBlockAndSignature ($chainId: ChainId!, $height: BlockHeight!, $executedBlock: UserExecutedBlock!, $round: Round!, $signature: Signature!) {\n    submitBlockAndSignature(chainId: $chainId, height: $height, executedBlock: $executedBlock, round: $round, signature: $signature)\n  }':
    types.SubmitBlockAndSignatureDocument,
  '\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }':
    types.NotificationsDocument,
  '\n  query block($chainId: ChainId!, $hash: CryptoHash!) {\n    block(chainId: $chainId, hash: $hash) {\n      hash\n      value {\n        status\n        executedBlock {\n          block {\n            chainId\n            epoch\n            incomingBundles {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operations\n            height\n            timestamp\n            authenticatedSigner\n            previousBlockHash\n          }\n          outcome {\n            messages {\n              destination\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              message\n            }\n            stateHash\n            oracleResponses\n            events {\n              streamId {\n                applicationId\n                streamName\n              }\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  }':
    types.BlockDocument,
  '\n  query blockMaterial($chainId: ChainId!) {\n    blockMaterial(chainId: $chainId) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }':
    types.BlockMaterialDocument,
  '\n  mutation executeBlockWithFullMaterials (\n    $chainId: ChainId!,\n    $operations: [Operation!]!,\n    $incomingBundles: [UserIncomingBundle!]!,\n    $localTime: Timestamp!\n  ) {\n    executeBlockWithFullMaterials(\n      chainId: $chainId,\n      operations: $operations,\n      incomingBundles: $incomingBundles,\n      localTime: $localTime\n    ) {\n      block {\n        chainId\n        epoch\n        height\n        timestamp\n        authenticatedSigner\n        previousBlockHash\n        incomingBundles {\n          origin\n          bundle {\n            height\n            timestamp\n            certificateHash\n            transactionIndex\n            messages {\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              index\n              message\n            }\n          }\n          action\n        }\n        operations\n      }\n      outcome {\n        messages {\n          destination\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          message\n        }\n        stateHash\n        oracleResponses\n        events {\n          streamId {\n            applicationId\n            streamName\n          }\n          key\n          value\n        }\n      }\n    }\n  }':
    types.ExecuteBlockWithFullMaterialsDocument,
  '\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }':
    types.PendingMessagesDocument,
  '\n  mutation transfer ($fromPublicKey: PublicKey, $fromChainId: ChainId!, $toPublicKey: PublicKey, $toChainId: ChainId!, $amount: Amount!) {\n    transferWithoutBlockProposal(fromPublicKey: $fromPublicKey, fromChainId: $fromChainId, toPublicKey: $toPublicKey, toChainId: $toChainId, amount: $amount)\n  }':
    types.TransferDocument
}

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
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {\n    balance(chainId: $chainId, publicKey: $publicKey)\n  }'
): (typeof documents)['\n  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {\n    balance(chainId: $chainId, publicKey: $publicKey)\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getChainAccountBalances($chainIds: [ChainId!]!, $publicKeys: [PublicKey!]!) {\n    balances(chainIds: $chainIds, publicKeys: $publicKeys)\n  }'
): (typeof documents)['\n  query getChainAccountBalances($chainIds: [ChainId!]!, $publicKeys: [PublicKey!]!) {\n    balances(chainIds: $chainIds, publicKeys: $publicKeys)\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n      description\n    }\n  }'
): (typeof documents)['\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n      description\n    }\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query chainsWithPublicKey ($publicKey: PublicKey!) {\n    chainsWithPublicKey(publicKey: $publicKey) {\n      list\n      default\n    }\n  }'
): (typeof documents)['\n  query chainsWithPublicKey ($publicKey: PublicKey!) {\n    chainsWithPublicKey(publicKey: $publicKey) {\n      list\n      default\n    }\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation walletInitWithoutKeypair ($publicKey: PublicKey!, $signature: Signature!, $faucetUrl: String!, $chainId: ChainId!, $messageId: MessageId!, $certificateHash: CryptoHash!) {\n    walletInitWithoutKeypair(publicKey: $publicKey, signature: $signature, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, certificateHash: $certificateHash)\n  }'
): (typeof documents)['\n  mutation walletInitWithoutKeypair ($publicKey: PublicKey!, $signature: Signature!, $faucetUrl: String!, $chainId: ChainId!, $messageId: MessageId!, $certificateHash: CryptoHash!) {\n    walletInitWithoutKeypair(publicKey: $publicKey, signature: $signature, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, certificateHash: $certificateHash)\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query getPendingRawBlock($chainId: ChainId!) {\n    peekCandidateRawBlockPayload(chainId: $chainId) {\n      height\n      payloadBytes\n    }\n  }'
): (typeof documents)['\n  query getPendingRawBlock($chainId: ChainId!) {\n    peekCandidateRawBlockPayload(chainId: $chainId) {\n      height\n      payloadBytes\n    }\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation submitBlockSignature ($chainId: ChainId!, $height: BlockHeight!, $signature: Signature!) {\n    submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)\n  }'
): (typeof documents)['\n  mutation submitBlockSignature ($chainId: ChainId!, $height: BlockHeight!, $signature: Signature!) {\n    submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation submitBlockAndSignature ($chainId: ChainId!, $height: BlockHeight!, $executedBlock: UserExecutedBlock!, $round: Round!, $signature: Signature!) {\n    submitBlockAndSignature(chainId: $chainId, height: $height, executedBlock: $executedBlock, round: $round, signature: $signature)\n  }'
): (typeof documents)['\n  mutation submitBlockAndSignature ($chainId: ChainId!, $height: BlockHeight!, $executedBlock: UserExecutedBlock!, $round: Round!, $signature: Signature!) {\n    submitBlockAndSignature(chainId: $chainId, height: $height, executedBlock: $executedBlock, round: $round, signature: $signature)\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }'
): (typeof documents)['\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query block($chainId: ChainId!, $hash: CryptoHash!) {\n    block(chainId: $chainId, hash: $hash) {\n      hash\n      value {\n        status\n        executedBlock {\n          block {\n            chainId\n            epoch\n            incomingBundles {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operations\n            height\n            timestamp\n            authenticatedSigner\n            previousBlockHash\n          }\n          outcome {\n            messages {\n              destination\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              message\n            }\n            stateHash\n            oracleResponses\n            events {\n              streamId {\n                applicationId\n                streamName\n              }\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  }'
): (typeof documents)['\n  query block($chainId: ChainId!, $hash: CryptoHash!) {\n    block(chainId: $chainId, hash: $hash) {\n      hash\n      value {\n        status\n        executedBlock {\n          block {\n            chainId\n            epoch\n            incomingBundles {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operations\n            height\n            timestamp\n            authenticatedSigner\n            previousBlockHash\n          }\n          outcome {\n            messages {\n              destination\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              message\n            }\n            stateHash\n            oracleResponses\n            events {\n              streamId {\n                applicationId\n                streamName\n              }\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query blockMaterial($chainId: ChainId!) {\n    blockMaterial(chainId: $chainId) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }'
): (typeof documents)['\n  query blockMaterial($chainId: ChainId!) {\n    blockMaterial(chainId: $chainId) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation executeBlockWithFullMaterials (\n    $chainId: ChainId!,\n    $operations: [Operation!]!,\n    $incomingBundles: [UserIncomingBundle!]!,\n    $localTime: Timestamp!\n  ) {\n    executeBlockWithFullMaterials(\n      chainId: $chainId,\n      operations: $operations,\n      incomingBundles: $incomingBundles,\n      localTime: $localTime\n    ) {\n      block {\n        chainId\n        epoch\n        height\n        timestamp\n        authenticatedSigner\n        previousBlockHash\n        incomingBundles {\n          origin\n          bundle {\n            height\n            timestamp\n            certificateHash\n            transactionIndex\n            messages {\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              index\n              message\n            }\n          }\n          action\n        }\n        operations\n      }\n      outcome {\n        messages {\n          destination\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          message\n        }\n        stateHash\n        oracleResponses\n        events {\n          streamId {\n            applicationId\n            streamName\n          }\n          key\n          value\n        }\n      }\n    }\n  }'
): (typeof documents)['\n  mutation executeBlockWithFullMaterials (\n    $chainId: ChainId!,\n    $operations: [Operation!]!,\n    $incomingBundles: [UserIncomingBundle!]!,\n    $localTime: Timestamp!\n  ) {\n    executeBlockWithFullMaterials(\n      chainId: $chainId,\n      operations: $operations,\n      incomingBundles: $incomingBundles,\n      localTime: $localTime\n    ) {\n      block {\n        chainId\n        epoch\n        height\n        timestamp\n        authenticatedSigner\n        previousBlockHash\n        incomingBundles {\n          origin\n          bundle {\n            height\n            timestamp\n            certificateHash\n            transactionIndex\n            messages {\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              index\n              message\n            }\n          }\n          action\n        }\n        operations\n      }\n      outcome {\n        messages {\n          destination\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          message\n        }\n        stateHash\n        oracleResponses\n        events {\n          streamId {\n            applicationId\n            streamName\n          }\n          key\n          value\n        }\n      }\n    }\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }'
): (typeof documents)['\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation transfer ($fromPublicKey: PublicKey, $fromChainId: ChainId!, $toPublicKey: PublicKey, $toChainId: ChainId!, $amount: Amount!) {\n    transferWithoutBlockProposal(fromPublicKey: $fromPublicKey, fromChainId: $fromChainId, toPublicKey: $toPublicKey, toChainId: $toChainId, amount: $amount)\n  }'
): (typeof documents)['\n  mutation transfer ($fromPublicKey: PublicKey, $fromChainId: ChainId!, $toPublicKey: PublicKey, $toChainId: ChainId!, $amount: Amount!) {\n    transferWithoutBlockProposal(fromPublicKey: $fromPublicKey, fromChainId: $fromChainId, toPublicKey: $toPublicKey, toChainId: $toChainId, amount: $amount)\n  }']

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
