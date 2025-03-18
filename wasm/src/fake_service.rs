use std::str::FromStr;

use async_graphql::{Error, Object};
use linera_base::{
    data_types::Amount,
    identifiers::{ModuleId, ChainId, Owner, UserApplicationId},
};
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
        _chain_id: ChainId,
        owner: Option<Owner>,
        recipient: Recipient,
        amount: Amount,
    ) -> Result<Operation, Error> {
        Ok(Operation::System(SystemOperation::Transfer {
            owner,
            recipient,
            amount,
        }))
    }

    async fn create_application(
        &self,
        _chain_id: ChainId,
        module_id: ModuleId,
        parameters: String,
        instantiation_argument: String,
        required_application_ids: Vec<String>,
    ) -> Result<Operation, Error> {
        let create_parameters: Vec<u8> = Vec::from(parameters);
        let create_instantiation_argument: Vec<u8> = Vec::from(instantiation_argument);
        let create_required_application_ids: Vec<UserApplicationId> = required_application_ids
            .iter()
            .map(|s| UserApplicationId::from_str(s.as_str()))
            .filter_map(Result::ok)
            .collect();
        Ok(Operation::System(SystemOperation::CreateApplication {
            module_id,
            parameters: create_parameters,
            instantiation_argument: create_instantiation_argument,
            required_application_ids: create_required_application_ids,
        }))
    }
}
