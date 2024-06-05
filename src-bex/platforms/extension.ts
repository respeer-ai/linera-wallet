import browser from 'webextension-polyfill'

export default class ExtensionPlatform {
  //
  // Public
  //
  reload () {
    browser.runtime.reload()
  }

  async openTab (options: browser.Tabs.CreateCreatePropertiesType) {
    const newTab = await browser.tabs.create(options)
    return newTab
  }

  async openWindow (options: browser.Windows.CreateCreateDataType) {
    const newWindow = await browser.windows.create(options)
    return newWindow
  }

  async focusWindow (windowId: number) {
    await browser.windows.update(windowId, { focused: true })
  }

  async updateWindowPosition (windowId: number, left: number, top: number) {
    await browser.windows.update(windowId, { left, top })
  }

  async getLastFocusedWindow () {
    const windowObject = await browser.windows.getLastFocused()
    return windowObject
  }

  async closeCurrentWindow () {
    const windowDetails = await browser.windows.getCurrent()
    void browser.windows.remove(windowDetails.id as number)
  }

  getVersion () {
    const { version, version_name: versionName } =
      browser.runtime.getManifest()

    const versionParts = version.split('.')
    if (versionName) {
      if (versionParts.length < 4) {
        throw new Error(`Version missing build number: '${version}'`)
      }
      // On Chrome, a more descriptive representation of the version is stored in the
      // `version_name` field for display purposes. We use this field instead of the `version`
      // field on Chrome for non-main builds (i.e. Flask, Beta) because we want to show the
      // version in the SemVer-compliant format "v[major].[minor].[patch]-[build-type].[build-number]",
      // yet Chrome does not allow letters in the `version` field.
      return versionName
      // A fourth version part is sometimes present for "rollback" Chrome builds
    } else if (![3, 4].includes(versionParts.length)) {
      throw new Error(`Invalid version: ${version}`)
    } else if (versionParts[2].match(/[^\d]/u)) {
      // On Firefox, the build type and build version are in the third part of the version.
      const [major, minor, patchAndPrerelease] = versionParts
      const matches = patchAndPrerelease.match(/^(\d+)([A-Za-z]+)(\d)+$/u)
      if (matches === null) {
        throw new Error(`Version contains invalid prerelease: ${version}`)
      }
      const [, patch, buildType, buildVersion] = matches
      return `${major}.${minor}.${patch}-${buildType}.${buildVersion}`
    }

    // If there is no `version_name` and there are only 3 or 4 version parts, then this is not a
    // prerelease and the version requires no modification.
    return version
  }
}
