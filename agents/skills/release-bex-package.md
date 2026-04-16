# Release BEX Package

Type: Runbook
Audience: Coding assistants
Authority: Medium

## Purpose

- Create a GitHub release for the browser extension package
- Keep naming, tagging, asset naming, and upload steps consistent

## Invariants

- Source of truth for the version is `package.json`
- Release tag format is `v<version>`
- Release title format is `Release v<version>`
- Uploaded asset name format is `Packaged.linera-checko-wallet.v<version>.zip`
- Local build output is `dist/bex/Packaged.linera-checko-wallet.zip`
- Renamed upload artifact path is `dist/bex/Packaged.linera-checko-wallet.v<version>.zip`
- Target repository is `respeer-ai/linera-wallet`

## Required Checks

1. Confirm `package.json.version` matches the intended release version
2. Confirm the worktree is clean unless the caller explicitly allows otherwise
3. Run `yarn build:bex` and wait for true process exit
4. Rename the packaged zip to the release asset naming format
5. Ensure the git tag does not already exist locally or remotely before creation
6. Create and push tag `v<version>`
7. Create the GitHub release and upload the renamed zip as the asset

## Command

- Preferred command:
  `GITHUB_TOKEN=... yarn release:bex`

## Inputs

- `GITHUB_TOKEN`: required, must be allowed to create releases and upload assets
- `RELEASE_REPO`: optional, defaults to `respeer-ai/linera-wallet`
- `RELEASE_NOTES_FILE`: optional markdown file for the release body
- `SKIP_BUILD=1`: optional, reuse an already-built `dist/bex/Packaged.linera-checko-wallet.zip`
- `ALLOW_DIRTY=1`: optional, bypass clean-worktree check
- `PUBLISH_RELEASE=0`: optional, create the release as draft

## Notes Policy

- If `RELEASE_NOTES_FILE` is provided, use its contents as the release body
- Otherwise use a minimal default body with:
  - `## Change Notes`
  - placeholder line
  - compare link in the form `https://github.com/<repo>/compare/<previous_tag>...<current_tag>` when a previous tag exists

## Release Notes Requirements

- Default to an engineer-facing tone
- Summarize real shipped changes from the actual commit range, not from guesswork
- Prefer concrete implementation areas such as RPC, GraphQL, popup flow, routing, runtime guards, versioning, and release automation
- Keep the top section title as `## Change Notes`
- Add a `## You must know` section when operators or users need migration or version-context information
- If the repository has no public tag for an internal version jump, say that explicitly and anchor the compare link to the latest public tag
- Include the release asset filename in `## You must know`
- End with a full changelog link in the form:
  `**Full Changelog**: https://github.com/<repo>/compare/<public_previous_tag>...<current_tag>`

## Confirmed v0.0.22 Pattern

- Use engineer-facing release notes
- State that `v0.0.20` is not a public git tag when relevant
- Use `v0.0.18...v0.0.22` as the changelog compare range for this release
- Mention the asset name `Packaged.linera-checko-wallet.v0.0.22.zip`

## Do Not

- Do not hardcode a version that disagrees with `package.json`
- Do not upload `Packaged.linera-checko-wallet.zip` without the version suffix
- Do not stop validation at `Build succeeded` or `Output folder`; wait for command exit
- Do not create a duplicate release for an existing tag
