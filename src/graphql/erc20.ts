import { gql } from '@apollo/client/core'

export const TOKEN_METADATA = gql`
  query tokenMetadata {
    name
    symbol
    totalSupply
    tokenMetadata
  }
`
