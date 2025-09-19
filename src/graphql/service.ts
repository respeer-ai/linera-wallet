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
  query ownerChains($owner: AccountOwner!) {
    ownerChains(owner: $owner) {
      list
      default
    }
  }
`

export const IMPORT_CHAIN = gql`
  mutation importChain(
    $owner: AccountOwner!
    $chainId: ChainId!
    $signature: AccountSignature!
    $creatorChainId: ChainId!
  ) {
    importChain(
      owner: $owner
      chainId: $chainId
      signature: $signature
      creatorChainId: $creatorChainId
    )
  }
`

export const SUBMIT_SIGNED_BLOCK = gql`
  mutation submitSignedBlock(
    $chainId: ChainId!
    $block: SignedBlock!
  ) {
    submitSignedBlock(chainId: $chainId, block: $block)
  }
`

export const SUBMIT_SIGNED_BLOCK_BCS = gql`
  mutation submitSignedBlockBcs(
    $chainId: ChainId!
    $block: SignedBlockBcs!
  ) {
    submitSignedBlockBcs(
      chainId: $chainId
      block: $block
    )
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
      status
      hash
      block {
        header {
          chainId
          epoch
          height
          timestamp
          stateHash
          previousBlockHash
          authenticatedSigner
          transactionsHash
          messagesHash
          previousMessageBlocksHash
          previousEventBlocksHash
          oracleResponsesHash
          eventsHash
          blobsHash
          operationResultsHash
        }
        body {
          messages {
            destination
            authenticatedSigner
            grant
            refundGrantTo
            kind
            message
          }
          previousMessageBlocks
          previousEventBlocks
          oracleResponses
          events {
            streamId {
              applicationId
              streamName
            }
            index
            value
          }
          blobs
          operationResults
          transactionMetadata {
            transactionType
            incomingBundle {
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
            operation {
              operationType
              applicationId
              userBytesHex
              systemBytesHex
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

export const SIMULATE_EXECUTE_BLOCK = gql`
  mutation simulateExecuteBlock(
    $chainId: ChainId!
    $blockMaterial: BlockMaterial!
  ) {
    simulateExecuteBlock(chainId: $chainId, blockMaterial: $blockMaterial) {
      blockProposal {
        content {
          block {
            chainId
            epoch
            transactionMetadata {
              transactionType
              incomingBundle {
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
              operation {
                operationType
                applicationId
                userBytesHex
                systemBytesHex
              }
            }
            height
            timestamp
            authenticatedSigner
            previousBlockHash
          }
          round
          outcome {
            messages {
              destination
              authenticatedSigner
              grant
              refundGrantTo
              kind
              message
            }
            previousMessageBlocks
            previousEventBlocks
            stateHash
            oracleResponses
            events {
              streamId {
                applicationId
                streamName
              }
              index
              value
            }
            blobs
            operationResults
          }
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
          previousMessageBlocks
          previousEventBlocks
          stateHash
          oracleResponses
          events {
            streamId {
              applicationId
              streamName
            }
            index
            value
          }
          blobs
          operationResults
        }
        originalProposal
      }
      blobBytes
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
    $owner: AccountOwner!
    $recipient: Account!
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
