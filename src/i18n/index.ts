import enUS from './en-US'

export default {
  'en-US': enUS
}

export interface LangOption {
  value: string
  label: string
}

export const langOptions = [
  {
    label: '中文简体',
    value: 'zh-CN'
  },
  {
    label: 'English',
    value: 'en-US'
  }
]
