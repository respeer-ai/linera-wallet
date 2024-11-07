import { rpc } from '../../model'

export interface ChainOperation {
  operation_id: string
  microchain: string
  operation: rpc.Operation
}
