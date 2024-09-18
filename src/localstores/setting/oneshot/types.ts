export enum Menu {
  NETWORKS = 'Networks',
}

export interface OneShotSetting {
  ShowHeaderMenu: boolean
  ExtensionMode: boolean
  ShowFooterMenu: boolean
  AlignPageCenter: boolean

  ShowSettingMenu: boolean
  SelectedSettingMenu: Menu
}

export interface MenuItem {
  icon: string
  label: Menu
  target: string
  disable: boolean
}
