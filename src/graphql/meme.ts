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
  query balanceOf($owner: Account!) {
    balanceOf(owner: $owner)
  }
`

export const TRANSFER = gql`
  mutation transfer($to: Account, $amount: Amount!) {
    transfer(to: $to, amount: $amount)
  }
`
