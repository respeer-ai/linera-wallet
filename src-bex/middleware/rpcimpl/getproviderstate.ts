export const getProviderStateHandler = async () => {
  return Promise.resolve({
    res: {
      isUnlocked: true,
      accounts: [],
      chainId: '0x10',
      networkVersion: '12734'
    }
  })
}
