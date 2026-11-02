import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Download,
  Copy,
  CheckCircle2,
  RefreshCw,
  Cloud,
  Github,
  Database,
  Terminal,
  ExternalLink,
  Lock,
  Sparkles,
  Layers,
  KeyRound,
  Image as ImageIcon,
  FileCode,
  Check,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GitHubUser } from '../services/github';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: User | null;
  githubUser: GitHubUser | null;
  onGoogleSignIn: () => void;
  onPullEverything: () => Promise<void>;
  isSyncing: boolean;
  stats: {
    reposCount: number;
    driveCount: number;
    projectsCount: number;
    tasksCount: number;
    notesCount: number;
    bridgesCount: number;
  };
}

type ModalSection =
  | 'pull_hub'
  | 'play_store'
  | 'graphics_studio'
  | 'store_listing';

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  githubUser,
  onGoogleSignIn,
  onPullEverything,
  isSyncing,
  stats,
}) => {
  const [activeSection, setActiveSection] = useState<ModalSection>('play_store');
  const [packageName, setPackageName] = useState('app.omnisync.hub');
  const [versionName, setVersionName] = useState('3.0.0');
  const [versionCode, setVersionCode] = useState(3);
  const [targetSdk, setTargetSdk] = useState(35);
  const [sha256Fingerprint, setSha256Fingerprint] = useState(
    'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [assetLinksVerified, setAssetLinksVerified] = useState<boolean | null>(null);
  const [isVerifyingLinks, setIsVerifyingLinks] = useState(false);

  const { isInstallable, isInstalled, install: triggerInstall } = usePWAInstall();

  if (!isOpen) return null;

  const appOrigin = window.location.origin;
  const appHost = window.location.host;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const assetLinksJson = JSON.stringify(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName,
          sha256_cert_fingerprints: [sha256Fingerprint.trim()],
        },
      },
    ],
    null,
    2
  );

  const twaManifestJson = JSON.stringify(
    {
      packageId: packageName,
      host: appHost,
      name: 'OmniSync Hub',
      launcherName: 'OmniSync',
      display: 'standalone',
      themeColor: '#0F172A',
      navigationColor: '#090D16',
      navigationColorDark: '#090D16',
      navigationDividerColor: '#1E293B',
      navigationDividerColorDark: '#1E293B',
      backgroundColor: '#090D16',
      enableNotifications: true,
      startUrl: '/',
      iconUrl: `${appOrigin}/pwa-512x512.png`,
      maskableIconUrl: `${appOrigin}/pwa-maskable-512x512.png`,
      splashScreenFadeOutDuration: 300,
      signingKey: {
        path: './android.keystore',
        alias: 'omnisync-release-key',
      },
      appVersionName: versionName,
      appVersionCode: versionCode,
      shortcuts: [
        {
          name: 'Pull Everything & Sync',
          shortName: 'Pull All',
          url: '/?action=pull-all',
          chosenIconUrl: `${appOrigin}/pwa-192x192.png`,
        },
        {
          name: '3D Game & WebGL Studio',
          shortName: '3D Game',
          url: '/?tab=three_game',
          chosenIconUrl: `${appOrigin}/pwa-192x192.png`,
        },
        {
          name: 'Bioscience Lab',
          shortName: 'Science Lab',
          url: '/?tab=science_lab',
          chosenIconUrl: `${appOrigin}/pwa-192x192.png`,
        },
        {
          name: 'AI Multi-Modal Suite',
          shortName: 'AI Studio',
          url: '/?tab=ai',
          chosenIconUrl: `${appOrigin}/pwa-192x192.png`,
        },
      ],
      generatorApp: 'bubblewrap-cli',
      webManifestUrl: `${appOrigin}/manifest.webmanifest`,
      fallbackType: 'customtabs',
      enableSiteSettingsShortcut: true,
      isChromeOSOnly: false,
      isMetaQuest: false,
      fullScopeUrl: `${appOrigin}/`,
      minSdkVersion: 24,
      targetSdkVersion: targetSdk,
      orientation: 'portrait-primary',
      fingerprints: [
        {
          name: 'Play Store Release Key',
          value: sha256Fingerprint.trim(),
        },
      ],
    },
    null,
    2
  );

  const androidBuildGradle = `plugins {
    id 'com.android.application'
}

android {
    namespace "${packageName}"
    compileSdk ${targetSdk}

    defaultConfig {
        applicationId "${packageName}"
        minSdk 24
        targetSdk ${targetSdk}
        versionCode ${versionCode}
        versionName "${versionName}"
    }

    signingConfigs {
        release {
            storeFile file("../android.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "omnisync-store-pass"
            keyAlias "omnisync-release-key"
            keyPassword System.getenv("KEY_PASSWORD") ?: "omnisync-key-pass"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}

dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}`;

  const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="OmniSync Hub"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Translucent.NoTitleBar">

        <meta-data
            android:name="asset_statements"
            android:resource="@string/asset_statements" />

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:exported="true"
            android:label="OmniSync">
            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="${appOrigin}/" />
            <meta-data
                android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
                android:resource="@color/colorPrimary" />
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="${appHost}" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const bubblewrapCommand = `#!/usr/bin/env bash
# OmniSync Hub v${versionName} — Complete Google Play Store (.AAB & .APK) Builder
set -e

# 1. Generate Production Upload Keystore (2048-bit RSA, 10000 days validity)
if [ ! -f android.keystore ]; then
  keytool -genkeypair -v -keystore android.keystore -alias omnisync-release-key \\
    -keyalg RSA -keysize 2048 -validity 10000 \\
    -dname "CN=OmniSync Hub, OU=Creator Studio, O=OmniSync, L=San Francisco, S=CA, C=US" \\
    -storepass omnisync-store-pass -keypass omnisync-key-pass
fi

# 2. Print SHA-256 Fingerprint for /.well-known/assetlinks.json
keytool -list -v -keystore android.keystore -alias omnisync-release-key -storepass omnisync-store-pass | grep SHA256

# 3. Install Bubblewrap CLI & Build Signed Android App Bundle (.aab)
npm i -g @bubblewrap/cli
bubblewrap init --manifest=${appOrigin}/manifest.webmanifest
bubblewrap build

echo "Upload app-release-bundle.aab to Google Play Console -> Production -> Create new release!"`;

  const downloadFile = (filename: string, content: string, mime = 'application/json') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullPlayStoreBundle = () => {
    const masterBundle = {
      packageVersion: versionName,
      versionCode,
      targetSdkVersion: targetSdk,
      generatedAt: new Date().toISOString(),
      files: {
        'twa-manifest.json': JSON.parse(twaManifestJson),
        '.well-known/assetlinks.json': JSON.parse(assetLinksJson),
        'app/build.gradle': androidBuildGradle,
        'app/src/main/AndroidManifest.xml': androidManifestXml,
        'build-playstore.sh': bubblewrapCommand,
      },
    };
    downloadFile(
      `omnisync-playstore-package-v${versionName}.json`,
      JSON.stringify(masterBundle, null, 2)
    );
  };

  const handleSyncAndVerifyAssetLinks = async () => {
    setIsVerifyingLinks(true);
    setAssetLinksVerified(null);
    try {
      await fetch('/api/playstore/assetlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName,
          sha256Fingerprints: [sha256Fingerprint.trim()],
        }),
      });
      const verifyRes = await fetch('/.well-known/assetlinks.json');
      const json = await verifyRes.json();
      const matched =
        Array.isArray(json) &&
        json[0]?.target?.package_name === packageName.trim();
      setAssetLinksVerified(matched);
    } catch {
      setAssetLinksVerified(false);
    } finally {
      setIsVerifyingLinks(false);
    }
  };

  // HTML5 Canvas Store Graphic Generators
  const generateStoreGraphic = (type: 'feature_1024x500' | 'icon_512x512' | 'phone_1080x1920') => {
    const canvas = document.createElement('canvas');
    if (type === 'feature_1024x500') {
      canvas.width = 1024;
      canvas.height = 500;
    } else if (type === 'icon_512x512') {
      canvas.width = 512;
      canvas.height = 512;
    } else {
      canvas.width = 1080;
      canvas.height = 1920;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Deep cosmic gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#090D16');
    grad.addColorStop(0.5, '#0F172A');
    grad.addColorStop(1, '#1E1B4B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle cyber grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 2;
    const step = 64;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Glowing orb accent
    const radial = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.4,
      20,
      canvas.width * 0.5,
      canvas.height * 0.4,
      canvas.width * 0.45
    );
    radial.addColorStop(0, 'rgba(34, 211, 238, 0.28)');
    radial.addColorStop(0.6, 'rgba(99, 102, 241, 0.14)');
    radial.addColorStop(1, 'rgba(9, 13, 22, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (type === 'icon_512x512') {
      // Center emblem
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(256, 256, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 58px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OMNI', 256, 245);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 44px monospace';
      ctx.fillText('SYNC', 256, 305);
    } else if (type === 'feature_1024x500') {
      ctx.fillStyle = '#22D3EE';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('GOOGLE PLAY STORE EDITION • v3.0.0', 72, 130);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText('OmniSync Hub', 72, 215);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '28px sans-serif';
      ctx.fillText(
        'Cloud Sync • GitHub • Drive • Gemini AI Suite • 3D WebGL • Bioscience Lab',
        72,
        275
      );

      // Feature Badges
      const badges = ['GitHub & Drive', 'Gemini 4 AI', '3D WebGL Studio', 'RCSB Bioscience'];
      badges.forEach((b, i) => {
        const bx = 72 + i * 220;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, 335, 200, 54);
        ctx.fillRect(bx, 335, 200, 54);
        ctx.fillStyle = '#E2E8F0';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(b, bx + 20, 368);
      });
    } else {
      // Phone Screenshot 1080x1920
      ctx.fillStyle = '#22D3EE';
      ctx.font = 'bold 34px monospace';
      ctx.fillText('OMNISYNC HUB v3.0', 80, 160);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText('All Your Clouds', 80, 260);
      ctx.fillText('& AI Studios in One', 80, 350);

      const cards = [
        { title: 'Universal Cloud Pull', sub: 'GitHub Repos, Google Drive & Firestore Vault', color: '#38BDF8' },
        { title: 'Gemini Multi-Modal Suite', sub: 'Argon Chat, Live Voice, Nano Banana, Omni Video & Lyria 3', color: '#A855F7' },
        { title: '3D Game & Shader Studio', sub: 'Three.js OmniRunner 3D & GLSL Shader Architect', color: '#10B981' },
        { title: 'Bioscience Workbench', sub: 'RCSB PDB 3D Proteins, PubChem & ClinicalTrials.gov', color: '#F59E0B' },
        { title: 'Meta Muse & Creator Hub', sub: '1D World Reiki, Kiki 2.0, KikiOS & PayPal Earnings', color: '#EC4899' },
      ];

      cards.forEach((c, idx) => {
        const cy = 460 + idx * 250;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 4;
        ctx.fillRect(80, cy, 920, 200);
        ctx.strokeRect(80, cy, 920, 200);

        ctx.fillStyle = c.color;
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText(c.title, 125, cy + 85);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '28px sans-serif';
        ctx.fillText(c.sub, 125, cy + 145);
      });
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `omnisync-${type}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-emerald-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                OmniSync Hub — Complete Google Play Store Release Package Studio
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v{versionName} • Target SDK {targetSdk} Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete Android TWA (.aab) Builder, Live Digital Asset Links Verifier, Play Console Graphics Generator &amp; Store Listing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('play_store')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'play_store'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            1. Play Store Package (.AAB / Gradle / TWA)
          </button>
          <button
            onClick={() => setActiveSection('graphics_studio')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'graphics_studio'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            2. Store Graphics (1024x500 &amp; Screenshots)
          </button>
          <button
            onClick={() => setActiveSection('store_listing')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'store_listing'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            3. Play Console Listing &amp; Data Safety
          </button>
          <button
            onClick={() => setActiveSection('pull_hub')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'pull_hub'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            4. Pull Everything &amp; Stay Signed In
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeSection === 'play_store' && (
            <div className="space-y-5">
              {/* Top Master Download Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/70 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Google Play Console 2026 Compliant (Target SDK {targetSdk})
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Complete Google Play Store Android Package ({packageName})
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    Includes live <code className="text-emerald-300">/.well-known/assetlinks.json</code> verification, Bubblewrap TWA manifest, Android Studio <code className="text-cyan-300">build.gradle</code>, <code className="text-cyan-300">AndroidManifest.xml</code>, and automated <code className="text-amber-300">.aab</code> release key signing script.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={handleDownloadFullPlayStoreBundle}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    Download Full Play Store Package
                  </button>
                  {!isInstalled && isInstallable && (
                    <button
                      onClick={triggerInstall}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      Install Direct to Device
                    </button>
                  )}
                </div>
              </div>

              {/* Package ID, Version & SHA-256 Certificate Configurator */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Android Application ID, Version &amp; Digital Asset Links Live Sync
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSyncAndVerifyAssetLinks}
                      disabled={isVerifyingLinks}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5"
                    >
                      {isVerifyingLinks ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      Sync &amp; Verify Live /.well-known/assetlinks.json
                    </button>
                    <a
                      href="/.well-known/assetlinks.json"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Open Live Endpoint
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {assetLinksVerified !== null && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      assetLinksVerified
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {assetLinksVerified
                      ? `Verified! /.well-known/assetlinks.json is live and delegating URL handling to ${packageName}.`
                      : 'Could not verify assetlinks endpoint.'}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Package ID (applicationId)
                    </label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Version Name
                    </label>
                    <input
                      type="text"
                      value={versionName}
                      onChange={(e) => setVersionName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Version Code (Int)
                    </label>
                    <input
                      type="number"
                      value={versionCode}
                      onChange={(e) => setVersionCode(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Target SDK (Play 2026)
                    </label>
                    <input
                      type="number"
                      value={targetSdk}
                      onChange={(e) => setTargetSdk(parseInt(e.target.value, 10) || 35)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Google Play App Signing SHA-256 Certificate Fingerprint
                  </label>
                  <input
                    type="text"
                    value={sha256Fingerprint}
                    onChange={(e) => setSha256Fingerprint(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Individual Package Artifact Downloads */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <button
                  onClick={() => downloadFile('twa-manifest.json', twaManifestJson)}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-300 flex flex-col items-center gap-1.5"
                >
                  <FileCode className="w-4 h-4" />
                  <span>twa-manifest.json</span>
                </button>
                <button
                  onClick={() => downloadFile('assetlinks.json', assetLinksJson)}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-300 flex flex-col items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>assetlinks.json</span>
                </button>
                <button
                  onClick={() => downloadFile('build.gradle', androidBuildGradle, 'text/plain')}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-cyan-300 flex flex-col items-center gap-1.5"
                >
                  <FileCode className="w-4 h-4" />
                  <span>app/build.gradle</span>
                </button>
                <button
                  onClick={() =>
                    downloadFile('AndroidManifest.xml', androidManifestXml, 'application/xml')
                  }
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-purple-300 flex flex-col items-center gap-1.5"
                >
                  <FileCode className="w-4 h-4" />
                  <span>AndroidManifest.xml</span>
                </button>
                <button
                  onClick={() => downloadFile('build-playstore.sh', bubblewrapCommand, 'text/x-sh')}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-amber-300 flex flex-col items-center gap-1.5"
                >
                  <Terminal className="w-4 h-4" />
                  <span>build-playstore.sh</span>
                </button>
              </div>

              {/* Bubblewrap & Keystore Script Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Automated Keystore + Signed Play Store Bundle (.aab) Build Script
                  </span>
                  <button
                    onClick={() => copyToClipboard(bubblewrapCommand, 'bubblewrap')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5"
                  >
                    {copiedKey === 'bubblewrap' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Script
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-900/90 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {bubblewrapCommand}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: PLAY STORE GRAPHICS STUDIO */}
          {activeSection === 'graphics_studio' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white">
                  Google Play Console Mandatory Store Graphic Assets Generator
                </h3>
                <p className="text-xs text-slate-400">
                  Google Play Console requires exact pixel dimensions for store submission. Click below to render and download compliant PNG assets directly from the browser canvas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300">
                      512 × 512 px • 32-bit PNG
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2">
                      Hi-Res Play Store Icon
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Required for Google Play Console Main Store Listing app icon slot.
                    </p>
                  </div>
                  <button
                    onClick={() => generateStoreGraphic('icon_512x512')}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download 512×512 PNG
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                      1024 × 500 px • PNG
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2">
                      Play Store Feature Graphic
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Mandatory 1024×500 promotional banner displayed at the top of your Play Store page.
                    </p>
                  </div>
                  <button
                    onClick={() => generateStoreGraphic('feature_1024x500')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download 1024×500 Banner
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                      1080 × 1920 px • 9:16 PNG
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2">
                      Phone Store Screenshot
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Full HD 9:16 portrait promotional screenshot showcasing OmniSync Hub studios.
                    </p>
                  </div>
                  <button
                    onClick={() => generateStoreGraphic('phone_1080x1920')}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download 1080×1920 Screenshot
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORE LISTING & DATA SAFETY */}
          {activeSection === 'store_listing' && (
            <div className="space-y-4">
              {[
                {
                  key: 'privacy_url',
                  label: 'Privacy Policy URL (Required by Google Play Console -> App Content)',
                  content: `${appOrigin}/privacy.html`,
                },
                {
                  key: 'terms_url',
                  label: 'Terms of Service URL (Play Store / Legal)',
                  content: `${appOrigin}/terms.html`,
                },
                {
                  key: 'title',
                  label: 'App Name (Max 30 chars)',
                  content: 'OmniSync Hub: Cloud & AI Studio',
                },
                {
                  key: 'short_desc',
                  label: 'Short Description (Max 80 chars)',
                  content:
                    'Unified workspace syncing GitHub, Drive, Gemini AI, 3D WebGL & Bioscience Lab.',
                },
                {
                  key: 'release_notes',
                  label: `Release Notes (v${versionName} — Production Track)`,
                  content: `<en-US>
• Added Multi-Modal Gemini AI Suite: Argon/Calcium Chat, Search & Maps Grounding, Gemini Live Voice, Nano Banana 2.1 Image Studio, Omni Flash Video, and Lyria 3 Music.
• Added 3D Game & WebGL Spatial Studio: Play OmniRunner 3D and build custom GLSL shaders.
• Added Bioscience Workbench: 3D RCSB PDB protein viewer, PubChem drug explorer & ClinicalTrials.gov registry.
• Full Android 15 (Target SDK 35) & Trusted Web Activity Digital Asset Links support.
</en-US>`,
                },
                {
                  key: 'full_desc',
                  label: 'Full Description (Max 4000 chars)',
                  content: `OmniSync Hub is a unified continuous synchronization workspace and multi-modal creative studio built for creators, engineers, and researchers.

KEY FEATURES:
• Universal Cloud Sync: Pull and synchronize GitHub repositories, issues, commits, Google Drive files, and Zero-Trust Firestore Cloud Vault records in real time.
• Multi-Modal Gemini AI Suite: Chat with Gemini 4 Argon & Calcium, run live Google Search & Google Maps grounded queries, converse via Gemini Live Real-Time Native Audio, generate up to 4K art with Nano Banana 2.1, animate videos with Omni Flash, and compose music with Lyria 3.
• 3D Game & WebGL Spatial Studio: Play OmniRunner 3D: Cyber-Node Defender and inspect custom GLSL shaders and 3D primitives powered by Three.js.
• Scientific Computing & Bioscience Workbench: Render interactive 3D protein structures from RCSB PDB, inspect chemical properties from PubChem, and search Europe PMC & ClinicalTrials.gov.
• Creator Ecosystem: Includes Meta Muse & App Store launcher, 1D World & Reiki HQ, Kiki's World 2.0, KikiOS Cyber-Deck, and PayPal Creator Earnings.`,
                },
              ].map((field) => (
                <div
                  key={field.key}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">{field.label}</span>
                    <button
                      onClick={() => copyToClipboard(field.content, field.key)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                    >
                      {copiedKey === field.key ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-900 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {field.content}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PULL EVERYTHING & PERSISTENT AUTH */}
          {activeSection === 'pull_hub' && (
            <>
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/70 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                    <Layers className="w-3.5 h-3.5" />
                    Universal Multi-Source Pull Engine
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Pull Everything Into OmniSync Hub
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Simultaneously pulls all repositories &amp; issues from{' '}
                    <span className="text-indigo-300 font-mono font-semibold">
                      @{githubUser?.login || 'grogusmom1989'}
                    </span>
                    , indexes your Google Drive files, restores Firestore Cloud Database records, and auto-imports projects into your Portfolio.
                  </p>
                </div>

                <button
                  onClick={onPullEverything}
                  disabled={isSyncing}
                  className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Pulling Everything...' : 'Pull Everything Now'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'GitHub Repos', value: stats.reposCount, color: 'text-indigo-400' },
                  { label: 'Drive Files', value: stats.driveCount, color: 'text-emerald-400' },
                  { label: 'Portfolio Projects', value: stats.projectsCount, color: 'text-cyan-400' },
                  { label: 'Action Tasks', value: stats.tasksCount, color: 'text-amber-400' },
                  { label: 'Synced Notes', value: stats.notesCount, color: 'text-purple-400' },
                  { label: 'Active Bridges', value: stats.bridgesCount, color: 'text-pink-400' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-center"
                  >
                    <div className={`text-xl font-black font-mono ${item.color}`}>
                      {item.value}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Stay Signed In (Hub Lock)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      browserLocalPersistence
                    </span>
                  </div>
                  {googleUser ? (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                      <div className="truncate">
                        <div className="text-xs font-semibold text-emerald-300 truncate">
                          {googleUser.displayName || 'Creator Signed In'}
                        </div>
                        <div className="text-[11px] text-emerald-400/80 font-mono truncate">
                          {googleUser.email}
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  ) : (
                    <button
                      onClick={onGoogleSignIn}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      Sign In &amp; Lock Persistent Session
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-indigo-400" />
                      GitHub Auto-Pull Target
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      Active
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-indigo-300">
                        @{githubUser?.login || 'grogusmom1989'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {stats.reposCount} repositories synced
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      Firestore Cloud Vault
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      Zero-Trust Rules
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                    <div className="truncate">
                      <div className="text-xs font-semibold text-cyan-300">Cloud Sync Ready</div>
                      <div className="text-[11px] text-slate-400 truncate font-mono">
                        /users/{googleUser?.uid ? googleUser.uid.slice(0, 10) + '...' : 'grogusmom1989'}
                      </div>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
