# Assistant Doc Standard

Type: Standard
Audience: Coding assistants
Authority: High

## Facts

- Assistant docs optimize for assistant execution speed, retrieval accuracy, and update consistency
- `yaml` is preferred for indexes, navigation, task boards, and stable enumerations
- `md` is preferred for semantics, architecture slices, workflows, and rules with exceptions
- Task status lives only in `agents/tasks/board.yaml`
- Each durable fact should have one canonical file

## Rules

- Prefer short bullets over paragraphs
- Prefer explicit assertions over explanation-heavy prose
- Put invariants before examples
- Put prohibitions in bullets starting with `Do not`
- Use exact repo paths inline when naming files or directories
- Avoid duplicate facts across assistant docs
- If a fact is reused, point to the canonical file instead of re-explaining it
- Do not keep live status in prose docs
- Update `agents/index.yaml` if navigation changes

## Checklist

1. Use this front matter in assistant-facing Markdown:

   ```md
   # <doc title>

   Type: <Rules|Context|Primitive|Runbook|Standard>
   Audience: Coding assistants
   Authority: <High|Medium|Low>
   ```

2. Use only the sections that add information
3. Update the canonical file first
4. Remove stale assistant references
