import { gql } from '@apollo/client/core'

export const OPEN_CHAIN = gql`
  mutation openChain($owner: Owner!) {
    claim(owner: $owner) {
      messageId
      chainId
      certificateHash
    }
  }
`

export const NETWORK_INFO = gql`
  query networkInfo {
    genesisConfig
    version
    currentValidators {
      publicKey
      networkAddress
    }
  }
`
