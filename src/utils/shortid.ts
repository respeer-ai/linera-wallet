export const shortId = (id: string, headTailNumber: number) => {
  if (!id?.length) return ''
  return id.slice(0, headTailNumber) + '...' + id.slice(-headTailNumber)
}
