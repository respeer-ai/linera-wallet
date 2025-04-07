use async_graphql::{Error, Object};
use linera_base::{
    crypto::CryptoHash,
    data_types::Amount,
    identifiers::{ChainId, ModuleId, AccountOwner, ApplicationId},
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
    async fn transfer(
        &self,
        _chain_id: ChainId,
        owner: AccountOwner,
        recipient: Recipient,
        amount: Amount,
    ) -> Result<Operation, Error> {
        Ok(Operation::system(SystemOperation::Transfer {
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
        required_application_ids: Vec<ApplicationId>,
    ) -> Result<Operation, Error> {
        let create_parameters: Vec<u8> = Vec::from(parameters);
        let create_instantiation_argument: Vec<u8> = Vec::from(instantiation_argument);
        Ok(Operation::system(SystemOperation::CreateApplication {
            module_id,
            parameters: create_parameters,
            instantiation_argument: create_instantiation_argument,
            required_application_ids,
        }))
    }

    async fn publish_data_blob(
        &self,
        _chain_id: ChainId,
        blob_hash: CryptoHash,
    ) -> Result<Operation, Error> {
        Ok(Operation::system(SystemOperation::PublishDataBlob {
            blob_hash,
        }))
    }
}
