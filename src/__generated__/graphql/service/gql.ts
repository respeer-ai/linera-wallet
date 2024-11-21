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
    "\n  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {\n    balance(chainId: $chainId, publicKey: $publicKey)\n  }\n": types.GetAccountBalanceDocument,
    "\n  query getChainAccountBalances(\n    $chainIds: [ChainId!]!\n    $publicKeys: [PublicKey!]!\n  ) {\n    balances(chainIds: $chainIds, publicKeys: $publicKeys)\n  }\n": types.GetChainAccountBalancesDocument,
    "\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n      description\n    }\n  }\n": types.ApplicationsDocument,
    "\n  query chainsWithPublicKey($publicKey: PublicKey!) {\n    chainsWithPublicKey(publicKey: $publicKey) {\n      list\n      default\n    }\n  }\n": types.ChainsWithPublicKeyDocument,
    "\n  mutation walletInitWithoutKeypair(\n    $publicKey: PublicKey!\n    $signature: Signature!\n    $faucetUrl: String!\n    $chainId: ChainId!\n    $messageId: MessageId!\n    $certificateHash: CryptoHash!\n  ) {\n    walletInitWithoutKeypair(\n      publicKey: $publicKey\n      signature: $signature\n      faucetUrl: $faucetUrl\n      chainId: $chainId\n      messageId: $messageId\n      certificateHash: $certificateHash\n    )\n  }\n": types.WalletInitWithoutKeypairDocument,
    "\n  query getPendingRawBlock($chainId: ChainId!) {\n    peekCandidateRawBlockPayload(chainId: $chainId) {\n      height\n      payloadBytes\n    }\n  }\n": types.GetPendingRawBlockDocument,
    "\n  mutation submitBlockSignature(\n    $chainId: ChainId!\n    $height: BlockHeight!\n    $signature: Signature!\n  ) {\n    submitBlockSignature(\n      chainId: $chainId\n      height: $height\n      signature: $signature\n    )\n  }\n": types.SubmitBlockSignatureDocument,
    "\n  mutation submitBlockAndSignature(\n    $chainId: ChainId!\n    $height: BlockHeight!\n    $executedBlock: UserExecutedBlock!\n    $round: Round!\n    $signature: Signature!\n    $retry: Boolean!\n    $validatedBlockCertificateHash: CryptoHash\n  ) {\n    submitBlockAndSignature(\n      chainId: $chainId\n      height: $height\n      executedBlock: $executedBlock\n      round: $round\n      signature: $signature\n      retry: $retry\n      validatedBlockCertificateHash: $validatedBlockCertificateHash\n    )\n  }\n": types.SubmitBlockAndSignatureDocument,
    "\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }\n": types.NotificationsDocument,
    "\n  query block($chainId: ChainId!, $hash: CryptoHash!) {\n    block(chainId: $chainId, hash: $hash) {\n      hash\n      value {\n        status\n        executedBlock {\n          block {\n            chainId\n            epoch\n            incomingBundles {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operations\n            height\n            timestamp\n            authenticatedSigner\n            previousBlockHash\n          }\n          outcome {\n            messages {\n              destination\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              message\n            }\n            stateHash\n            oracleResponses\n            events {\n              streamId {\n                applicationId\n                streamName\n              }\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  }\n": types.BlockDocument,
    "\n  query blockMaterial($chainId: ChainId!) {\n    blockMaterial(chainId: $chainId) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }\n": types.BlockMaterialDocument,
    "\n  mutation executeBlockWithFullMaterials(\n    $chainId: ChainId!\n    $operations: [Operation!]!\n    $incomingBundles: [UserIncomingBundle!]!\n    $localTime: Timestamp!\n  ) {\n    executeBlockWithFullMaterials(\n      chainId: $chainId\n      operations: $operations\n      incomingBundles: $incomingBundles\n      localTime: $localTime\n    ) {\n      executedBlock {\n        block {\n          chainId\n          epoch\n          height\n          timestamp\n          authenticatedSigner\n          previousBlockHash\n          incomingBundles {\n            origin\n            bundle {\n              height\n              timestamp\n              certificateHash\n              transactionIndex\n              messages {\n                authenticatedSigner\n                grant\n                refundGrantTo\n                kind\n                index\n                message\n              }\n            }\n            action\n          }\n          operations\n        }\n        outcome {\n          messages {\n            destination\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            message\n          }\n          stateHash\n          oracleResponses\n          events {\n            streamId {\n              applicationId\n              streamName\n            }\n            key\n            value\n          }\n        }\n      }\n      validatedBlockCertificateHash\n      retry\n    }\n  }\n": types.ExecuteBlockWithFullMaterialsDocument,
    "\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }\n": types.PendingMessagesDocument,
    "\n  mutation transferWithoutBlockProposal(\n    $fromPublicKey: PublicKey\n    $fromChainId: ChainId!\n    $toPublicKey: PublicKey\n    $toChainId: ChainId!\n    $amount: Amount!\n  ) {\n    transferWithoutBlockProposal(\n      fromPublicKey: $fromPublicKey\n      fromChainId: $fromChainId\n      toPublicKey: $toPublicKey\n      toChainId: $toChainId\n      amount: $amount\n    )\n  }\n": types.TransferWithoutBlockProposalDocument,
    "\n  mutation transfer($chainId: ChainId!, $owner: Owner, $recipient: Recipient!, $amount: Amount!) {\n    transfer(chainId: $chainId, owner: $owner, recipient: $recipient, amount: $amount)\n  }\n": types.TransferDocument,
    "\n  mutation requestApplication($chainId: ChainId!, $applicationId: ApplicationId!, $targetChainId: ChainId!) {\n    requestApplication(chainId: $chainId, applicationId: $applicationId, targetChainId: $targetChainId)\n  }\n": types.RequestApplicationDocument,
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
export function graphql(source: "\n  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {\n    balance(chainId: $chainId, publicKey: $publicKey)\n  }\n"): (typeof documents)["\n  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {\n    balance(chainId: $chainId, publicKey: $publicKey)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getChainAccountBalances(\n    $chainIds: [ChainId!]!\n    $publicKeys: [PublicKey!]!\n  ) {\n    balances(chainIds: $chainIds, publicKeys: $publicKeys)\n  }\n"): (typeof documents)["\n  query getChainAccountBalances(\n    $chainIds: [ChainId!]!\n    $publicKeys: [PublicKey!]!\n  ) {\n    balances(chainIds: $chainIds, publicKeys: $publicKeys)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n      description\n    }\n  }\n"): (typeof documents)["\n  query applications($chainId: ChainId!) {\n    applications(chainId: $chainId) {\n      id\n      link\n      description\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query chainsWithPublicKey($publicKey: PublicKey!) {\n    chainsWithPublicKey(publicKey: $publicKey) {\n      list\n      default\n    }\n  }\n"): (typeof documents)["\n  query chainsWithPublicKey($publicKey: PublicKey!) {\n    chainsWithPublicKey(publicKey: $publicKey) {\n      list\n      default\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation walletInitWithoutKeypair(\n    $publicKey: PublicKey!\n    $signature: Signature!\n    $faucetUrl: String!\n    $chainId: ChainId!\n    $messageId: MessageId!\n    $certificateHash: CryptoHash!\n  ) {\n    walletInitWithoutKeypair(\n      publicKey: $publicKey\n      signature: $signature\n      faucetUrl: $faucetUrl\n      chainId: $chainId\n      messageId: $messageId\n      certificateHash: $certificateHash\n    )\n  }\n"): (typeof documents)["\n  mutation walletInitWithoutKeypair(\n    $publicKey: PublicKey!\n    $signature: Signature!\n    $faucetUrl: String!\n    $chainId: ChainId!\n    $messageId: MessageId!\n    $certificateHash: CryptoHash!\n  ) {\n    walletInitWithoutKeypair(\n      publicKey: $publicKey\n      signature: $signature\n      faucetUrl: $faucetUrl\n      chainId: $chainId\n      messageId: $messageId\n      certificateHash: $certificateHash\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getPendingRawBlock($chainId: ChainId!) {\n    peekCandidateRawBlockPayload(chainId: $chainId) {\n      height\n      payloadBytes\n    }\n  }\n"): (typeof documents)["\n  query getPendingRawBlock($chainId: ChainId!) {\n    peekCandidateRawBlockPayload(chainId: $chainId) {\n      height\n      payloadBytes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation submitBlockSignature(\n    $chainId: ChainId!\n    $height: BlockHeight!\n    $signature: Signature!\n  ) {\n    submitBlockSignature(\n      chainId: $chainId\n      height: $height\n      signature: $signature\n    )\n  }\n"): (typeof documents)["\n  mutation submitBlockSignature(\n    $chainId: ChainId!\n    $height: BlockHeight!\n    $signature: Signature!\n  ) {\n    submitBlockSignature(\n      chainId: $chainId\n      height: $height\n      signature: $signature\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation submitBlockAndSignature(\n    $chainId: ChainId!\n    $height: BlockHeight!\n    $executedBlock: UserExecutedBlock!\n    $round: Round!\n    $signature: Signature!\n    $retry: Boolean!\n    $validatedBlockCertificateHash: CryptoHash\n  ) {\n    submitBlockAndSignature(\n      chainId: $chainId\n      height: $height\n      executedBlock: $executedBlock\n      round: $round\n      signature: $signature\n      retry: $retry\n      validatedBlockCertificateHash: $validatedBlockCertificateHash\n    )\n  }\n"): (typeof documents)["\n  mutation submitBlockAndSignature(\n    $chainId: ChainId!\n    $height: BlockHeight!\n    $executedBlock: UserExecutedBlock!\n    $round: Round!\n    $signature: Signature!\n    $retry: Boolean!\n    $validatedBlockCertificateHash: CryptoHash\n  ) {\n    submitBlockAndSignature(\n      chainId: $chainId\n      height: $height\n      executedBlock: $executedBlock\n      round: $round\n      signature: $signature\n      retry: $retry\n      validatedBlockCertificateHash: $validatedBlockCertificateHash\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }\n"): (typeof documents)["\n  subscription notifications($chainId: ChainId!) {\n    notifications(chainId: $chainId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query block($chainId: ChainId!, $hash: CryptoHash!) {\n    block(chainId: $chainId, hash: $hash) {\n      hash\n      value {\n        status\n        executedBlock {\n          block {\n            chainId\n            epoch\n            incomingBundles {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operations\n            height\n            timestamp\n            authenticatedSigner\n            previousBlockHash\n          }\n          outcome {\n            messages {\n              destination\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              message\n            }\n            stateHash\n            oracleResponses\n            events {\n              streamId {\n                applicationId\n                streamName\n              }\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query block($chainId: ChainId!, $hash: CryptoHash!) {\n    block(chainId: $chainId, hash: $hash) {\n      hash\n      value {\n        status\n        executedBlock {\n          block {\n            chainId\n            epoch\n            incomingBundles {\n              origin\n              bundle {\n                height\n                timestamp\n                certificateHash\n                transactionIndex\n                messages {\n                  authenticatedSigner\n                  grant\n                  refundGrantTo\n                  kind\n                  index\n                  message\n                }\n              }\n              action\n            }\n            operations\n            height\n            timestamp\n            authenticatedSigner\n            previousBlockHash\n          }\n          outcome {\n            messages {\n              destination\n              authenticatedSigner\n              grant\n              refundGrantTo\n              kind\n              message\n            }\n            stateHash\n            oracleResponses\n            events {\n              streamId {\n                applicationId\n                streamName\n              }\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query blockMaterial($chainId: ChainId!) {\n    blockMaterial(chainId: $chainId) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }\n"): (typeof documents)["\n  query blockMaterial($chainId: ChainId!) {\n    blockMaterial(chainId: $chainId) {\n      incomingBundles {\n        action\n        bundle {\n          height\n          timestamp\n          certificateHash\n          transactionIndex\n          messages {\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            index\n            message\n          }\n        }\n        origin\n      }\n      localTime\n      round\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation executeBlockWithFullMaterials(\n    $chainId: ChainId!\n    $operations: [Operation!]!\n    $incomingBundles: [UserIncomingBundle!]!\n    $localTime: Timestamp!\n  ) {\n    executeBlockWithFullMaterials(\n      chainId: $chainId\n      operations: $operations\n      incomingBundles: $incomingBundles\n      localTime: $localTime\n    ) {\n      executedBlock {\n        block {\n          chainId\n          epoch\n          height\n          timestamp\n          authenticatedSigner\n          previousBlockHash\n          incomingBundles {\n            origin\n            bundle {\n              height\n              timestamp\n              certificateHash\n              transactionIndex\n              messages {\n                authenticatedSigner\n                grant\n                refundGrantTo\n                kind\n                index\n                message\n              }\n            }\n            action\n          }\n          operations\n        }\n        outcome {\n          messages {\n            destination\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            message\n          }\n          stateHash\n          oracleResponses\n          events {\n            streamId {\n              applicationId\n              streamName\n            }\n            key\n            value\n          }\n        }\n      }\n      validatedBlockCertificateHash\n      retry\n    }\n  }\n"): (typeof documents)["\n  mutation executeBlockWithFullMaterials(\n    $chainId: ChainId!\n    $operations: [Operation!]!\n    $incomingBundles: [UserIncomingBundle!]!\n    $localTime: Timestamp!\n  ) {\n    executeBlockWithFullMaterials(\n      chainId: $chainId\n      operations: $operations\n      incomingBundles: $incomingBundles\n      localTime: $localTime\n    ) {\n      executedBlock {\n        block {\n          chainId\n          epoch\n          height\n          timestamp\n          authenticatedSigner\n          previousBlockHash\n          incomingBundles {\n            origin\n            bundle {\n              height\n              timestamp\n              certificateHash\n              transactionIndex\n              messages {\n                authenticatedSigner\n                grant\n                refundGrantTo\n                kind\n                index\n                message\n              }\n            }\n            action\n          }\n          operations\n        }\n        outcome {\n          messages {\n            destination\n            authenticatedSigner\n            grant\n            refundGrantTo\n            kind\n            message\n          }\n          stateHash\n          oracleResponses\n          events {\n            streamId {\n              applicationId\n              streamName\n            }\n            key\n            value\n          }\n        }\n      }\n      validatedBlockCertificateHash\n      retry\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }\n"): (typeof documents)["\n  query pendingMessages($chainId: ChainId!) {\n    pendingMessages(chainId: $chainId) {\n      action\n      bundle {\n        height\n        timestamp\n        certificateHash\n        transactionIndex\n        messages {\n          authenticatedSigner\n          grant\n          refundGrantTo\n          kind\n          index\n          message\n        }\n      }\n      origin\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation transferWithoutBlockProposal(\n    $fromPublicKey: PublicKey\n    $fromChainId: ChainId!\n    $toPublicKey: PublicKey\n    $toChainId: ChainId!\n    $amount: Amount!\n  ) {\n    transferWithoutBlockProposal(\n      fromPublicKey: $fromPublicKey\n      fromChainId: $fromChainId\n      toPublicKey: $toPublicKey\n      toChainId: $toChainId\n      amount: $amount\n    )\n  }\n"): (typeof documents)["\n  mutation transferWithoutBlockProposal(\n    $fromPublicKey: PublicKey\n    $fromChainId: ChainId!\n    $toPublicKey: PublicKey\n    $toChainId: ChainId!\n    $amount: Amount!\n  ) {\n    transferWithoutBlockProposal(\n      fromPublicKey: $fromPublicKey\n      fromChainId: $fromChainId\n      toPublicKey: $toPublicKey\n      toChainId: $toChainId\n      amount: $amount\n    )\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation transfer($chainId: ChainId!, $owner: Owner, $recipient: Recipient!, $amount: Amount!) {\n    transfer(chainId: $chainId, owner: $owner, recipient: $recipient, amount: $amount)\n  }\n"): (typeof documents)["\n  mutation transfer($chainId: ChainId!, $owner: Owner, $recipient: Recipient!, $amount: Amount!) {\n    transfer(chainId: $chainId, owner: $owner, recipient: $recipient, amount: $amount)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation requestApplication($chainId: ChainId!, $applicationId: ApplicationId!, $targetChainId: ChainId!) {\n    requestApplication(chainId: $chainId, applicationId: $applicationId, targetChainId: $targetChainId)\n  }\n"): (typeof documents)["\n  mutation requestApplication($chainId: ChainId!, $applicationId: ApplicationId!, $targetChainId: ChainId!) {\n    requestApplication(chainId: $chainId, applicationId: $applicationId, targetChainId: $targetChainId)\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;