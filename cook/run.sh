#!/bin/bash
# Build the beta and take stills: cook/run.sh <label> [pages...]
set -e
cd "$(dirname "$0")/../site"
NODE_OPTIONS=--max-old-space-size=1536 BASE_PATH=/simaxmeble-beta pnpm build > /tmp/opencode/simax-build.out 2>&1 || { tail -30 /tmp/opencode/simax-build.out; exit 1; }
cd .. && node cook/stills.mjs "$@"
