import { gql } from '@apollo/client/core'

export const GET_ACCOUNT_BALANCE = gql`
  query getAccountBalance($chainId: ChainId!, $publicKey: PublicKey) {
    balance(chainId: $chainId, publicKey: $publicKey)
  }
`

export const GET_CHAIN_ACCOUNT_BALANCES = gql`
  query getChainAccountBalances(
    $chainIds: [ChainId!]!
    $publicKeys: [PublicKey!]!
  ) {
    balances(chainIds: $chainIds, publicKeys: $publicKeys)
  }
`

export const APPLICATION_WITH_DESCRIPTIONS = gql`
  query applicationsWithOperations($chainId: ChainId!) {
    applications(chainId: $chainId) {
      id
      link
      description
    }
  }
`

export const APPLICATIONS = gql`
  query applications($chainId: ChainId!) {
    applications(chainId: $chainId) {
      id
      link
    }
  }
`

export const CHAINS_WITH_PUBLIC_KEY = gql`
  query chainsWithPublicKey($publicKey: PublicKey!) {
    chainsWithPublicKey(publicKey: $publicKey) {
      list
      default
    }
  }
`

export const WALLET_INIT_WITHOUT_KEYPAIR = gql`
  mutation walletInitWithoutKeypair(
    $publicKey: PublicKey!
    $signature: Signature!
    $faucetUrl: String!
    $chainId: ChainId!
    $messageId: MessageId!
    $certificateHash: CryptoHash!
  ) {
    walletInitWithoutKeypair(
      publicKey: $publicKey
      signature: $signature
      faucetUrl: $faucetUrl
      chainId: $chainId
      messageId: $messageId
      certificateHash: $certificateHash
    )
  }
`

export const SUBMIT_BLOCK_AND_SIGNATURE = gql`
  mutation submitBlockAndSignature(
    $chainId: ChainId!
    $height: BlockHeight!
    $executedBlock: UserExecutedBlock!
    $round: Round!
    $signature: Signature!
    $retry: Boolean!
    $validatedBlockCertificateHash: CryptoHash
  ) {
    submitBlockAndSignature(
      chainId: $chainId
      height: $height
      executedBlock: $executedBlock
      round: $round
      signature: $signature
      retry: $retry
      validatedBlockCertificateHash: $validatedBlockCertificateHash
    )
  }
`

export const NOTIFICATIONS = gql`
  subscription notifications($chainId: ChainId!) {
    notifications(chainId: $chainId)
  }
`

export const BLOCK = gql`
  query block($chainId: ChainId!, $hash: CryptoHash) {
    block(chainId: $chainId, hash: $hash) {
      hash
      value {
        status
        executedBlock {
          block {
            chainId
            epoch
            incomingBundles {
              origin
              bundle {
                height
                timestamp
                certificateHash
                transactionIndex
                messages {
                  authenticatedSigner
                  grant
                  refundGrantTo
                  kind
                  index
                  message
                }
              }
              action
            }
            operations
            height
            timestamp
            authenticatedSigner
            previousBlockHash
          }
          outcome {
            messages {
              destination
              authenticatedSigner
              grant
              refundGrantTo
              kind
              message
            }
            stateHash
            oracleResponses
            events {
              streamId {
                applicationId
                streamName
              }
              key
              value
            }
          }
        }
      }
    }
  }
`

export const BLOCK_MATERIAL = gql`
  query blockMaterial($chainId: ChainId!, $maxPendingMessages: Int!) {
    blockMaterial(chainId: $chainId, maxPendingMessages: $maxPendingMessages) {
      incomingBundles {
        action
        bundle {
          height
          timestamp
          certificateHash
          transactionIndex
          messages {
            authenticatedSigner
            grant
            refundGrantTo
            kind
            index
            message
          }
        }
        origin
      }
      localTime
      round
    }
  }
`

export const EXECUTE_BLOCK_WITH_FULL_MATERIALS = gql`
  mutation executeBlockWithFullMaterials(
    $chainId: ChainId!
    $operations: [Operation!]!
    $incomingBundles: [UserIncomingBundle!]!
    $localTime: Timestamp!
  ) {
    executeBlockWithFullMaterials(
      chainId: $chainId
      operations: $operations
      incomingBundles: $incomingBundles
      localTime: $localTime
    ) {
      executedBlock {
        block {
          chainId
          epoch
          height
          timestamp
          authenticatedSigner
          previousBlockHash
          incomingBundles {
            origin
            bundle {
              height
              timestamp
              certificateHash
              transactionIndex
              messages {
                authenticatedSigner
                grant
                refundGrantTo
                kind
                index
                message
              }
            }
            action
          }
          operations
        }
        outcome {
          messages {
            destination
            authenticatedSigner
            grant
            refundGrantTo
            kind
            message
          }
          stateHash
          oracleResponses
          events {
            streamId {
              applicationId
              streamName
            }
            key
            value
          }
        }
      }
      validatedBlockCertificateHash
      retry
    }
  }
`

export const PENDING_MESSAGES = gql`
  query pendingMessages($chainId: ChainId!) {
    pendingMessages(chainId: $chainId) {
      action
      bundle {
        height
        timestamp
        certificateHash
        transactionIndex
        messages {
          authenticatedSigner
          grant
          refundGrantTo
          kind
          index
          message
        }
      }
      origin
    }
  }
`

export const TRANSFER = gql`
  mutation transfer(
    $chainId: ChainId!
    $owner: Owner
    $recipient: Recipient!
    $amount: Amount!
  ) {
    transfer(
      chainId: $chainId
      owner: $owner
      recipient: $recipient
      amount: $amount
    )
  }
`

export const REQUEST_APPLICATION = gql`
  mutation requestApplication(
    $chainId: ChainId!
    $applicationId: ApplicationId!
    $targetChainId: ChainId!
  ) {
    requestApplication(
      chainId: $chainId
      applicationId: $applicationId
      targetChainId: $targetChainId
    )
  }
`

export const ADD_PENDING_BLOB = gql`
  mutation addPendingBlob($chainId: ChainId!, $bytes: [Int!]!) {
    addPendingBlob(chainId: $chainId, bytes: $bytes)
  }
`
