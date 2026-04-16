# Release BEX Package

Type: Runbook
Audience: Coding assistants
Authority: Medium

## Purpose

- Create a GitHub release for the browser extension package
- Keep naming, tagging, asset naming, and upload steps consistent

## Invariants

- Source of truth for the version is `package.json`
- Default release tag format is `v<version>`
- Release title format is `Release v<version>`
- Uploaded asset name format is `Packaged.linera-checko-wallet.v<version>.zip`
- Local build output is `dist/bex/Packaged.linera-checko-wallet.zip`
- Renamed upload artifact path is `dist/bex/Packaged.linera-checko-wallet.v<version>.zip`
- Target repository is `respeer-ai/linera-wallet`

## Required Checks

1. Confirm the intended `version` and `tag`
2. Confirm the worktree is clean unless the caller explicitly allows otherwise
3. Run `yarn build:bex` and wait for true process exit
4. Rename the packaged zip to the release asset naming format
5. Create and push the release tag when the caller wants the command to manage tags
6. Create or update the GitHub release for the selected tag
7. Upload the renamed zip as the asset, replacing a same-name asset if needed

## Command

- Preferred command:
  `GITHUB_TOKEN=... yarn release:bex`

## Inputs

- `GITHUB_TOKEN`: required, must be allowed to create releases and upload assets
- `RELEASE_REPO`: optional, defaults to `respeer-ai/linera-wallet`
- `RELEASE_VERSION`: optional, defaults to `package.json.version`
- `RELEASE_TAG`: optional, defaults to `v<RELEASE_VERSION>`
- `PREVIOUS_PUBLIC_TAG`: optional, explicit compare base for the changelog link
- `TARGET_COMMITISH`: optional, defaults to `master`
- `RELEASE_NOTES_FILE`: optional markdown file for the release body
- `SKIP_BUILD=1`: optional, reuse an already-built `dist/bex/Packaged.linera-checko-wallet.zip`
- `ALLOW_DIRTY=1`: optional, bypass clean-worktree check
- `PUBLISH_RELEASE=0`: optional, create the release as draft
- `CREATE_TAG=0`: optional, do not create or push a tag
- `ALLOW_EXISTING_TAG=1`: optional, allow release creation or update for an existing tag

## Notes Policy

- If `RELEASE_NOTES_FILE` is provided, use its contents as the release body
- Otherwise use a minimal default body with:
  - `## Change Notes`
  - placeholder line
  - compare link in the form `https://github.com/<repo>/compare/<previous_tag>...<current_tag>` when a previous tag exists
- `PREVIOUS_PUBLIC_TAG` overrides auto-detection when the latest public release tag is not the nearest semantic tag in git history

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

## Generic Invocation Pattern

- Standard publish:
  `GITHUB_TOKEN=... yarn release:bex`
- Publish a specific version and tag:
  `GITHUB_TOKEN=... RELEASE_VERSION=0.0.24 RELEASE_TAG=v0.0.24 yarn release:bex`
- Reuse an existing tag:
  `GITHUB_TOKEN=... ALLOW_EXISTING_TAG=1 CREATE_TAG=0 RELEASE_TAG=v0.0.24 yarn release:bex`
- Force the public compare base:
  `GITHUB_TOKEN=... PREVIOUS_PUBLIC_TAG=v0.0.22 yarn release:bex`

## Do Not

- Do not hardcode a version that disagrees with `package.json`
- Do not hardcode a tag that disagrees with the requested release inputs
- Do not upload `Packaged.linera-checko-wallet.zip` without the version suffix
- Do not stop validation at `Build succeeded` or `Output folder`; wait for command exit
- Do not create a duplicate release for an existing tag when the workflow should update the existing release instead
