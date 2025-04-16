import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { Keccac256 } from '../hasher'
import { Web3 } from 'web3'
import { _Web3 } from '../web3'

export class Ed25519 {
  static signWithKeccac256Hash = async (
    secretKeyHex: string,
    bytes: Uint8Array
  ) => {
    const keyPair = Ed25519SigningKey.from_bytes(
      new Memory(Web3.utils.hexToBytes(secretKeyHex))
    )

    const hashHex = await Keccac256.hash(bytes)
    const hashBytes = Web3.utils.hexToBytes(hashHex)
    const sigBytes = keyPair.sign(new Memory(hashBytes)).to_bytes().bytes

    return _Web3.bytesToHexTrim0x(sigBytes)
  }

  static publicHex = (secretKeyHex: string) => {
    return _Web3.bytesToHexTrim0x(Ed25519.publicBytes(secretKeyHex))
  }

  static publicBytes = (secretKeyHex: string) => {
    return Ed25519.secretKey(secretKeyHex).public().to_bytes().bytes
  }

  static secretKey = (secretKeyHex: string) => {
    return Ed25519SigningKey.from_bytes(
      new Memory(_Web3.hexToBytes(secretKeyHex))
    )
  }

  static newSecretKeyToHex = () => {
    return _Web3.bytesToHexTrim0x(Ed25519SigningKey.random().to_bytes().bytes)
  }
}
