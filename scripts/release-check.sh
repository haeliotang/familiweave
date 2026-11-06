#!/bin/sh
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "1/6 dependency audit"
pnpm audit --audit-level high
echo "2/6 unit tests"
pnpm test
echo "3/6 production build"
pnpm build
echo "4/6 bundle guard"
pnpm check:symbolic-path
echo "5/6 browser E2E (requires pnpm e2e:install once)"
pnpm e2e
echo "6/6 Rust host tests"
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml

echo "Release checks passed. Next: inspect the diff, tag vX.Y.Z, push the tag, then verify the Desktop builds release assets."
