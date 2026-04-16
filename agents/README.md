# agents/

- assistant-only operating layer
- `agents/tasks/board.yaml` is the only live task source
- read order:
  1. `agents/index.yaml`
  2. `agents/context/project-rules.md`
  3. `agents/context/doc-standard.md`
  4. `agents/tasks/board.yaml`
  5. nearest local `AGENTS.md`
  6. relevant files in `agents/primitives/`, `agents/context/`, `agents/runbooks/`
- hard rules:
  - do not keep competing assistant truth outside `agents/` or local `AGENTS.md`
  - promote durable conclusions into `agents/context/` or `agents/primitives/`
  - update `agents/tasks/board.yaml` when work meaningfully changes status
