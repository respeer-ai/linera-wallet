use abi::meme::MemeOperation;
use async_graphql::{Error, Object};
use linera_base::{
    data_types::Amount,
    identifiers::Account
};

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn parse_query(&self) -> u64 {
        0
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    // TODO: do we need to return human readable operation, too ?
    async fn transfer(
        &self,
        to: Account,
        amount: Amount,
    ) -> Result<Vec<u8>, Error> {
        Ok(bcs::to_bytes(&MemeOperation::Transfer{
            to,
            amount
        })?)
    }
}
