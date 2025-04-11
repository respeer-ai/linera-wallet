import { gql } from '@apollo/client/core'

export const MEME = gql`
  query meme {
    meme {
      initialSupply
      totalSupply
      name
      ticker
      decimals
      metadata {
        logoStoreType
        logo
        description
        twitter
        telegram
        discord
        website
        github
        liveStream
      }
      virtualInitialLiquidity
      initialLiquidity
    }
  }
`

// TODO: Account cannot be deserialized currently
export const BALANCE_OF = gql`
  query balanceOf($owner: String!) {
    balanceOf(owner: $owner)
  }
`

export const TRANSFER_MEME = gql`
  mutation transfer($to: String!, $amount: Amount!) {
    transfer(to: $to, amount: $amount)
  }
`
