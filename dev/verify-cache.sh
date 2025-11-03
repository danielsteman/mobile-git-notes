#!/usr/bin/env bash
set -euo pipefail

echo "=== How to Verify Binary Cache Usage ==="
echo ""

echo "Current substituter configuration:"
nix show-config 2>&1 | grep -E "^substituters|^trusted-substituters" | sed 's/^/  /'
echo ""

echo "To test if the cache is being used:"
echo ""
echo "Method 1: Watch for cache hits during shell entry"
echo "  Run: nix develop '.#backend' --print-build-logs"
echo "  Look for lines like:"
echo "    copying path '/nix/store/...' from 'https://danielsteman.cachix.org'"
echo "  If you see your Cachix URL, the cache is working!"
echo ""

echo "Method 2: Test with a missing package"
echo "  1. Find a package:"
SYSTEM=$(nix eval --impure --expr 'builtins.currentSystem' 2>/dev/null || echo "aarch64-darwin")
DRV=$(nix eval ".#devShells.$SYSTEM.backend.drvPath" --no-warn-dirty 2>&1 | sed 's/"//g' | tail -1)
SAMPLE_PKG=$(nix-store --query --references "$DRV" 2>/dev/null | grep -v "\.drv$" | head -1)
echo "     Sample package: $SAMPLE_PKG"
echo ""
echo "  2. Check if substituters are queried:"
echo "     nix-store --query --valid-derivers $SAMPLE_PKG 2>&1 | head -1 | xargs nix-store --realize --dry-run 2>&1"
echo ""
echo "  3. Or use nix why-depends to see dependency chain and check cache:"
echo "     nix why-depends '.#devShells.$SYSTEM.backend' $SAMPLE_PKG"
echo ""

echo "Method 3: Use Nix's built-in cache verification"
echo "  Run: nix path-info --recursive '.#devShells.$SYSTEM.backend' | head -5"
echo "  Then check which are local vs remote:"
echo "    nix path-info --store https://danielsteman.cachix.org <path>"
echo ""

echo "Method 4: Enable verbose Nix logging"
echo "  Set: export NIX_DEBUG=1"
echo "  Then: nix develop '.#backend' --command echo 'test'"
echo "  This will show detailed substituter queries"
echo ""

echo "Method 5: Check Nix's log database"
echo "  View recent activity:"
echo "    cat ~/.cache/nix/log/nix-shell-*.log | grep -i substituter | tail -10"
echo ""

echo "=== Quick Test ==="
echo ""
echo "Running a quick test now..."
echo ""

# Try to get info about a package and check if it's available from cache
if [ -n "$SAMPLE_PKG" ]; then
    echo "Checking if sample package is available from cache..."

    # Check if it exists in our Cachix cache
    if nix path-info --store https://danielsteman.cachix.org "$SAMPLE_PKG" 2>&1 | grep -q "$SAMPLE_PKG"; then
        echo "  ? Package found in danielsteman.cachix.org cache!"
    else
        echo "  (Package not found in Cachix cache - may be in cache.nixos.org or not cached)"
    fi

    # Check if it exists locally
    if [ -e "$SAMPLE_PKG" ]; then
        echo "  ? Package exists locally"
    else
        echo "  Package not in local store - would be fetched from cache"
    fi
fi

echo ""
echo "=== Recommended Test ==="
echo ""
echo "The easiest way to verify cache usage:"
echo ""
echo "1. Enter shell with verbose logging:"
echo "   nix develop '.#backend' --print-build-logs --command bash"
echo ""
echo "2. Look for output containing:"
echo "   - 'copying path' + 'from https://danielsteman.cachix.org' = CACHE HIT ?"
echo "   - 'copying path' + 'from https://cache.nixos.org' = NixOS cache (also good)"
echo "   - 'building' = Local build (cache miss)"
echo ""
echo "3. If you want to force a test, temporarily rename your store:"
echo "   sudo mv /nix/store /nix/store.backup"
echo "   nix develop '.#backend' --print-build-logs"
echo "   sudo mv /nix/store.backup /nix/store"
echo "   (Note: This is a destructive test - not recommended!)"
