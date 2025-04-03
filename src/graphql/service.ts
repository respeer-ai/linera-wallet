import { gql } from '@apollo/client/core'

export const BALANCE = gql`
  query balance($chainId: ChainId!, $owner: AccountOwner) {
    balance(chainId: $chainId, owner: $owner)
  }
`

export const BALANCES = gql`
  query balances($chainOwners: [ChainOwners!]!) {
    balances(chainOwners: $chainOwners)
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

export const OWNER_CHAINS = gql`
  query ownerChains($owner: Owner!) {
    ownerChains(owner: $owner) {
      list
      default
    }
  }
`

export const WALLET_INIT_WITHOUT_SECRET_KEY = gql`
  mutation walletInitWithoutSecretKey(
    $chainId: ChainId!
    $initializer: WalletInitializer!
    $messageId: MessageId!
  ) {
    walletInitWithoutSecretKey(
      chainId: $chainId
      initializer: $initializer
      messageId: $messageId
    )
  }
`

export const SUBMIT_BLOCK_AND_SIGNATURE = gql`
  mutation submitBlockAndSignature(
    $chainId: ChainId!
    $height: BlockHeight!
    $block: SignedBlock!
  ) {
    submitBlockAndSignature(chainId: $chainId, height: $height, block: $block)
  }
`

export const NOTIFICATIONS = gql`
  subscription notifications($chainId: ChainId!) {
    notifications(chainId: $chainId)
  }
`

export const BLOCK = gql`
  query block($hash: CryptoHash, $chainId: ChainId!) {
    block(hash: $hash, chainId: $chainId) {
      hash
      value {
        status
        block {
          header {
            chainId
            epoch
            height
            timestamp
            stateHash
            previousBlockHash
            authenticatedSigner
            bundlesHash
            operationsHash
            messagesHash
            oracleResponsesHash
            eventsHash
            blobsHash
            operationResultsHash
          }
          body {
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
            messages {
              destination
              authenticatedSigner
              grant
              refundGrantTo
              kind
              message
            }
            oracleResponses
            events {
              streamId {
                applicationId
                streamName
              }
              key
              value
            }
            blobs
            operationResults
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

export const SIMULATE_EXECUTE_BLOCK = gql`
  mutation simulateExecuteBlock(
    $chainId: ChainId!
    $blockMaterial: BlockMaterial!
  ) {
    simulateExecuteBlock(chainId: $chainId, blockMaterial: $blockMaterial) {
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
          blobs
          operationResults
        }
      }
      blobIds
      validatedBlockCertificate
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

export const WALLET_INIT_PUBLIC_KEY = gql`
  mutation walletInitPublicKey(
    $publicKey: AccountPublicKey!
    $signature: AccountSignature!
  ) {
    walletInitPublicKey(publicKey: $publicKey, signature: $signature)
  }
`
