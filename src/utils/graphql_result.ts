export const keys = (data: unknown) => {
  return (data as Record<string, unknown>).keys
}

export const entryValue = (data: unknown) => {
  return ((data as Record<string, unknown>).entry as Record<string, unknown>).value
}

export const keyValue = (data: unknown, key: string) => {
  return (data as Record<string, unknown>)[key]
}

export const entryValueKeyValue = (data: unknown, key: string) => {
  return (entryValue(data) as Record<string, unknown>)?.[key]
}

export const data = (result: unknown, key: string) => {
  return ((result as Record<string, unknown>).data as Record<string, unknown>)[key]
}
