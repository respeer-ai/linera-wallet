import { gql } from '@apollo/client/core'

export const SUBSCRIBE_CREATOR_CHAIN = gql`
  mutation subscribeCreatorChain {
    subscribeCreatorChain
  }
`

export const LEGACY_REQUEST_SUBSCRIBE = gql`
  mutation requestSubscribe {
    requestSubscribe
  }
`

export const SCHEMA = gql`
  query {
    __schema {
      __typename
    }
  }
`

export const SUBSCRIBED_CREATOR_CHAIN = gql`
  query subscribedCreatorChain {
    subscribedCreatorChain
  }
`
