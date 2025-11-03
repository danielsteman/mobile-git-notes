#!/usr/bin/env bash
set -euo pipefail

echo "=== Testing Binary Cache Usage ==="
echo ""

# Check configured substituters
echo "1. Configured substituters:"
nix show-config 2>&1 | grep -E "^substituters|^trusted-substituters" | sed 's/^/   /' || true
echo ""

# Get all dependencies of the backend shell
echo "2. Getting backend shell dependencies..."
SYSTEM=$(nix eval --impure --expr 'builtins.currentSystem' 2>/dev/null || echo "aarch64-darwin")
DRV=$(nix eval ".#devShells.$SYSTEM.backend.drvPath" --no-warn-dirty 2>&1 | sed 's/"//g' | tail -1)
echo "   Derivation: $DRV"
echo ""

# Get all dependencies
echo "3. Analyzing dependencies (this shows what would be built vs downloaded)..."
DEPS=$(nix-store --query --references "$DRV" 2>/dev/null | head -20 || echo "")

if [ -n "$DEPS" ]; then
    echo "   Checking first 10 dependencies for cache availability..."
    COUNT=0
    CACHED=0
    MISSING=0

    for dep in $DEPS; do
        if [ $COUNT -ge 10 ]; then
            break
        fi
        COUNT=$((COUNT + 1))

        # Check if it exists locally
        if [ -e "$dep" ]; then
            echo "   ? $dep (local)"
            CACHED=$((CACHED + 1))
        else
            echo "   ? $dep (needs fetch/build)"
            MISSING=$((MISSING + 1))
        fi
    done

    echo ""
    echo "   Summary: $CACHED cached locally, $MISSING need fetch/build"
else
    echo "   Could not query dependencies"
fi

echo ""
echo "4. Testing actual cache usage with verbose build logs..."
echo "   This will show 'copying path' (cache hit) or 'building' (local build)"
echo ""

# Use nix develop with --print-build-logs to see what happens
echo "   Entering backend shell (watch for cache activity)..."
nix develop '.#backend' --print-build-logs --command bash -c "echo 'Shell ready'" 2>&1 | \
    grep -E "(copying path|downloading|will be (built|downloaded|copied)|substituter)" | \
    head -20 | sed 's/^/     /' || echo "     (No build activity - everything already available)"

echo ""
echo "5. Direct test: Try to realize a dependency and watch for cache hits..."
echo "   (Picking a Python package as example)"

# Get Python from the shell
PYTHON_DRV=$(nix-store --query --references "$DRV" 2>/dev/null | grep python | head -1 || echo "")

if [ -n "$PYTHON_DRV" ]; then
    echo "   Testing: $PYTHON_DRV"
    echo "   Realizing with verbose output..."

    # Try to realize with logging
    nix-store --realize "$PYTHON_DRV" --log-format internal-json 2>&1 | \
        jq -r 'select(.action=="download" or .action=="copyPath") | "\(.action): \(.substituter // "local")"' 2>/dev/null | \
        head -5 | sed 's/^/     /' || \
        echo "     (Already in store or no cache activity logged)"
else
    echo "   (Could not find Python derivation to test)"
fi

echo ""
echo "=== Alternative: Manual Cache Test ==="
echo ""
echo "To test cache usage yourself:"
echo ""
echo "1. Clear a package from local store:"
echo "   nix-store --delete /nix/store/<some-hash>-python3-3.12.7"
echo ""
echo "2. Enter shell and watch for 'copying path' messages:"
echo "   nix develop '.#backend' --print-build-logs"
echo ""
echo "3. If you see 'copying path /nix/store/... from https://danielsteman.cachix.org',"
echo "   the cache is working!"
echo ""
echo "4. For detailed JSON logs:"
echo "   nix-store --realize $DRV --log-format internal-json 2>&1 | jq"
