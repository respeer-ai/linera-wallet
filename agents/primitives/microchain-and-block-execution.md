# Microchain And Block Execution

Type: Primitive
Audience: Coding assistants
Authority: High

## Semantics

- `src/worker/block/runner.ts` is the canonical execution-flow summary for operation replay and sync retry behavior
- The block runner handles:
  - inflight operations with known certificate hashes
  - errored operations eligible for retry
  - claimed microchains awaiting open-chain or bundle processing
  - generic incoming bundle processing across microchains
- Successful block handling updates balances first, then fetches block data, then reconciles activities and operation state
- Non-meme-chain flows may require retry until operation execution and open-chain side effects are visible
- Incoming bundle retries are short-looped; broader recovery is handled by the 30-second ticker

## Flow

1. Pick pending work from operation or microchain state
2. Propose or fetch block material through helpers and RPC bridge
3. Update balance caches
4. Fetch confirmed block data
5. Reconcile activities and operation/open-chain state
6. Retry short-term when block side effects are not yet observable

## Rules

- Do not patch only displayed operation status without checking runner and helper semantics
- Do not assume a submitted operation is fully processed once a certificate hash exists
- When changing retry logic, account for ticker-driven recovery and short-loop retries together
- When debugging stuck sync, inspect operation state, certificate hash, microchain state, and incoming bundle handling together

## Implications

- Many "missing activity" or "pending forever" bugs originate in delayed reconciliation, not request submission
- Balance and activity correctness depends on the worker path staying idempotent
