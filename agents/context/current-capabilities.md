# Current Capabilities

Type: Context
Audience: Coding assistants
Authority: Medium

## Facts

- The product is a Linera browser wallet named CheCko
- The repository supports both normal Quasar app flows and browser-extension (`bex`) flows
- Implemented scripts include:
  - `yarn dev`
  - `yarn build`
  - `yarn bex`
  - `yarn build:bex`
  - `yarn build:wasm`
  - `yarn graphql:generate`
- Implemented dapp-facing methods include provider-state, account request, GraphQL query/mutation/subscription, balance read, ping, and gas estimation plumbing
- The wallet persists networks, owners, accounts, tokens, balances, activities, microchains, RPC auth, and passwords in local storage via DB bridges
- The block runner retries inflight and errored operations, claimed microchains, and incoming bundles on a 30-second ticker

## Known Gaps

- `package.json` still defines `test` as a placeholder and does not provide a real automated test suite entrypoint
- `README.md` still lists unfinished items:
  - load chain and direct RPC querying
  - multiple popup handling and accurate popup closing
  - dynamic loading of application bytecode for operation serialization

## Use

- Read this file before assuming a missing feature is unimplemented
- Move stable new findings here when they reflect repository-wide capability changes
