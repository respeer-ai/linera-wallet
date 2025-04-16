import { keccak } from 'hash-wasm'
import { Web3 } from 'web3'

export class Keccac256 {
  static hashWithTypename = async (typeName: string, payloadHex: string) => {
    const payloadBytes = Web3.utils.hexToBytes(payloadHex)
    const typeNameBytes = new TextEncoder().encode(`${typeName}::`)
    const bytes = new Uint8Array([...typeNameBytes, ...payloadBytes])
    return await Keccac256.hash(bytes)
  }

  static hash = async (bytes: Uint8Array) => {
    return await keccak(bytes, 256)
  }
}
