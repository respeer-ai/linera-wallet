import Web3 from 'web3'

export class _Web3 {
  static hexToBytes = (hex: string) => {
    return Web3.utils.hexToBytes(hex)
  }

  static bytesToHex = (bytes: Uint8Array) => {
    return Web3.utils.bytesToHex(bytes)
  }

  static bytesToHexTrim0x = (bytes: Uint8Array) => {
    const hex = Web3.utils.bytesToHex(bytes)
    return hex.startsWith('0x') ? hex.substring(2) : hex
  }
}
