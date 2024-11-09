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

export const MINT = gql`
  mutation mint($to: ChainAccountOwner, $amount: Amount!) {
    mint(to: $to, amount: $amount)
  }
`

export const TRANSFER_ERC20 = gql`
  mutation transfer($to: ChainAccountOwner, $amount: Amount!) {
    transfer(to: $to, amount: $amount)
  }
`
