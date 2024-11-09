import { gql } from '@apollo/client/core'

export const TOKEN_METADATA = gql`
  query tokenMetadata {
    name
    symbol
    totalSupply
    tokenMetadata
  }
`

export const BALANCE_OF = gql`
  query balanceOf($owner: ChainAccountOwner!) {
    balanceOf(owner: $owner)
  }
`
