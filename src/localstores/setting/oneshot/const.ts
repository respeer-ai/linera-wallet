import { Menu, MenuItem } from './types'

export const SettingMenus = [
  {
    icon: 'bi-plugin',
    label: 'Networks',
    menu: Menu.NETWORKS,
    disable: false
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
