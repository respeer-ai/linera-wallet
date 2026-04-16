# Identity And Wallet Ownership

Type: Primitive
Audience: Coding assistants
Authority: High

## Semantics

- Wallet identity spans multiple layers:
  - dapp origin
  - authorized public key set for that origin
  - wallet owner/account records in local DB
  - selected microchain context in UI and worker flows
- `src-bex/engine/engine.ts` will auto-fill GraphQL mutation or subscription `publicKey` from `dbBridge.RpcAuth.originPublicKeys(req.origin)` when the request omits it
- Origin-bound RPC auth is a durable permission surface; changing account exposure requires auditing `src/bridge/db/rpc_auth.ts` and the related RPC handlers
- Owner/account identity is not equivalent to microchain identity; many flows require both owner/public key context and target microchain

## Rules

- Do not treat a selected UI account as sufficient proof of dapp authorization
- Do not add RPC methods that bypass origin-bound key lookup or confirmation without explicit reason
- When fixing account mismatch bugs, trace origin, public key, owner, and microchain separately
- When changing account exposure, inspect both extension middleware and DB bridge semantics

## Implications

- A dapp seeing the wrong account can be caused by stale RPC auth rather than wrong UI state
- A mutation hitting the wrong chain can be caused by microchain routing rather than owner lookup
