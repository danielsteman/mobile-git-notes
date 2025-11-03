# Testing Binary Cache Usage

This document explains how to verify that the Nix binary cache is being used during local development.

## Current Configuration

The project is configured to use:
- **cache.nixos.org** (standard NixOS cache) - configured by default
- **danielsteman.cachix.org** (custom Cachix cache) - configured in `flake.nix`

You can verify the configuration with:
```bash
nix show-config | grep -E "^substituters|^trusted-substituters"
```

## Testing Methods

### Method 1: Watch Cache Activity During Shell Entry (Recommended)

The easiest way to see cache hits in real-time:

```bash
nix develop '.#backend' --print-build-logs
```

**What to look for:**
- ? **Cache hit from Cachix**: `copying path '/nix/store/...' from 'https://danielsteman.cachix.org'`
- ? **Cache hit from NixOS**: `copying path '/nix/store/...' from 'https://cache.nixos.org'`
- ? **Cache miss (local build)**: `building '/nix/store/...'`

If you see URLs in the "copying path" messages, **the cache is working!**

### Method 2: Check if Packages Are Available from Cache

Check if a specific package exists in your Cachix cache:

```bash
# Get a package path from the shell
SYSTEM=$(nix eval --impure --expr 'builtins.currentSystem')
DRV=$(nix eval ".#devShells.$SYSTEM.backend.drvPath" | sed 's/"//g')
SAMPLE_PKG=$(nix-store --query --references "$DRV" | grep python | head -1)

# Check if it's in Cachix cache
nix path-info --store https://danielsteman.cachix.org "$SAMPLE_PKG"
```

If the command succeeds, the package is available in your cache.

### Method 3: Force a Cache Test (Advanced)

To actually see cache activity, you need packages that aren't in your local store:

1. **Find a package to test:**
   ```bash
   SYSTEM=$(nix eval --impure --expr 'builtins.currentSystem')
   DRV=$(nix eval ".#devShells.$SYSTEM.backend.drvPath" | sed 's/"//g')
   nix-store --query --references "$DRV" | grep -v "\.drv$" | head -5
   ```

2. **Delete it from local store** (if not in use):
   ```bash
   nix-store --delete /nix/store/<package-hash>-<package-name>
   ```

3. **Rebuild and watch for cache hits:**
   ```bash
   nix develop '.#backend' --print-build-logs
   ```

   You should see `copying path ... from https://danielsteman.cachix.org` or `https://cache.nixos.org`.

### Method 4: Use JSON Logs for Detailed Analysis

For detailed cache activity, use JSON logging:

```bash
SYSTEM=$(nix eval --impure --expr 'builtins.currentSystem')
DRV=$(nix eval ".#devShells.$SYSTEM.backend.drvPath" | sed 's/"//g')

# Realize with JSON logging
nix-store --realize "$DRV" --log-format internal-json 2>&1 | \
  jq -r 'select(.action=="download" or .action=="copyPath") | "\(.action): \(.substituter // "local")"'
```

This shows which substituters were used for each package.

### Method 5: Enable Debug Logging

Enable verbose Nix logging to see all substituter queries:

```bash
export NIX_DEBUG=1
nix develop '.#backend' --command echo 'test'
```

This will show detailed information about which substituters are queried.

## Expected Behavior

### ? Cache is Working

You'll see output like:
```
copying path '/nix/store/abc123-python3-3.12.7' from 'https://danielsteman.cachix.org'
copying path '/nix/store/def456-poetry-1.8.3' from 'https://cache.nixos.org'
```

### ? Cache Not Working

You'll see:
```
building '/nix/store/abc123-python3-3.12.7'
```

This means packages are being built locally instead of downloaded from cache.

## Quick Test Scripts

The project includes test scripts:

- `./test-cache.sh` - Basic cache configuration check
- `./test-cache-usage.sh` - Attempts to test cache by deleting packages
- `./verify-cache.sh` - Shows all available testing methods

## Troubleshooting

### Warnings About Untrusted Substituters

If you see warnings like:
```
warning: ignoring untrusted substituter 'https://danielsteman.cachix.org'
```

This is a security restriction. The cache should still work because it's configured in `trusted-substituters` at the system level. To verify:

```bash
nix show-config | grep trusted-substituters
```

If `danielsteman.cachix.org` appears in the list, it's working despite the warnings.

### No Cache Activity Shown

If you don't see any cache activity, it likely means:
1. All packages are already in your local store (cache was used previously)
2. Packages are being built locally (check if they exist in cache)

To verify, check if packages exist in the cache:
```bash
nix path-info --store https://danielsteman.cachix.org <package-path>
```

## Summary

**The cache is working if:**
1. Packages download quickly (vs building slowly)
2. You see "copying path ... from https://..." messages
3. The substituters are configured correctly

**If everything is already cached locally**, you won't see cache activity - but that's actually a good sign! It means the cache worked previously and packages are now in your local store.
