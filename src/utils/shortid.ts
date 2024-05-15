export const shortId = (id: string, headTailNumber: number) => {
  return id.slice(0, headTailNumber) + '...' + id.slice(-headTailNumber)
}
