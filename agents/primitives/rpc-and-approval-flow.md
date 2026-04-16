# RPC And Approval Flow

Type: Primitive
Audience: Coding assistants
Authority: High

## Semantics

- Dapp-facing requests enter through `src-bex/engine/engine.ts`
- The engine applies pre-interceptors before middleware and final RPC dispatch
- Current pre-interceptor use includes account-related interception
- Current middleware includes confirmation flow before certain operations
- Supported routed methods are declared in `src-bex/middleware/rpc.ts`
- GraphQL mutations can trigger popup execution updates through the event bridge
- `eth_sign`-style methods resolve with middleware-produced message data instead of generic RPC handler results
- `eth_estimateGas` is treated as silent

## Flow

1. Validate that the requested method is in the supported method list
2. Normalize params and backfill missing `publicKey` for eligible methods
3. Run pre-interceptors
4. Run middleware chain
5. Dispatch to the concrete RPC implementation
6. If needed, emit popup update events and resolve or reject based on popup response

## Rules

- Add new RPC methods in one place of record and keep middleware coverage explicit
- Do not introduce hidden side effects before method validation
- When debugging approval issues, inspect engine, middleware, popup eventing, and handler implementation together
- When adding a signing or mutation flow, define whether it is silent, confirmable, or popup-gated

## Implications

- A failure after popup approval may still come from downstream RPC implementation
- A method appearing wired in UI is not enough; it must be registered in `src-bex/middleware/rpc.ts`
