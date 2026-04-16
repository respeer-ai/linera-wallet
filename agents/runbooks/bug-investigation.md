# Bug Investigation

Type: Runbook
Audience: Coding assistants
Authority: High

## Flow

1. Classify the bug as one of:
   - UI rendering
   - local persistence
   - extension RPC / popup
   - block execution / sync
   - backend contract / GraphQL integration
2. Read the matching primitive files from `agents/index.yaml`
3. Identify the source of truth that owns the incorrect behavior
4. Trace the end-to-end path into the owning code
5. Patch the owning layer
6. Validate with the smallest useful command set
7. Promote durable conclusions into `agents/context/` or `agents/primitives/`
8. Update `agents/tasks/board.yaml` if the task status changed

## Checklist

- Capture the failing page, method, microchain, or origin
- Distinguish stale cached state from incorrect remote data
- Distinguish approval failure from downstream execution failure
- Check whether worker retries can explain delayed state
- Record any missing validation coverage explicitly
