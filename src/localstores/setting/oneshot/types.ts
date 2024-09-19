export enum Menu {
  NETWORKS = 'Networks',
  ABOUT_US = 'AboutUs'
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
  menu: Menu
  label: string
  disable: boolean
}
