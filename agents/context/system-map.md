# System Map

Type: Context
Audience: Coding assistants
Authority: High

## Purpose

Canonical high-level module map and runtime shape for this repository.

## Facts

- Runtime surfaces:
  - `src/`: Quasar Vue application
  - `src-bex/`: browser extension runtime, RPC bridge, popup coordination, subscriptions
  - `src/worker/block/`: block execution and retry worker
  - `src/bridge/db/`: local persistence bridge surface
  - `src/bridge/rpc/`: wallet-to-node-service RPC surface
  - `src/graphql/`: GraphQL documents for node-service and faucet integration
  - `wasm/`: Rust block/signature helpers compiled for the extension
- UI pages are under `src/pages/`
- Reusable UI modules are under `src/components/`
- Pinia/local interaction state lives in `src/localstores/`
- Persistent wallet entities are modeled under `src/model/` and bridged through `src/bridge/db/`
- Helper modules under `src/helper/` coordinate balance, activity, block, and microchain updates

## Runtime Topology

- A dapp or popup request enters through `src-bex/`
- Middleware may enforce origin/account binding and confirmation
- RPC handlers route GraphQL queries, mutations, subscriptions, and wallet methods
- Successful mutations may trigger popup execution updates
- Block worker and helper flows reconcile operations, blocks, balances, and incoming bundles
- Local DB caches wallet state for accounts, microchains, balances, activities, networks, and RPC auth
- Frontend pages read local stores and bridge-backed state rather than talking to raw backend code directly

## Implications

- Bugs often cross `src-bex/`, `src/bridge/`, `src/helper/`, and `src/worker/block/`
- A visible balance or activity bug may come from stale sync rather than rendering
- Adding a new wallet capability usually touches RPC surface, persistence, and UI together
