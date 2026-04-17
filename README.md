![CheCko](src/assets/CheCko.png)

# CheCko Wallet

[![Test](https://github.com/respeer-ai/linera-wallet/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/respeer-ai/linera-wallet/actions/workflows/test.yml)

CheCko is a browser wallet for the Linera ecosystem built by ResPeer. This repository contains:

- a Quasar + Vue 3 frontend
- a Manifest V3 browser extension runtime
- a Rust/WASM helper used for block and operation serialization
- GraphQL integrations for Linera service and faucet endpoints

The project is designed around a split architecture: the wallet keeps signing and wallet UX in the browser, while chain data and execution-related queries are coordinated through Linera service endpoints.

## What It Does

Today the repository provides:

- browser extension wallet flows
- injected provider access through `window.linera`
- account request and provider state methods
- GraphQL query, mutation, and subscription plumbing for Linera services
- local persistence for accounts, networks, balances, activities, tokens, and RPC authorization state
- Rust/WASM helpers for operation and block-related encoding work

Current known gaps:

- direct `load chain` support is not finished
- multiple popup handling is still incomplete
- dynamic loading of application bytecode for application-operation serialization is not finished
- `yarn test` is currently a placeholder, not a real test suite

## Repository Layout

- [src](/home/kk/linera-project/linera-wallet/src) Vue UI, pages, components, local stores, RPC bridges, and worker code
- [src-bex](/home/kk/linera-project/linera-wallet/src-bex) browser extension runtime, injected provider bridge, background worker, and extension middleware
- [wasm](/home/kk/linera-project/linera-wallet/wasm) Rust crate compiled to WebAssembly for wallet helpers
- [src/graphql](/home/kk/linera-project/linera-wallet/src/graphql) GraphQL documents
- [src/__generated__](/home/kk/linera-project/linera-wallet/src/__generated__) generated GraphQL client code
- [scripts/create-release.sh](/home/kk/linera-project/linera-wallet/scripts/create-release.sh) browser-extension release packaging and GitHub release upload

## Requirements

- Node.js 20+ recommended
- Yarn 1.x
- Rust toolchain
- `wasm-pack`
- `protoc` for builds that require protobuf tooling

Useful setup commands:

```bash
yarn install
rustup target add wasm32-unknown-unknown
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

## Development

Install dependencies:

```bash
yarn install
```

Run the web app:

```bash
yarn dev
```

Run the browser extension in development mode:

```bash
yarn bex
```

Build the WASM helper:

```bash
yarn build:wasm
```

Generate GraphQL types:

```bash
yarn graphql:generate
```

Lint the repository:

```bash
yarn lint
```

## Build

Build the web app:

```bash
yarn build
```

Build the browser extension:

```bash
yarn build:bex
```

The extension packaging flow produces artifacts under `dist/bex/`. The release script expects:

- `dist/bex/Packaged.linera-checko-wallet.zip`

## Loading the Extension

After `yarn build:bex`, load the generated browser-extension output in a Chromium-based browser using developer mode.

The extension currently uses:

- Manifest V3
- a background service worker
- content scripts on `http`, `https`, and `file` pages
- storage, tabs, and active-tab permissions

See [src-bex/manifest.json](/home/kk/linera-project/linera-wallet/src-bex/manifest.json) for the exact manifest.

## dApp Integration

The extension injects a provider on `window.linera`.

Example:

```js
const web3 = new Web3(window.linera)

web3.eth
  .requestAccounts()
  .then((accounts) => {
    console.log(accounts)
  })
  .catch((error) => {
    console.error(error)
  })
```

Implemented dApp-facing capabilities currently include provider-state, account request, GraphQL query/mutation/subscription routing, balance reads, ping, and gas-estimation plumbing.

## GraphQL Endpoints

The repository currently generates typed GraphQL clients against:

- a Linera service endpoint at `http://api.testnet-conway.rpc.respeer.ai/api/rpc`
- a faucet endpoint at `https://faucet.testnet-conway.linera.net`

See [graphql-codegen.ts](/home/kk/linera-project/linera-wallet/graphql-codegen.ts).

## Release

To build and publish a browser-extension release, use:

```bash
yarn release:bex
```

The release script:

- builds the extension unless `SKIP_BUILD=1`
- creates or updates a GitHub release
- uploads a versioned extension zip asset

Required environment variable:

```bash
GITHUB_TOKEN=...
```

Useful optional variables include `RELEASE_REPO`, `RELEASE_VERSION`, `RELEASE_TAG`, `TARGET_COMMITISH`, `SKIP_BUILD`, and `PUBLISH_RELEASE`.

## Notes

- The WASM crate lockfile lives at [wasm/Cargo.lock](/home/kk/linera-project/linera-wallet/wasm/Cargo.lock) and is expected by CI.
- `yarn test` does not run a real automated test suite yet.
- Some GraphQL and faucet settings are currently repo-configured for testnet-style environments rather than fully parameterized at runtime.

## License

This repository includes [LICENSE](/home/kk/linera-project/linera-wallet/LICENSE) and [NOTICE](/home/kk/linera-project/linera-wallet/NOTICE).
