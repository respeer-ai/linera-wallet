export enum Menu {
  NETWORKS = 'Networks',
  ABOUT_US = 'AboutUs',
  STORAGE = 'Storage',
  ACCOUNTS = 'Accounts',
  ADDRESSES_BOOK = 'AddressesBook',
  ENGINEERING = 'Engineering'
}

export enum HomeAction {
  SHOW_MAIN = 'ShowMain',
  SHOW_MICROCHAIN = 'ShowMicrochain'
}

export interface OneShotSetting {
  ShowHeaderMenu: boolean
  ExtensionMode: boolean
  ShowFooterMenu: boolean
  AlignPageCenter: boolean

  ShowSettingMenu: boolean
  SelectedSettingMenu: Menu

  HomeAction: HomeAction
  HomeActionParams: unknown

  CreatingDefaultNetwork: boolean
  CreatingDefaultToken: boolean

  InPopupContext: boolean
}

export interface MenuItem {
  icon: string
  iconColor?: string
  menu: Menu
  label: string
  disable: boolean
  separator?: boolean
  hide?: boolean
}
