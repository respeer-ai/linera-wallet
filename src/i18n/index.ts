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
    label: '汉语',
    value: 'zh-CN'
  }, {
    label: 'EN',
    value: 'en-US'
  }
]
