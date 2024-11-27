import { gql } from '@apollo/client/core'

export const OPEN_CHAIN = gql`
  mutation openChain($publicKey: PublicKey!) {
    claim(publicKey: $publicKey) {
      messageId
      chainId
      certificateHash
    }
  }
`

export const NETWORK_INFO = gql`
  query networkInfo {
    genesisConfig
    version {
      crateVersion
      gitCommit
      gitDirty
      rpcHash
      graphqlHash
      witHash
    }
    currentValidators {
      name
      networkAddress
    }
  }
`
