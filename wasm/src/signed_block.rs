use linera_base::{bcs_scalar, crypto::AccountSignature, data_types::Round};
use linera_chain::types::{Block, ValidatedBlockCertificate};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignedBlockBcs {
    block: Block,
    round: Round,
    signature: AccountSignature,
    validated_block_certificate: Option<ValidatedBlockCertificate>,
    // If block contains PublishDataBlob, it should have blobs, too
    blob_bytes: Vec<Vec<u8>>,
}

bcs_scalar!(
    SignedBlockBcs,
    "A signed block which will be submitted to blockchain with its signature."
);
