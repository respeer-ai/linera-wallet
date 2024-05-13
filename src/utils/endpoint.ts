import { useSettingStore } from 'src/localstores/setting'
import * as constant from 'src/const'

export const faucetWsSchema = (() => {
  const _setting = useSettingStore()
  return _setting.setting?.faucetWSSchema || constant.WSSchema.WS
})()

export const faucetSchema = (() => {
  const _setting = useSettingStore()
  return _setting.setting?.faucetSchema || constant.HTTPSchema.HTTP
})()

export const faucetHost = (() => {
  const _setting = useSettingStore()
  return _setting.setting?.faucetHost || '172.16.31.73' // 'faucet.devnet.linera.net'
})()

export const faucetPort = (() => {
  const _setting = useSettingStore()
  return _setting.setting?.faucetPort || 8080
})()

export const faucetUrl = constant.toUrl(faucetSchema, faucetHost, faucetPort)

export const rpcWsSchema = (() => {
  const _setting = useSettingStore()
  return _setting.setting?.rpcWSSchema || constant.WSSchema.WS
})()

export const rpcSchema = (() => {
  const _setting = useSettingStore()
  return _setting.setting?.rpcSchema || constant.HTTPSchema.HTTP
})()

export const rpcHost = (() => {
  const _setting = useSettingStore()
  return _setting.setting?.rpcHost || '172.16.31.73' // 'faucet.devnet.linera.net'
})()

export const rpcPort = (() => {
  const _setting = useSettingStore()
  return _setting.setting?.rpcPort || 30080
})()
