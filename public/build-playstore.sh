#!/usr/bin/env bash
# OmniSync Hub — Automated Google Play Store (.aab & .apk) TWA Builder
set -e

APP_URL="https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app"
PACKAGE_ID="app.omnisync.hub"

echo "========================================================"
echo "  OmniSync Hub — Google Play Store TWA Packager"
echo "  Target URL: $APP_URL"
echo "  Package ID: $PACKAGE_ID"
echo "========================================================"

# 1. Install Bubblewrap CLI if not present
if ! command -v bubblewrap &> /dev/null; then
  echo "[1/3] Installing @bubblewrap/cli..."
  npm install -g @bubblewrap/cli
fi

# 2. Initialize Android Trusted Web Activity (TWA) project
echo "[2/3] Initializing TWA project from $APP_URL/manifest.webmanifest..."
mkdir -p omnisync-playstore-build
cd omnisync-playstore-build
bubblewrap init --manifest="$APP_URL/manifest.webmanifest"

# 3. Build signed Android App Bundle (.aab) and APK (.apk)
echo "[3/3] Building signed Google Play Store bundle (app-release-bundle.aab)..."
bubblewrap build

echo "========================================================"
echo "  Done! Upload app-release-bundle.aab to Google Play Console:"
echo "  https://play.google.com/console"
echo "========================================================"
