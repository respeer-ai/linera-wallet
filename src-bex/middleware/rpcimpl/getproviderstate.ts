export const getProviderStateHandler = async () => {
  return Promise.resolve({
    isUnlocked: true,
    accounts: [],
    chainId: '0x10',
    networkVersion: '12734'
  })
}
