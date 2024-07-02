declare module '*.wasm' {
  const content: WebAssembly.Module
  export default content
}

declare module '*?url' {
  const src: string
  export default src
}
