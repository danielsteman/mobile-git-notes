#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

kitty --single-instance --session "$SCRIPT_DIR/dev.kitty-session"
