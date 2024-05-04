export const toHex = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
export const toBytes = (hex: string) => {
  if (hex.length % 2 !== 0) {
    throw Error('Must have an even number of hex digits to convert to bytes')
  }
  const numBytes = hex.length / 2
  const bytes = new Uint8Array(numBytes)
  for (let i = 0; i < numBytes; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, (i + 1) * 2), 16)
  }
  return bytes
}
