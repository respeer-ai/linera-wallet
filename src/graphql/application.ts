import { gql } from '@apollo/client/core'

export const SUBSCRIBE_CREATION_CHAIN = gql`
  mutation subscribeCreationChain {
    subscribeCreationChain
  }
`
