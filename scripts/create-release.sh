#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RELEASE_REPO="${RELEASE_REPO:-respeer-ai/linera-wallet}"
PUBLISH_RELEASE="${PUBLISH_RELEASE:-1}"
SKIP_BUILD="${SKIP_BUILD:-0}"
ALLOW_DIRTY="${ALLOW_DIRTY:-0}"
RELEASE_NOTES_FILE="${RELEASE_NOTES_FILE:-}"
TARGET_COMMITISH="${TARGET_COMMITISH:-master}"
CREATE_TAG="${CREATE_TAG:-1}"
ALLOW_EXISTING_TAG="${ALLOW_EXISTING_TAG:-0}"
PREVIOUS_PUBLIC_TAG="${PREVIOUS_PUBLIC_TAG:-}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd git
require_cmd curl
require_cmd jq
require_cmd node
require_cmd yarn

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN is required" >&2
  exit 1
fi

VERSION="${RELEASE_VERSION:-$(node -p "require('./package.json').version")}"
TAG="${RELEASE_TAG:-v${VERSION}}"
RELEASE_TITLE="Release ${TAG}"
DEFAULT_ZIP="dist/bex/Packaged.linera-checko-wallet.zip"
VERSIONED_ZIP="dist/bex/Packaged.linera-checko-wallet.${TAG}.zip"
API_BASE="https://api.github.com/repos/${RELEASE_REPO}"

if [[ "$ALLOW_DIRTY" != "1" ]] && [[ -n "$(git status --short)" ]]; then
  echo "Worktree is not clean. Commit or stash changes, or set ALLOW_DIRTY=1." >&2
  exit 1
fi

tag_exists_local=0
tag_exists_remote=0

if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null 2>&1; then
  tag_exists_local=1
fi

if git ls-remote --exit-code --tags origin "refs/tags/${TAG}" >/dev/null 2>&1; then
  tag_exists_remote=1
fi

if [[ "$ALLOW_EXISTING_TAG" != "1" ]] && [[ "$CREATE_TAG" = "1" ]]; then
  if [[ "$tag_exists_local" = "1" ]]; then
    echo "Tag ${TAG} already exists locally" >&2
    exit 1
  fi

  if [[ "$tag_exists_remote" = "1" ]]; then
    echo "Tag ${TAG} already exists on origin" >&2
    exit 1
  fi
fi

release_lookup="$(curl -fsSL \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  "${API_BASE}/releases/tags/${TAG}" || true)"

release_id="$(printf '%s' "$release_lookup" | jq -r '.id // empty')"

if [[ "$SKIP_BUILD" != "1" ]]; then
  yarn build:bex
fi

if [[ ! -f "$DEFAULT_ZIP" ]]; then
  echo "Built artifact not found: ${DEFAULT_ZIP}" >&2
  exit 1
fi

cp "$DEFAULT_ZIP" "$VERSIONED_ZIP"

previous_tag="$PREVIOUS_PUBLIC_TAG"
if [[ -z "$previous_tag" ]]; then
  previous_tag="$(git tag --list 'v*' --sort=-version:refname | grep -Fxv "$TAG" | head -n 1 || true)"
fi

if [[ -n "$RELEASE_NOTES_FILE" ]]; then
  if [[ ! -f "$RELEASE_NOTES_FILE" ]]; then
    echo "Release notes file not found: ${RELEASE_NOTES_FILE}" >&2
    exit 1
  fi
  release_body="$(cat "$RELEASE_NOTES_FILE")"
else
  release_body=$'## Change Notes\n\n- TBD\n'
  if [[ -n "$previous_tag" ]]; then
    release_body+=$'\n**Full Changelog**: https://github.com/'"${RELEASE_REPO}"'/compare/'"${previous_tag}"'...'"${TAG}"
  fi
fi

if [[ "$CREATE_TAG" = "1" ]]; then
  if [[ "$tag_exists_local" != "1" ]]; then
    git tag "$TAG"
  fi

  if [[ "$tag_exists_remote" != "1" ]]; then
    git push origin "$TAG"
  fi
fi

release_payload="$(jq -n \
  --arg tag_name "$TAG" \
  --arg target_commitish "$TARGET_COMMITISH" \
  --arg name "$RELEASE_TITLE" \
  --arg body "$release_body" \
  --argjson draft "$( [[ "$PUBLISH_RELEASE" = "1" ]] && echo false || echo true )" \
  '{tag_name: $tag_name, target_commitish: $target_commitish, name: $name, body: $body, draft: $draft, prerelease: false}')"

if [[ -n "$release_id" ]]; then
  release_response="$(curl -fsSL \
    -X PATCH \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    "${API_BASE}/releases/${release_id}" \
    -d "$release_payload")"
else
  release_response="$(curl -fsSL \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    "${API_BASE}/releases" \
    -d "$release_payload")"
fi

release_id="$(printf '%s' "$release_response" | jq -r '.id')"

if [[ -z "$release_id" || "$release_id" == "null" ]]; then
  echo "Failed to create release" >&2
  exit 1
fi

asset_name="$(basename "$VERSIONED_ZIP")"
existing_asset_id="$(printf '%s' "$release_response" | jq -r --arg name "$asset_name" '.assets[]? | select(.name == $name) | .id' | head -n 1 || true)"

if [[ -n "$existing_asset_id" ]]; then
  curl -fsSL \
    -X DELETE \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    "${API_BASE}/releases/assets/${existing_asset_id}" >/dev/null
fi

upload_url="https://uploads.github.com/repos/${RELEASE_REPO}/releases/${release_id}/assets?name=${asset_name}"

curl -fsSL \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/zip" \
  --data-binary @"$VERSIONED_ZIP" \
  "$upload_url" >/dev/null

echo "Published release ${TAG}"
echo "Uploaded asset ${VERSIONED_ZIP}"
