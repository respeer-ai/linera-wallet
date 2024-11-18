use async_graphql::{Object, Error};
use linera_base::{data_types::Amount, identifiers::Owner};
use linera_execution::{system::Recipient, Operation, SystemOperation};

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
    async fn parse_operation(&self, operation: Operation) -> Operation {
        operation
    }

    async fn transfer(
        &self,
        owner: Option<Owner>,
        recipient: Recipient,
        amount: Amount,
    ) -> Result<Operation, Error> {
        Ok(Operation::System(SystemOperation::Transfer { owner, recipient, amount }))
    }
}
