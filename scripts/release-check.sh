#!/bin/sh
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "1/5 unit tests"
pnpm test
echo "2/5 production build"
pnpm build
echo "3/5 bundle guard"
pnpm check:symbolic-path
echo "4/5 browser E2E (requires pnpm e2e:install once)"
pnpm e2e
echo "5/5 Rust host tests"
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml

echo "Release checks passed. Next: inspect the diff, tag vX.Y.Z, push the tag, then verify the Desktop builds release assets."
