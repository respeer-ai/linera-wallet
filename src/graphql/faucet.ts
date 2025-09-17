import { gql } from '@apollo/client/core'

export const OPEN_CHAIN = gql`
  mutation openChain($owner: AccountOwner!) {
    claim(owner: $owner)
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
