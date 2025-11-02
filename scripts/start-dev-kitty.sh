#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

kitty --session "$SCRIPT_DIR/dev.kitty-session"
