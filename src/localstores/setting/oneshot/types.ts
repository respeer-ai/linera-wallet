export interface OneShotSetting {
  ShowHeaderMenu: boolean
  ExtensionMode: boolean
  ShowFooterMenu: boolean
  AlignPageCenter: boolean
  ShowSettingMenu: boolean
}

export enum Menu {
  NETWORKS = 'Networks',
}

export interface MenuItem {
  icon: string
  label: Menu
  target: string
  disable: boolean
}
