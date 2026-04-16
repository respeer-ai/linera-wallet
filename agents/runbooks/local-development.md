# Local Development

Type: Runbook
Audience: Coding assistants
Authority: Medium

## Commands

- Install deps: `yarn install`
- Web dev: `yarn dev`
- Extension dev: `yarn bex`
- Web build: `yarn build`
- Extension build: `yarn build:bex`
- Build wasm helper: `yarn build:wasm`
- Regenerate GraphQL types: `yarn graphql:generate`
- Lint and auto-fix: `yarn lint`

## Flow

1. Confirm whether the task targets web UI, browser extension, wasm helper, or GraphQL schema surface
2. Run the smallest build or lint command that covers the touched area
3. If GraphQL documents changed, regenerate codegen outputs
4. If wasm code changed, rebuild wasm artifacts before validating extension flows
5. Record any command blockers in `agents/tasks/board.yaml` when they block delivery

## Validation

- Prefer `yarn lint` for broad TypeScript/Vue sanity
- Prefer task-scoped build commands over full builds when possible
- Treat `src/__generated__/` as regen outputs after GraphQL changes
