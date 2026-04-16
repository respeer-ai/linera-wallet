# Data Sources And State

Type: Primitive
Audience: Coding assistants
Authority: High

## Semantics

- Truth hierarchy:
  - GraphQL/node-service responses are remote truth for chain state and execution results
  - Local DB under `src/bridge/db/` is cached wallet truth for persisted client state
  - Pinia/local stores under `src/localstores/` are UI/session coordination state
  - Components are presentation only
- `src/graphql/service.ts` defines a large part of the wallet's backend contract for balances, chains, blocks, block material, notifications, and signed block submission
- `src/bridge/db/index.ts` enumerates the persisted domains assistants must consider when tracking state ownership
- Generated GraphQL files under `src/__generated__/` are derivative artifacts, not primary semantics

## Rules

- When UI data is wrong, first identify which layer owns the bad value
- Do not patch generated GraphQL artifacts directly
- Do not store long-lived protocol or account truth only inside `src/localstores/`
- If a value must survive reload, route it through the persistent bridge layer rather than transient store state alone
- When adding a new backend field, update query documents, generated code, owning bridge/helper logic, and consuming UI

## Implications

- A stale screen can come from missed sync into local DB even when backend data is correct
- A local DB fix without updating helper refresh paths may not repair the user-visible issue
