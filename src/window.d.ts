import { MetaMaskInpageProvider } from '@metamask/providers'

declare global {
  interface Window {
    linera: MetaMaskInpageProvider;
  }
}
