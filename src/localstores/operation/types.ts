import { rpc } from '../../model'

export interface ChainOperation {
  microchain: string
  operation: rpc.Operation
}
