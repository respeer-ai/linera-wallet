import { MicrochainsImportState } from './const'

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

export interface Setting {
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

  MicrochainsImportState: MicrochainsImportState
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
