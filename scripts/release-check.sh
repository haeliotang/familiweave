#!/bin/sh
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "1/7 dependency audit"
pnpm audit --audit-level high
echo "2/7 unit tests"
pnpm test
echo "3/7 SIL harness"
pnpm sil:test
echo "4/7 production build"
pnpm build
echo "5/7 bundle guard"
pnpm check:symbolic-path
echo "6/7 browser E2E (requires pnpm e2e:install once)"
pnpm e2e
echo "7/7 Rust host tests"
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml

echo "Release checks passed. Next: inspect the diff, tag vX.Y.Z, push the tag, then verify the Desktop builds release assets."
