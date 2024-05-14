export const shortId = (id: string, headTailNumber: number) => {
  return id.substring(0, headTailNumber) + '...' + id.substring(-headTailNumber, headTailNumber)
}
