import { MicrochainsImportState } from './const'

export enum Menu {
  NETWORKS = 'Networks',
  GENESIS = 'Genesis',
  SWAP = 'Swap',
  WLINERA = 'WLinera',
  AMS = 'AMS',
  ABOUT_US = 'AboutUs',
  STORAGE = 'Storage',
  ACCOUNTS = 'Accounts',
  ADDRESSES_BOOK = 'AddressesBook',
  ENGINEERING = 'Engineering'
}

export enum HomeAction {
  SHOW_MAIN = 'ShowMain',
  SHOW_MICROCHAIN = 'ShowMicrochain',
  SHOW_TOKEN = 'ShowToken',
  SHOW_ACTIVITY = 'ShowActivity',
  SHOW_OPERATION = 'ShowOperation'
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
  HomeTab: string

  CreatingDefaultNetwork: boolean
  CreatingDefaultToken: boolean
  CreatingDefaultNamedApplication: boolean

  InPopupContext: boolean

  MicrochainsImportState: MicrochainsImportState

  NetworkInfo: unknown
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
