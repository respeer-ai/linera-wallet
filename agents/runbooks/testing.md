# Testing

Type: Runbook
Audience: Coding assistants
Authority: Medium

## Facts

- `package.json` does not define a real automated test command yet
- Current practical validation relies on linting, build commands, codegen regeneration, and targeted runtime checks

## Rules

- Do not report "tests passed" by running the placeholder `yarn test`
- State explicitly when validation is limited to lint, build, or code inspection
- Prefer the narrowest command that exercises the changed surface
- If no automated validation exists for the touched area, record that gap explicitly

## Validation

- UI or store changes: `yarn lint`
- Extension runtime changes: `yarn lint` and, if needed, `yarn build:bex`
- GraphQL document changes: `yarn graphql:generate`
- Wasm changes: `yarn build:wasm`
