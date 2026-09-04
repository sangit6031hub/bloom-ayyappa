#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  printf '%s\n' "Node.js and npm are required to build this site." >&2
  exit 1
fi

printf '%s\n' "Installing dependencies from package-lock.json..."
npm ci

printf '%s\n' "Building the site..."
npm run build
