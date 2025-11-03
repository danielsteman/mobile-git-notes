# Mobile Git Notes – Frontend (Expo)

## Using Nix dev shell (frontend)

Keep installs explicit; the shell only provides Node/npm.

- Install deps explicitly:

```bash
nix develop .#mobile --command bash -lc "cd mobile-git-notes && npm ci"
```

- Lint:

```bash
nix develop .#mobile --command bash -lc "cd mobile-git-notes && npm run lint"
```

- Start the app:

```bash
nix develop .#mobile --command bash -lc "cd mobile-git-notes && npm run start"
```

## iOS Simulator setup (macOS)

If pressing `i` in Expo shows “No iOS devices available in Simulator.app” or `xcrun simctl list runtimes` is empty, install iOS Simulator runtimes via Xcode.

GUI (recommended):

- Open Xcode → Settings → Platforms → install “iOS Simulator” (iOS 18 or 17)
- Open Xcode once and accept the license if prompted

CLI (Xcode 15/16):

```bash
# Ensure full Xcode is selected (not Command Line Tools)
sudo xcode-select -switch /Applications/Xcode.app

# Initialize Xcode on first use
sudo xcodebuild -runFirstLaunch

# Download the iOS platform (installs Simulator runtimes)
sudo xcodebuild -downloadPlatform iOS
```

Verify and create a simulator:

```bash
# List installed runtimes and device types
xcrun simctl list runtimes
xcrun simctl list devicetypes | grep -i iphone

# Create and boot a device using the exact IDs printed above (example IDs shown)
xcrun simctl create "My iPhone" \
  com.apple.CoreSimulator.SimDeviceType.iPhone-15 \
  com.apple.CoreSimulator.SimRuntime.iOS-18-1

open -a Simulator
xcrun simctl boot "My iPhone" || true
```

Then start Expo and press `i` to open the iOS Simulator.
