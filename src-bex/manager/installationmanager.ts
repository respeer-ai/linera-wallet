import browser from 'webextension-polyfill'

export default class InstallationManager {
  async openExtensionInBrowser () {
    const url = browser.runtime.getURL('www/index.html')
    await browser.tabs.create({ url })
  }

  initializeOnInstalledListener () {
    browser.runtime.onInstalled.addListener(() => void this.openExtensionInBrowser())
  }
}
