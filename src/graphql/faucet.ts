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
