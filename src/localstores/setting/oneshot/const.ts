import { Menu, MenuItem } from './types'

export const SettingMenus = [
  {
    icon: 'bi-plugin',
    label: 'Networks',
    menu: Menu.NETWORKS,
    disable: false
  }, {
    icon: 'bi-view-list',
    label: 'Accounts',
    menu: Menu.ACCOUNTS,
    disable: false
  }, {
    icon: 'bi-card-list',
    label: 'Addresses book',
    menu: Menu.ADDRESSES_BOOK,
    disable: false,
    separator: true
  }, {
    icon: 'bi-info-circle',
    label: 'About us',
    menu: Menu.ABOUT_US,
    disable: false,
    separator: true
  }, {
    icon: 'bi-exclamation-triangle',
    iconColor: 'red-6',
    label: 'Storage',
    menu: Menu.STORAGE
  }
] as Array<MenuItem>
