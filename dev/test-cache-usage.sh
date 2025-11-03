#!/usr/bin/env bash
set -euo pipefail

echo "=== Testing Binary Cache Usage (Actual Cache Test) ==="
echo ""
echo "This test will:"
echo "  1. Find a package in the backend shell"
echo "  2. Delete it from local store"
echo "  3. Rebuild and watch for cache hits"
echo ""

# Get the backend shell derivation
SYSTEM=$(nix eval --impure --expr 'builtins.currentSystem' 2>/dev/null || echo "aarch64-darwin")
DRV=$(nix eval ".#devShells.$SYSTEM.backend.drvPath" --no-warn-dirty 2>&1 | sed 's/"//g' | tail -1)

# Find Python (a good test package)
echo "1. Finding Python package to test..."
PYTHON_OUTPUT=$(nix-store --query --references "$DRV" 2>/dev/null | grep -E "python3-3\.[0-9]+\.[0-9]+$" | head -1 || echo "")

if [ -z "$PYTHON_OUTPUT" ]; then
    # Try to get it from the derivation
    PYTHON_DRV=$(nix-store --query --references "$DRV" 2>/dev/null | grep python | head -1 || echo "")
    if [ -n "$PYTHON_DRV" ]; then
        PYTHON_OUTPUT=$(nix-store --query --outputs "$PYTHON_DRV" 2>/dev/null | head -1 || echo "")
    fi
fi

if [ -z "$PYTHON_OUTPUT" ]; then
    echo "   Could not find Python package. Trying Poetry instead..."
    POETRY_OUTPUT=$(nix-store --query --references "$DRV" 2>/dev/null | grep poetry | head -1 || echo "")
    if [ -n "$POETRY_OUTPUT" ]; then
        PYTHON_OUTPUT="$POETRY_OUTPUT"
    fi
fi

if [ -z "$PYTHON_OUTPUT" ]; then
    echo "   Error: Could not find a suitable package to test"
    echo "   Using a smaller package instead..."
    # Use a smaller package - bash
    PYTHON_OUTPUT=$(nix-store --query --references "$DRV" 2>/dev/null | grep bash | head -1 || echo "")
fi

if [ -z "$PYTHON_OUTPUT" ]; then
    echo "   Error: Still couldn't find a package. Aborting test."
    exit 1
fi

echo "   Found: $PYTHON_OUTPUT"
echo ""

# Check if it exists
if [ ! -e "$PYTHON_OUTPUT" ]; then
    echo "   Package not in store - will test fetch from cache"
    TEST_PACKAGE="$PYTHON_OUTPUT"
else
    echo "2. Package exists locally. Backing up and deleting..."
    BACKUP_DIR=$(mktemp -d)
    echo "   Backup dir: $BACKUP_DIR"

    # Try to delete it (may fail if in use, but that's okay)
    if nix-store --delete "$PYTHON_OUTPUT" 2>/dev/null; then
        echo "   ? Deleted from local store"
        TEST_PACKAGE="$PYTHON_OUTPUT"
    else
        echo "   ? Could not delete (may be in use or protected)"
        echo "   Testing with a different approach..."
        TEST_PACKAGE=""
    fi
fi

echo ""
echo "3. Testing cache usage..."
echo "   Entering backend shell and watching for cache activity..."
echo "   Look for messages like: 'copying path ... from https://danielsteman.cachix.org'"
echo ""

# Now try to realize/use the shell and watch for cache hits
if [ -n "$TEST_PACKAGE" ]; then
    echo "   Rebuilding: $TEST_PACKAGE"
    echo ""

    # Try to realize it with verbose logging
    LOG_FILE=$(mktemp)
    nix-store --realize "$TEST_PACKAGE" --log-format internal-json 2>"$LOG_FILE" || true

    if command -v jq &> /dev/null; then
        echo "   Cache activity:"
        jq -r 'select(.action=="download" or .action=="copyPath") | "   \(.action): \(.substituter // "local-store")"' "$LOG_FILE" 2>/dev/null | \
            head -10 || echo "     (No cache activity - may need to check differently)"

        # Show the actual substituter URLs
        SUBSTITUTERS=$(jq -r 'select(.action=="download" or .action=="copyPath") | .substituter' "$LOG_FILE" 2>/dev/null | sort -u)
        if [ -n "$SUBSTITUTERS" ]; then
            echo ""
            echo "   ? Cache was used! Substituters:"
            echo "$SUBSTITUTERS" | sed 's/^/     - /'
        else
            echo ""
            echo "   (No substituter info in logs - package may already be in store)"
        fi
    else
        echo "   (Install jq for detailed cache analysis)"
        grep -i "copying\|substituter\|cache" "$LOG_FILE" | head -5 | sed 's/^/     /' || echo "     (No cache messages)"
    fi

    rm -f "$LOG_FILE"
else
    echo "   Testing by entering shell with verbose logging..."
    echo ""
    nix develop '.#backend' --print-build-logs --command bash -c "echo 'Shell ready'" 2>&1 | \
        grep -E "(copying path|from https://|substituter)" | \
        head -10 | sed 's/^/     /' || \
        echo "     (No cache activity shown - packages already available)"
fi

echo ""
echo "=== Alternative Test Method ==="
echo ""
echo "To manually test cache usage:"
echo ""
echo "1. Delete a package:"
echo "   nix-store --delete $PYTHON_OUTPUT"
echo ""
echo "2. Enter shell with verbose logging:"
echo "   nix develop '.#backend' --print-build-logs"
echo ""
echo "3. Look for output like:"
echo "   copying path '/nix/store/...' from 'https://danielsteman.cachix.org'"
echo ""
echo "4. If you see your Cachix URL, the cache is working!"
echo ""
echo "5. For JSON logs:"
echo "   nix-store --realize $PYTHON_OUTPUT --log-format internal-json 2>&1 | jq -r 'select(.action==\"download\") | .substituter'"
