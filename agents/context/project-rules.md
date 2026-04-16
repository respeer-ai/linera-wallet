# Project Rules

Type: Rules
Audience: Coding assistants
Authority: High

## Facts

- The only live task board is `agents/tasks/board.yaml`
- Assistant-facing durable knowledge belongs under `agents/` or in directory-local `AGENTS.md`
- Human-facing background remains in `README.md` or future human docs, not in `agents/`
- Chain state and node-service responses are backend truth
- Browser storage is cached wallet state, not protocol truth
- UI stores are presentation and interaction state, not authoritative chain state

## Rules

- Read code paths before patching behavior
- Before editing a directory, check for a local `AGENTS.md` in that directory or its parents
- Do not create feature-specific task boards
- Do not keep competing "latest" assistant docs
- When debugging displayed state, identify whether the source is GraphQL, local DB, worker sync, or UI store before patching
- Do not patch UI rendering to mask incorrect backend or sync semantics without proving the ownership of the bug
- Treat `src-bex/` as extension runtime authority for dapp-facing RPC behavior
- Treat `src/bridge/db/` as persistence surface definitions
- Treat `src/localstores/` as UI/session state
- Treat `src/worker/block/` and helpers as block execution and sync orchestration
- Update `agents/tasks/board.yaml` when work meaningfully changes status
- Prefer targeted validation over broad no-op test commands
- Record durable conclusions from debugging into `agents/context/` or `agents/primitives/`

## Checklist

1. Read the relevant primitive files
2. Identify the actual source of truth for the failing behavior
3. Patch the owning layer
4. Validate with the smallest useful command set
5. Update `agents/tasks/board.yaml` if status changed
