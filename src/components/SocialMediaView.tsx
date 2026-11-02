import React, { useState, useEffect } from 'react';
import {
  Share2,
  Send,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Film,
  Smartphone,
  Globe,
  Layers,
  Clock,
  Plus,
  Trash2,
  Copy,
  Radio,
  Search,
  ShoppingBag,
  Download,
  Bookmark,
  Grid,
  Compass,
  Rocket,
  Code2,
  Crown,
  Play,
  FolderGit2,
} from 'lucide-react';
import {
  AppTab,
  SocialAccount,
  SocialPost,
  SocialPlatformId,
  GoogleDriveFile,
  GitHubRepo,
  WorkspaceProject,
  WorkspaceTask,
  WorkspaceNote,
} from '../types';

export interface AppStoreShortcut {
  id: string;
  name: string;
  category:
    | 'Meta Muse (My Apps)'
    | 'Meta & Social'
    | 'Creator & Video'
    | 'Google & Cloud'
    | 'Finance & Pay'
    | 'AI & Dev'
    | 'Custom';
  packageName: string;
  webUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
  badgeColor: string;
  description: string;
  internalTab?: AppTab;
}

export interface CreatorStoreApp {
  id: string;
  name: string;
  tagline: string;
  packageName: string;
  version: string;
  category: string;
  status: 'Live in Meta Muse' | 'Google Play Ready (.aab)' | 'In Active Creation';
  internalTab?: AppTab;
  externalUrl?: string;
  repoUrl?: string;
  accentGradient: string;
  badgeText: string;
}

const BUILTIN_META_MUSE_APPS: CreatorStoreApp[] = [
  {
    id: 'muse-app-metamuse',
    name: 'Meta Muse — Creator App Store & Social OS',
    tagline:
      'Flagship Meta ecosystem command center, universal App Store launcher, and cross-platform social syndication studio.',
    packageName: 'app.metamuse.store',
    version: 'v3.2.0',
    category: 'Meta Muse Flagship',
    status: 'Live in Meta Muse',
    internalTab: 'social',
    externalUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=social',
    repoUrl: 'https://github.com/grogusmom1989',
    accentGradient: 'from-fuchsia-600/30 via-purple-600/20 to-indigo-600/20 border-fuchsia-500/40',
    badgeText: 'Meta Muse Flagship',
  },
  {
    id: 'muse-app-omnisync',
    name: 'OmniSync Workspace & Cloud Hub',
    tagline:
      'Autonomous background sync daemon uniting Google Drive, GitHub, Firestore Cloud, offline Outbox, and conflict resolution.',
    packageName: 'app.omnisync.hub',
    version: 'v2.8.0',
    category: 'Cloud & Productivity',
    status: 'Google Play Ready (.aab)',
    internalTab: 'overview',
    externalUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app',
    repoUrl: 'https://github.com/grogusmom1989',
    accentGradient: 'from-indigo-600/30 via-blue-600/20 to-cyan-600/20 border-indigo-500/40',
    badgeText: 'Core Hub APK/AAB',
  },
  {
    id: 'muse-app-1dworld',
    name: '1D World & Quantum Reiki HQ (528Hz)',
    tagline:
      'Interactive 528Hz Miracle Tone frequency synthesizer, meridian alignment studio, and distance Reiki healing sanctuary.',
    packageName: 'app.metamuse.onedworld',
    version: 'v2.4.0',
    category: 'Sound Healing & Reiki',
    status: 'Live in Meta Muse',
    internalTab: 'one_d_world',
    externalUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=one_d_world',
    repoUrl: 'https://github.com/grogusmom1989',
    accentGradient: 'from-cyan-600/30 via-teal-600/20 to-emerald-600/20 border-cyan-500/40',
    badgeText: '528Hz Audio Engine',
  },
  {
    id: 'muse-app-kikisworld',
    name: "Kiki's World 2.0 — Oracle, Crystal Grid & Cinema",
    tagline:
      'Daily Divine Oracle card deck, sacred geometry crystal grid generator, and audio-reactive cinema visualizer.',
    packageName: 'app.metamuse.kikisworld',
    version: 'v2.0.5',
    category: 'Spiritual & Media',
    status: 'Live in Meta Muse',
    internalTab: 'kikis_world',
    externalUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=kikis_world',
    repoUrl: 'https://github.com/grogusmom1989',
    accentGradient: 'from-purple-600/30 via-pink-600/20 to-rose-600/20 border-purple-500/40',
    badgeText: 'Oracle & Cinema',
  },
  {
    id: 'muse-app-kikios',
    name: 'KikiOS Cyber-Deck Spatial Desktop',
    tagline:
      'Full-screen multi-window cyber-deck operating system with polyphonic frequency synth, terminal, and file explorer.',
    packageName: 'app.metamuse.kikios',
    version: 'v1.9.0',
    category: 'Spatial OS',
    status: 'Live in Meta Muse',
    internalTab: 'kikios',
    externalUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=kikios',
    repoUrl: 'https://github.com/grogusmom1989',
    accentGradient: 'from-amber-600/30 via-orange-600/20 to-rose-600/20 border-amber-500/40',
    badgeText: 'Desktop OS',
  },
  {
    id: 'muse-app-remix',
    name: 'Remixed App Studio & APK Builder',
    tagline:
      'Rapid app prototyping workbench, custom manifest generator, and 1-click Android Bubblewrap TWA builder.',
    packageName: 'app.metamuse.remixstudio',
    version: 'v1.7.2',
    category: 'Creator Tools & Dev',
    status: 'Google Play Ready (.aab)',
    internalTab: 'remix',
    externalUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=remix',
    repoUrl: 'https://github.com/grogusmom1989',
    accentGradient: 'from-emerald-600/30 via-teal-600/20 to-cyan-600/20 border-emerald-500/40',
    badgeText: 'App Builder',
  },
  {
    id: 'muse-app-earnings',
    name: 'Meta Muse Creator Earnings & PayPal Hub',
    tagline:
      'Direct creator payouts, Reiki session bookings, digital oracle deck sales, and @grogusmom1989 PayPal ledger.',
    packageName: 'app.metamuse.earnings',
    version: 'v2.1.0',
    category: 'Creator Economy',
    status: 'Live in Meta Muse',
    internalTab: 'earnings',
    externalUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=earnings',
    repoUrl: 'https://github.com/grogusmom1989',
    accentGradient: 'from-blue-600/30 via-indigo-600/20 to-emerald-600/20 border-blue-500/40',
    badgeText: 'Monetization',
  },
  {
    id: 'muse-app-ai',
    name: 'Meta Muse AI Copilot & Briefing Studio',
    tagline:
      'Executive workspace synthesizer for your Drive documents, GitHub issues, social captions, and creator roadmaps.',
    packageName: 'app.metamuse.aicopilot',
    version: 'v2.3.0',
    category: 'AI & Automation',
    status: 'Live in Meta Muse',
    internalTab: 'ai',
    externalUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=ai',
    repoUrl: 'https://github.com/grogusmom1989',
    accentGradient: 'from-violet-600/30 via-purple-600/20 to-fuchsia-600/20 border-violet-500/40',
    badgeText: 'AI Copilot',
  },
];

const MAJOR_APP_STORES = [
  {
    id: 'meta-muse-store',
    name: 'Meta Muse App Store (My Apps)',
    subtitle: 'All @grogusmom1989 Apps & Creations in One Store',
    url: '#meta-muse-creator-store',
    searchUrl: (q: string) => `https://github.com/grogusmom1989?tab=repositories&q=${encodeURIComponent(q)}`,
    accent: 'from-fuchsia-500/30 via-purple-500/20 to-pink-500/15 border-fuchsia-400/50 text-fuchsia-200',
    badge: 'My App Store',
    isInternalAnchor: true,
  },
  {
    id: 'google-play',
    name: 'Google Play Store',
    subtitle: 'Android, ChromeOS & Play Pass Apps',
    url: 'https://play.google.com/store/apps',
    searchUrl: (q: string) => `https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps`,
    accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
    badge: 'Google Play',
    isInternalAnchor: false,
  },
  {
    id: 'apple-app-store',
    name: 'Apple App Store',
    subtitle: 'iPhone, iPad & Mac Universal Apps',
    url: 'https://www.apple.com/app-store/',
    searchUrl: (q: string) => `https://www.google.com/search?q=${encodeURIComponent('site:apps.apple.com ' + q)}`,
    accent: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-300',
    badge: 'iOS / macOS',
    isInternalAnchor: false,
  },
  {
    id: 'meta-quest-store',
    name: 'Meta Horizon / Quest Store',
    subtitle: 'Meta Ecosystem, VR & Spatial Apps',
    url: 'https://www.meta.com/experiences/',
    searchUrl: (q: string) => `https://www.meta.com/experiences/search/?q=${encodeURIComponent(q)}`,
    accent: 'from-indigo-500/20 to-cyan-500/10 border-indigo-500/40 text-indigo-300',
    badge: 'Meta Store',
    isInternalAnchor: false,
  },
  {
    id: 'samsung-galaxy-store',
    name: 'Samsung Galaxy Store',
    subtitle: 'Galaxy Exclusives & Android Apps',
    url: 'https://galaxystore.samsung.com/games',
    searchUrl: (q: string) => `https://www.google.com/search?q=${encodeURIComponent('Samsung Galaxy Store ' + q)}`,
    accent: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-300',
    badge: 'Galaxy Store',
    isInternalAnchor: false,
  },
  {
    id: 'amazon-appstore',
    name: 'Amazon Appstore',
    subtitle: 'Android, Fire OS & Windows 11',
    url: 'https://www.amazon.com/gp/mas/get/android',
    searchUrl: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&i=mobile-apps`,
    accent: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
    badge: 'Amazon',
    isInternalAnchor: false,
  },
  {
    id: 'microsoft-store',
    name: 'Microsoft Store',
    subtitle: 'Windows PC, Web & Mobile Bridges',
    url: 'https://apps.microsoft.com/home',
    searchUrl: (q: string) => `https://apps.microsoft.com/search?query=${encodeURIComponent(q)}`,
    accent: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300',
    badge: 'Windows',
    isInternalAnchor: false,
  },
  {
    id: 'f-droid',
    name: 'F-Droid & APKMirror',
    subtitle: 'Direct Android APK & Open Repositories',
    url: 'https://www.apkmirror.com/',
    searchUrl: (q: string) =>
      `https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s=${encodeURIComponent(q)}`,
    accent: 'from-rose-500/20 to-orange-500/10 border-rose-500/40 text-rose-300',
    badge: 'Direct APK',
    isInternalAnchor: false,
  },
];

const DEFAULT_APP_SHORTCUTS: AppStoreShortcut[] = [
  // Flagship Meta Muse (My Apps) Shortcuts
  {
    id: 'app-metamuse-hub',
    name: 'Meta Muse Creator Store',
    category: 'Meta Muse (My Apps)',
    packageName: 'app.metamuse.store',
    webUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=social',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=app.metamuse.store',
    appStoreUrl: 'https://github.com/grogusmom1989',
    badgeColor: 'text-fuchsia-300 border-fuchsia-500/40 bg-fuchsia-500/15',
    description: 'Your personal Meta Muse App Store & Social Command Hub (@grogusmom1989)',
    internalTab: 'social',
  },
  {
    id: 'app-metamuse-oned',
    name: '1D World & Reiki HQ (528Hz)',
    category: 'Meta Muse (My Apps)',
    packageName: 'app.metamuse.onedworld',
    webUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=one_d_world',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=app.metamuse.onedworld',
    appStoreUrl: 'https://github.com/grogusmom1989',
    badgeColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/15',
    description: '528Hz Miracle Tone Synthesizer, Quantum Reiki & Meridian Alignment',
    internalTab: 'one_d_world',
  },
  {
    id: 'app-metamuse-kiki',
    name: "Kiki's World 2.0 (Oracle & Cinema)",
    category: 'Meta Muse (My Apps)',
    packageName: 'app.metamuse.kikisworld',
    webUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=kikis_world',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=app.metamuse.kikisworld',
    appStoreUrl: 'https://github.com/grogusmom1989',
    badgeColor: 'text-purple-300 border-purple-500/40 bg-purple-500/15',
    description: 'Daily Divine Oracle Deck, Sacred Crystal Grid & Audio-Reactive Cinema',
    internalTab: 'kikis_world',
  },
  {
    id: 'app-metamuse-kikios',
    name: 'KikiOS Cyber-Deck OS',
    category: 'Meta Muse (My Apps)',
    packageName: 'app.metamuse.kikios',
    webUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=kikios',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=app.metamuse.kikios',
    appStoreUrl: 'https://github.com/grogusmom1989',
    badgeColor: 'text-amber-300 border-amber-500/40 bg-amber-500/15',
    description: 'Spatial multi-window desktop environment & frequency synth deck',
    internalTab: 'kikios',
  },
  {
    id: 'app-metamuse-remix',
    name: 'Remixed App Studio & APK Packager',
    category: 'Meta Muse (My Apps)',
    packageName: 'app.metamuse.remixstudio',
    webUrl: 'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app/?tab=remix',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=app.metamuse.remixstudio',
    appStoreUrl: 'https://github.com/grogusmom1989',
    badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15',
    description: 'Create, remix, and bundle your apps into Google Play .aab packages',
    internalTab: 'remix',
  },
  // Meta & Social Ecosystem
  {
    id: 'app-meta-suite',
    name: 'Meta Business Suite',
    category: 'Meta & Social',
    packageName: 'com.facebook.pages.app',
    webUrl: 'https://business.facebook.com/latest/home',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.facebook.pages.app',
    appStoreUrl: 'https://apps.apple.com/us/app/meta-business-suite/id654330298',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    description: 'Manage Facebook Pages, Instagram Reels, Ads & Insights',
  },
  {
    id: 'app-facebook',
    name: 'Meta Facebook',
    category: 'Meta & Social',
    packageName: 'com.facebook.katana',
    webUrl: 'https://www.facebook.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.facebook.katana',
    appStoreUrl: 'https://apps.apple.com/us/app/facebook/id284882215',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    description: 'Facebook Feed, Reels, Groups & Marketplace',
  },
  {
    id: 'app-instagram',
    name: 'Meta Instagram',
    category: 'Meta & Social',
    packageName: 'com.instagram.android',
    webUrl: 'https://www.instagram.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.instagram.android',
    appStoreUrl: 'https://apps.apple.com/us/app/instagram/id389801252',
    badgeColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    description: 'Instagram Reels, Stories, Creator Grid & DMs',
  },
  {
    id: 'app-threads',
    name: 'Meta Threads',
    category: 'Meta & Social',
    packageName: 'com.instagram.barcelona',
    webUrl: 'https://www.threads.net',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.instagram.barcelona',
    appStoreUrl: 'https://apps.apple.com/us/app/threads/id6446901002',
    badgeColor: 'text-slate-200 border-slate-500/30 bg-slate-500/10',
    description: 'Real-time microblogging & community threads',
  },
  {
    id: 'app-whatsapp',
    name: 'Meta WhatsApp',
    category: 'Meta & Social',
    packageName: 'com.whatsapp',
    webUrl: 'https://web.whatsapp.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.whatsapp',
    appStoreUrl: 'https://apps.apple.com/us/app/whatsapp-messenger/id310633997',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Encrypted broadcast channels & client messaging',
  },
  {
    id: 'app-messenger',
    name: 'Meta Messenger',
    category: 'Meta & Social',
    packageName: 'com.facebook.orca',
    webUrl: 'https://www.messenger.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.facebook.orca',
    appStoreUrl: 'https://apps.apple.com/us/app/messenger/id454638411',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    description: 'Cross-app Meta chat, voice & community rooms',
  },
  {
    id: 'app-meta-ai',
    name: 'Meta AI & Edits Studio',
    category: 'Meta & Social',
    packageName: 'com.facebook.view',
    webUrl: 'https://www.meta.ai',
    playStoreUrl: 'https://play.google.com/store/search?q=Meta+AI&c=apps',
    appStoreUrl: 'https://www.meta.ai',
    badgeColor: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
    description: 'Meta creative assistant, Reels ideation & visual muse',
  },
  {
    id: 'app-tiktok',
    name: 'TikTok',
    category: 'Meta & Social',
    packageName: 'com.zhiliaoapp.musically',
    webUrl: 'https://www.tiktok.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically',
    appStoreUrl: 'https://apps.apple.com/us/app/tiktok/id835599320',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    description: 'Short-form video feed, LIVE & TikTok Shop',
  },
  {
    id: 'app-youtube',
    name: 'YouTube',
    category: 'Creator & Video',
    packageName: 'com.google.android.youtube',
    webUrl: 'https://www.youtube.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.youtube',
    appStoreUrl: 'https://apps.apple.com/us/app/youtube-watch-listen-stream/id544007664',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    description: 'Videos, Shorts, 528Hz Sound Streams & Live',
  },
  {
    id: 'app-yt-studio',
    name: 'YouTube Studio',
    category: 'Creator & Video',
    packageName: 'com.google.android.apps.youtube.creator',
    webUrl: 'https://studio.youtube.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.youtube.creator',
    appStoreUrl: 'https://apps.apple.com/us/app/youtube-studio/id888530356',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    description: 'Creator monetization, analytics & video manager',
  },
  {
    id: 'app-capcut',
    name: 'CapCut Video Editor',
    category: 'Creator & Video',
    packageName: 'com.lemon.lvoverseas',
    webUrl: 'https://www.capcut.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.lemon.lvoverseas',
    appStoreUrl: 'https://apps.apple.com/us/app/capcut-video-editor/id1500855883',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    description: 'Reels & TikTok video editing, captions & templates',
  },
  {
    id: 'app-canva',
    name: 'Canva Design Studio',
    category: 'Creator & Video',
    packageName: 'com.canva.editor',
    webUrl: 'https://www.canva.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.canva.editor',
    appStoreUrl: 'https://apps.apple.com/us/app/canva-design-photo-video/id897446215',
    badgeColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    description: 'Social graphics, thumbnails & oracle card decks',
  },
  {
    id: 'app-spotify',
    name: 'Spotify for Podcasters & Music',
    category: 'Creator & Video',
    packageName: 'com.spotify.music',
    webUrl: 'https://open.spotify.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.spotify.music',
    appStoreUrl: 'https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Sound healing playlists, frequencies & podcasts',
  },
  {
    id: 'app-x-twitter',
    name: 'X (Twitter)',
    category: 'Meta & Social',
    packageName: 'com.twitter.android',
    webUrl: 'https://x.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.twitter.android',
    appStoreUrl: 'https://apps.apple.com/us/app/x/id333903271',
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    description: 'Real-time news, Spaces & build-in-public updates',
  },
  {
    id: 'app-discord',
    name: 'Discord',
    category: 'Meta & Social',
    packageName: 'com.discord',
    webUrl: 'https://discord.com/app',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.discord',
    appStoreUrl: 'https://apps.apple.com/us/app/discord-talk-play-hang-out/id985746746',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    description: 'Community servers, voice channels & webhooks',
  },
  {
    id: 'app-pinterest',
    name: 'Pinterest',
    category: 'Meta & Social',
    packageName: 'com.pinterest',
    webUrl: 'https://www.pinterest.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.pinterest',
    appStoreUrl: 'https://apps.apple.com/us/app/pinterest/id429047995',
    badgeColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    description: 'Visual moodboards, crystal grids & inspiration',
  },
  {
    id: 'app-snapchat',
    name: 'Snapchat',
    category: 'Meta & Social',
    packageName: 'com.snapchat.android',
    webUrl: 'https://web.snapchat.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.snapchat.android',
    appStoreUrl: 'https://apps.apple.com/us/app/snapchat/id447188370',
    badgeColor: 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10',
    description: 'AR Lenses, Spotlight & Stories',
  },
  {
    id: 'app-telegram',
    name: 'Telegram',
    category: 'Meta & Social',
    packageName: 'org.telegram.messenger',
    webUrl: 'https://web.telegram.org',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=org.telegram.messenger',
    appStoreUrl: 'https://apps.apple.com/us/app/telegram-messenger/id686449807',
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    description: 'Broadcast channels, bots & cloud groups',
  },
  {
    id: 'app-linkedin',
    name: 'LinkedIn',
    category: 'Meta & Social',
    packageName: 'com.linkedin.android',
    webUrl: 'https://www.linkedin.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.linkedin.android',
    appStoreUrl: 'https://apps.apple.com/us/app/linkedin-network-job-finder/id288429040',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    description: 'Professional portfolio & creator network',
  },
  {
    id: 'app-google-drive',
    name: 'Google Drive',
    category: 'Google & Cloud',
    packageName: 'com.google.android.apps.docs',
    webUrl: 'https://drive.google.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.docs',
    appStoreUrl: 'https://apps.apple.com/us/app/google-drive/id507874739',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Cloud storage synced directly with OmniSync Hub',
  },
  {
    id: 'app-google-photos',
    name: 'Google Photos',
    category: 'Google & Cloud',
    packageName: 'com.google.android.apps.photos',
    webUrl: 'https://photos.google.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.photos',
    appStoreUrl: 'https://apps.apple.com/us/app/google-photos/id962194608',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description: 'Cloud media library for Reels, Shorts & galleries',
  },
  {
    id: 'app-github',
    name: 'GitHub Mobile',
    category: 'AI & Dev',
    packageName: 'com.github.android',
    webUrl: 'https://github.com/grogusmom1989',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.github.android',
    appStoreUrl: 'https://apps.apple.com/us/app/github/id1477376905',
    badgeColor: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    description: 'Manage @grogusmom1989 repositories, PRs & issues',
  },
  {
    id: 'app-paypal',
    name: 'PayPal',
    category: 'Finance & Pay',
    packageName: 'com.paypal.android.p2pmobile',
    webUrl: 'https://www.paypal.com/myaccount/summary',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.paypal.android.p2pmobile',
    appStoreUrl: 'https://apps.apple.com/us/app/paypal-send-shop-manage/id283646709',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    description: 'Creator payouts, Reiki bookings & @grogusmom1989 tips',
  },
  {
    id: 'app-cashapp',
    name: 'Cash App',
    category: 'Finance & Pay',
    packageName: 'com.squareup.cash',
    webUrl: 'https://cash.app',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.squareup.cash',
    appStoreUrl: 'https://apps.apple.com/us/app/cash-app/id711923939',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Instant creator tips & mobile transfers',
  },
  {
    id: 'app-gemini',
    name: 'Google Gemini & AI Studio',
    category: 'AI & Dev',
    packageName: 'com.google.android.apps.bard',
    webUrl: 'https://gemini.google.com',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.bard',
    appStoreUrl: 'https://apps.apple.com/us/app/google-gemini/id6477489729',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    description: 'Multimodal AI assistant & workspace copilot',
  },
];

const CUSTOM_SHORTCUTS_STORAGE_KEY = 'omnisync_custom_appstore_shortcuts_v1';
const CUSTOM_META_MUSE_APPS_KEY = 'omnisync_metamuse_creator_apps_v1';

interface SocialMediaViewProps {
  accounts: SocialAccount[];
  onUpdateAccounts: (accounts: SocialAccount[]) => void;
  posts: SocialPost[];
  onAddPost: (post: Omit<SocialPost, 'id' | 'createdAt'>) => void;
  onDeletePost: (id: string) => void;
  driveFiles?: GoogleDriveFile[];
  githubRepos?: GitHubRepo[];
  projects?: WorkspaceProject[];
  onAddProject?: (proj: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddNote: (note: Omit<WorkspaceNote, 'id' | 'updatedAt'>) => void;
  onOpenPlayStore: () => void;
  onSyncSocialBackground: () => void;
  onSelectTab?: (tab: AppTab) => void;
  githubReposCount?: number;
  driveFilesCount?: number;
  projectsCount?: number;
  outboxCount?: number;
  isSyncing?: boolean;
}

export const SocialMediaView: React.FC<SocialMediaViewProps> = ({
  accounts,
  onUpdateAccounts,
  posts,
  onAddPost,
  onDeletePost,
  driveFiles = [],
  githubRepos = [],
  projects = [],
  onAddProject,
  onAddTask,
  onAddNote,
  onOpenPlayStore,
  onSyncSocialBackground,
  onSelectTab,
  isSyncing = false,
}) => {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformId[]>([
    'meta_facebook',
    'meta_instagram',
    'meta_threads',
    'tiktok',
    'youtube',
    'x_twitter',
  ]);
  const [selectedDriveFile, setSelectedDriveFile] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('Meta Muse App Store');
  const [tagsInput, setTagsInput] = useState('MetaMuse, Meta, Reels, OmniSync, CreatorStore');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingHandleId, setEditingHandleId] = useState<SocialPlatformId | null>(null);
  const [handleDraft, setHandleDraft] = useState('');

  // Meta Muse Personal Creator App Store State
  const [customCreatorApps, setCustomCreatorApps] = useState<CreatorStoreApp[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_META_MUSE_APPS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showPublishCreatorAppModal, setShowPublishCreatorAppModal] = useState(false);
  const [newCreatorAppName, setNewCreatorAppName] = useState('');
  const [newCreatorAppTagline, setNewCreatorAppTagline] = useState('');
  const [newCreatorAppCategory, setNewCreatorAppCategory] = useState('Meta Muse Creation');
  const [newCreatorAppUrl, setNewCreatorAppUrl] = useState('');
  const [creatorStoreFilter, setCreatorStoreFilter] = useState<'all' | 'flagship' | 'repos'>('all');

  // Universal Google Play & Every App Store Shortcut Dock State
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [selectedAppCategory, setSelectedAppCategory] = useState<string>('All');
  const [customShortcuts, setCustomShortcuts] = useState<AppStoreShortcut[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_SHORTCUTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutPackage, setNewShortcutPackage] = useState('');
  const [newShortcutWebUrl, setNewShortcutWebUrl] = useState('');
  const [showAddShortcutForm, setShowAddShortcutForm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_SHORTCUTS_STORAGE_KEY, JSON.stringify(customShortcuts));
    } catch {
      // ignore storage errors
    }
  }, [customShortcuts]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_META_MUSE_APPS_KEY, JSON.stringify(customCreatorApps));
    } catch {
      // ignore storage errors
    }
  }, [customCreatorApps]);

  // Dynamically merge all apps the user is creating (Built-In Flagships + Custom Published Apps + Projects + GitHub Repos)
  const dynamicProjectApps: CreatorStoreApp[] = projects
    .filter(
      (p) =>
        !BUILTIN_META_MUSE_APPS.some(
          (b) => b.name.toLowerCase().includes(p.name.toLowerCase())
        )
    )
    .map((p) => {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'creatorapp';
      return {
        id: `proj-app-${p.id}`,
        name: p.name,
        tagline: p.description || `Created in Meta Muse & synced via ${p.source.toUpperCase()}`,
        packageName: `app.metamuse.${slug.slice(0, 20)}`,
        version: p.version ? `v${p.version.replace(/^v/, '')}` : 'v1.0.0',
        category: p.tags?.[0] || 'Creator App',
        status: p.status === 'deployed' || p.status === 'active' ? 'Live in Meta Muse' : 'In Active Creation',
        externalUrl: p.previewUrl || p.url || p.driveViewUrl || 'https://github.com/grogusmom1989',
        repoUrl: p.url,
        accentGradient: 'from-indigo-600/25 via-purple-600/15 to-pink-600/15 border-indigo-500/35',
        badgeText: p.language || 'My Creation',
      };
    });

  const dynamicRepoApps: CreatorStoreApp[] = githubRepos
    .filter(
      (r) =>
        !dynamicProjectApps.some(
          (p) => p.name.toLowerCase() === r.name.toLowerCase()
        )
    )
    .slice(0, 12)
    .map((r) => {
      const slug = r.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'repo';
      return {
        id: `repo-app-${r.id}`,
        name: r.name,
        tagline: r.description || `GitHub repository (${r.full_name}) packaged in Meta Muse Store`,
        packageName: `app.metamuse.${slug.slice(0, 20)}`,
        version: 'v1.0-git',
        category: r.language || 'GitHub App',
        status: 'In Active Creation',
        externalUrl: r.html_url,
        repoUrl: r.html_url,
        accentGradient: 'from-violet-600/25 via-indigo-600/15 to-slate-800/40 border-violet-500/35',
        badgeText: r.language || 'GitHub Repo',
      };
    });

  const allMetaMuseCreatorApps: CreatorStoreApp[] = [
    ...customCreatorApps,
    ...BUILTIN_META_MUSE_APPS,
    ...dynamicProjectApps,
    ...dynamicRepoApps,
  ];

  const displayedMetaMuseApps = allMetaMuseCreatorApps.filter((app) => {
    if (creatorStoreFilter === 'flagship') {
      return app.id.startsWith('muse-app-') || app.id.startsWith('custom-muse-');
    }
    if (creatorStoreFilter === 'repos') {
      return app.id.startsWith('proj-app-') || app.id.startsWith('repo-app-');
    }
    return true;
  });

  const handlePublishNewCreatorApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreatorAppName.trim()) return;

    const cleanName = newCreatorAppName.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'newapp';
    const pkg = `app.metamuse.${slug.slice(0, 22)}`;
    const launchUrl =
      newCreatorAppUrl.trim() ||
      'https://ais-pre-kbnunw7227i4imww2q3pcc-139265478135.us-west2.run.app';

    const newApp: CreatorStoreApp = {
      id: `custom-muse-${Date.now()}`,
      name: cleanName,
      tagline:
        newCreatorAppTagline.trim() ||
        `Original creator app published to Meta Muse App Store (${pkg}).`,
      packageName: pkg,
      version: 'v1.0.0',
      category: newCreatorAppCategory.trim() || 'Meta Muse Creation',
      status: 'Live in Meta Muse',
      externalUrl: launchUrl,
      repoUrl: 'https://github.com/grogusmom1989',
      accentGradient: 'from-fuchsia-600/30 via-pink-600/20 to-indigo-600/20 border-fuchsia-400/50',
      badgeText: 'Meta Muse Original',
    };

    setCustomCreatorApps((prev) => [newApp, ...prev]);

    // Also pin into the universal shortcut matrix
    const shortcut: AppStoreShortcut = {
      id: `custom-app-${Date.now()}`,
      name: cleanName,
      category: 'Meta Muse (My Apps)',
      packageName: pkg,
      webUrl: launchUrl,
      playStoreUrl: `https://play.google.com/store/search?q=${encodeURIComponent(cleanName)}&c=apps`,
      appStoreUrl: 'https://github.com/grogusmom1989',
      badgeColor: 'text-fuchsia-300 border-fuchsia-500/40 bg-fuchsia-500/15',
      description: newApp.tagline,
    };
    setCustomShortcuts((prev) => [shortcut, ...prev]);

    // Also register in Workspace Projects so it syncs to Firestore in the background
    if (onAddProject) {
      onAddProject({
        name: cleanName,
        description: newApp.tagline,
        status: 'deployed',
        source: 'custom',
        url: launchUrl,
        previewUrl: launchUrl,
        tags: ['MetaMuse', 'MyAppStore', 'GooglePlayReady'],
        techStack: ['React', 'TypeScript', 'Meta Muse SDK'],
        isPinned: true,
        version: '1.0.0',
      });
    }

    setNewCreatorAppName('');
    setNewCreatorAppTagline('');
    setNewCreatorAppUrl('');
    setShowPublishCreatorAppModal(false);
  };

  const handleShareCreatorAppToMeta = (app: CreatorStoreApp) => {
    const shareTitle = `New on Meta Muse App Store: ${app.name} (${app.version})`;
    const shareBody = `🚀 Just published "${app.name}" (${app.packageName}) in my Meta Muse Creator App Store! ${app.tagline} ✨ Available now with background cloud sync & Google Play readiness.`;
    setPostTitle(shareTitle);
    setPostContent(shareBody);
    setSelectedProject(app.name);
    setTagsInput('MetaMuse, MyAppStore, BuildInPublic, MetaReels, GooglePlay');

    onAddPost({
      title: shareTitle,
      content: shareBody,
      platforms: selectedPlatforms,
      linkedProjectName: app.name,
      sourceModule: 'social',
      status: navigator.onLine ? 'published' : 'queued_background',
      autoSyncBackground: true,
      tags: ['MetaMuse', 'CreatorAppStore', 'GooglePlay', 'Meta'],
    });
  };

  const allAppShortcuts = [...customShortcuts, ...DEFAULT_APP_SHORTCUTS];

  const filteredAppShortcuts = allAppShortcuts.filter((app) => {
    const matchesCat =
      selectedAppCategory === 'All' || app.category === selectedAppCategory;
    const q = storeSearchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.packageName.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleAddCustomShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newShortcutName.trim() || storeSearchQuery.trim();
    if (!name) return;

    const pkg =
      newShortcutPackage.trim() ||
      `com.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.app`;
    const web =
      newShortcutWebUrl.trim() ||
      `https://www.google.com/search?q=${encodeURIComponent(name)}`;

    const shortcut: AppStoreShortcut = {
      id: `custom-app-${Date.now()}`,
      name,
      category: 'Custom',
      packageName: pkg,
      webUrl: web.startsWith('http') ? web : `https://${web}`,
      playStoreUrl: newShortcutPackage.trim()
        ? `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}`
        : `https://play.google.com/store/search?q=${encodeURIComponent(name)}&c=apps`,
      appStoreUrl: `https://www.google.com/search?q=${encodeURIComponent('site:apps.apple.com ' + name)}`,
      badgeColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/15',
      description: `Pinned shortcut across Google Play, App Store & Web (${pkg})`,
    };

    setCustomShortcuts((prev) => [shortcut, ...prev]);
    setNewShortcutName('');
    setNewShortcutPackage('');
    setNewShortcutWebUrl('');
    setShowAddShortcutForm(false);
  };

  const handleRemoveCustomShortcut = (id: string) => {
    setCustomShortcuts((prev) => prev.filter((item) => item.id !== id));
  };

  const togglePlatformSelection = (id: SocialPlatformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAllMeta = () => {
    setSelectedPlatforms(['meta_facebook', 'meta_instagram', 'meta_threads', 'meta_whatsapp']);
  };

  const selectEveryPlatform = () => {
    setSelectedPlatforms(accounts.map((a) => a.id));
  };

  const handleBroadcastPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || selectedPlatforms.length === 0) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const computedTitle =
      postTitle.trim() ||
      `${selectedProject || 'Meta Muse'} Broadcast — ${postContent.trim().slice(0, 42)}`;

    onAddPost({
      title: computedTitle,
      content: postContent.trim(),
      platforms: selectedPlatforms,
      mediaFileName: selectedDriveFile || undefined,
      linkedProjectName: selectedProject || undefined,
      sourceModule: 'social',
      status: navigator.onLine ? 'published' : 'queued_background',
      autoSyncBackground: true,
      tags,
    });

    setPostTitle('');
    setPostContent('');
  };

  const applyTemplate = (templateType: 'metamuse' | 'reiki' | 'kiki' | 'github' | 'paypal') => {
    if (templateType === 'metamuse') {
      setPostTitle('Meta Muse App Store — All My Creator Apps Live in One Place');
      setPostContent(
        '🌟 Welcome to Meta Muse! Explore my personal Creator App Store featuring OmniSync Hub, 1D World & 528Hz Reiki HQ, Kiki’s World 2.0, KikiOS, and universal shortcuts to every Google Play & App Store app!'
      );
      setSelectedProject('Meta Muse App Store');
      setTagsInput('MetaMuse, CreatorAppStore, MetaReels, GooglePlay, BuildInPublic');
    } else if (templateType === 'reiki') {
      setPostTitle('528Hz Miracle Tone & Quantum Reiki Drop');
      setPostContent(
        '✨ 528Hz Miracle Tone & Quantum Reiki Alignment session is live through Meta Muse! Tune your meridian field and experience cellular harmony in 1D World & Reiki HQ.'
      );
      setSelectedProject('1D World & Reiki HQ');
      setTagsInput('MetaMuse, Reiki, 528Hz, SoundHealing, MetaReels');
    } else if (templateType === 'kiki') {
      setPostTitle("Kiki's World 2.0 — Daily Divine Oracle & Crystal Grid");
      setPostContent(
        "🔮 New Daily Divine Oracle Card & Crystal Grid activation inside Kiki's World 2.0 on Meta Muse! Watch the audio-reactive cinema stream now."
      );
      setSelectedProject("Kiki's World 2.0");
      setTagsInput('MetaMuse, KikisWorld, CrystalHealing, OracleDeck, InstagramReels');
    } else if (templateType === 'github') {
      setPostTitle('Meta Muse & OmniSync Release — Play Store App & Background Daemon');
      setPostContent(
        '🚀 Shipped a new update to Meta Muse & OmniSync Hub (@grogusmom1989) with continuous background cloud sync, my own Creator App Store, and Google Play Store TWA packaging!'
      );
      setSelectedProject('OmniSync Hub');
      setTagsInput('MetaMuse, GitHub, BuildInPublic, React, GooglePlay');
    } else {
      setPostTitle('Support Meta Muse Creator Studio & Reiki Healing Sessions');
      setPostContent(
        '💖 Support our Meta Muse apps, Reiki sessions, sound healing instruments, and open-source creator tools directly via PayPal (@grogusmom1989)!'
      );
      setSelectedProject('Creator Earnings & PayPal Hub');
      setTagsInput('MetaMuse, CreatorEconomy, PayPal, SupportCreators, Meta');
    }
  };

  const toggleAccountBackgroundSync = (id: SocialPlatformId) => {
    const updated = accounts.map((acc) =>
      acc.id === id
        ? {
            ...acc,
            autoSyncBackground: !acc.autoSyncBackground,
            lastSyncedAt: new Date().toISOString(),
          }
        : acc
    );
    onUpdateAccounts(updated);
  };

  const saveAccountHandle = (id: SocialPlatformId) => {
    if (!handleDraft.trim()) {
      setEditingHandleId(null);
      return;
    }
    const updated = accounts.map((acc) =>
      acc.id === id
        ? { ...acc, handle: handleDraft.trim(), lastSyncedAt: new Date().toISOString() }
        : acc
    );
    onUpdateAccounts(updated);
    setEditingHandleId(null);
  };

  const copyCaption = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner — Meta Muse: Personal Creator App Store + Universal Social Command App */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-fuchsia-950/90 via-indigo-950/90 to-blue-950/90 border border-fuchsia-500/35 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/35 text-fuchsia-200 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Meta Muse • My Own Creator App Store + Every App Store &amp; Social Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Meta Muse: My Creator App Store, Meta &amp; Universal App Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
            Powered through <strong className="text-fuchsia-300">Meta Muse</strong> — featuring{' '}
            <strong className="text-white">
              your own personal Creator App Store ({allMetaMuseCreatorApps.length} apps you&apos;re creating)
            </strong>{' '}
            right alongside instant shortcuts to{' '}
            <strong className="text-emerald-300">
              Google Play Store, Apple App Store, Meta Horizon Store, Samsung Galaxy Store, Amazon Appstore, Meta (Facebook, Instagram, Threads, WhatsApp), TikTok, YouTube &amp; 30+ apps
            </strong>{' '}
            with continuous background sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowPublishCreatorAppModal((prev) => !prev)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publish App to Meta Muse</span>
          </button>

          <button
            onClick={onSyncSocialBackground}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Meta Muse...' : 'Sync Meta & Apps'}</span>
          </button>

          <button
            onClick={onOpenPlayStore}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Google Play (.aab) Packager</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: META MUSE — MY OWN CREATOR APP STORE (ALL APPS I'M CREATING) */}
      <div
        id="meta-muse-creator-store"
        className="bg-gradient-to-b from-slate-900 via-indigo-950/35 to-slate-900 border border-fuchsia-500/35 rounded-2xl p-5 space-y-5 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/90 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-fuchsia-400">
              <Rocket className="w-3.5 h-3.5" />
              <span>Meta Muse Official Storefront • @grogusmom1989 Creator Ecosystem</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>My Own App Store — Apps I&apos;m Creating Through Meta Muse</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-200">
                {allMetaMuseCreatorApps.length} Apps
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Every app, spiritual studio, spatial OS, and GitHub project you are building — launch directly in-app, package as an Android Google Play bundle (`.aab`), or broadcast to Meta &amp; Socials in one click.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `All My Apps (${allMetaMuseCreatorApps.length})` },
              {
                id: 'flagship',
                label: `Flagship Suite (${BUILTIN_META_MUSE_APPS.length + customCreatorApps.length})`,
              },
              {
                id: 'repos',
                label: `Synced Projects & Repos (${dynamicProjectApps.length + dynamicRepoApps.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCreatorStoreFilter(tab.id as 'all' | 'flagship' | 'repos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  creatorStoreFilter === tab.id
                    ? 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-200 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowPublishCreatorAppModal((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add My New App</span>
            </button>
          </div>
        </div>

        {/* Publish New Creator App Form */}
        {showPublishCreatorAppModal && (
          <form
            onSubmit={handlePublishNewCreatorApp}
            className="p-4 rounded-xl bg-slate-950 border border-fuchsia-500/50 space-y-3 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fuchsia-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Publish a New App You&apos;re Creating to Your Meta Muse App Store</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPublishCreatorAppModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">App Title *</label>
                <input
                  type="text"
                  required
                  value={newCreatorAppName}
                  onChange={(e) => setNewCreatorAppName(e.target.value)}
                  placeholder="e.g. Meta Muse Tarot & Sound Studio"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-fuchsia-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={newCreatorAppCategory}
                  onChange={(e) => setNewCreatorAppCategory(e.target.value)}
                  placeholder="e.g. Spiritual & Audio, AI Tool, Social"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-fuchsia-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description / Tagline</label>
                <input
                  type="text"
                  value={newCreatorAppTagline}
                  onChange={(e) => setNewCreatorAppTagline(e.target.value)}
                  placeholder="What does this app do?"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-fuchsia-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Live App / Repo URL (Optional)</label>
                <input
                  type="text"
                  value={newCreatorAppUrl}
                  onChange={(e) => setNewCreatorAppUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Publish to Meta Muse Store &amp; Sync in Background</span>
              </button>
            </div>
          </form>
        )}

        {/* Grid of All Apps in the User's Meta Muse Creator App Store */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {displayedMetaMuseApps.map((app) => (
            <div
              key={app.id}
              className={`p-4 rounded-xl bg-gradient-to-br ${app.accentGradient} border flex flex-col justify-between gap-3.5 transition-all hover:scale-[1.01] shadow-md`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/80 text-fuchsia-300 border border-white/10">
                    {app.badgeText}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {app.version}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white leading-snug">{app.name}</h3>
                  <div className="text-[10px] font-mono text-slate-300/80 mt-0.5">
                    {app.packageName}
                  </div>
                </div>

                <p className="text-xs text-slate-200/90 line-clamp-2 leading-relaxed">
                  {app.tagline}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-medium">{app.category}</span>
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {app.internalTab && onSelectTab ? (
                    <button
                      type="button"
                      onClick={() => onSelectTab(app.internalTab!)}
                      className="px-2 py-1.5 rounded-lg bg-white text-slate-950 hover:bg-fuchsia-100 text-[10px] font-extrabold flex items-center justify-center gap-1 shadow-sm transition-colors"
                      title={`Open ${app.name} inside suite`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Open App</span>
                    </button>
                  ) : (
                    <a
                      href={app.externalUrl || 'https://github.com/grogusmom1989'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1.5 rounded-lg bg-white text-slate-950 hover:bg-fuchsia-100 text-[10px] font-extrabold flex items-center justify-center gap-1 shadow-sm transition-colors"
                    >
                      <span>Launch</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={onOpenPlayStore}
                    className="px-2 py-1.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    title="Package this app for Google Play Store (.aab)"
                  >
                    <Download className="w-2.5 h-2.5" />
                    <span>Play .AAB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareCreatorAppToMeta(app)}
                    className="px-2 py-1.5 rounded-lg bg-fuchsia-500/25 hover:bg-fuchsia-500/40 border border-fuchsia-400/40 text-fuchsia-100 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    title="Promote this app across Meta & Social Media"
                  >
                    <Share2 className="w-2.5 h-2.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom quick link to Full Projects & Remixed App Studio */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-fuchsia-400" />
            <span>
              All apps created in <strong>Remixed App Studio</strong> or imported into{' '}
              <strong>My Projects</strong> automatically appear in your Meta Muse App Store.
            </span>
          </div>
          {onSelectTab && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectTab('remix')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-fuchsia-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Open Remixed App Studio</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('projects')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Manage All Projects ({projects.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: UNIVERSAL GOOGLE PLAY & EVERY APP STORE SHORTCUT DOCK */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Universal App Store Launcher • Meta Muse + Google Play + Every App Store</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Google Play &amp; All App Stores Shortcut Matrix ({allAppShortcuts.length} App Shortcuts + 8 App Stores)
            </h2>
            <p className="text-xs text-slate-400">
              Instant 1-click shortcuts to your own Meta Muse App Store, Google Play Store, Apple App Store, Meta Horizon Store, Galaxy Store, Amazon Appstore, and 30+ flagship apps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddShortcutForm((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pin Any Google Play / App Store Shortcut</span>
            </button>
          </div>
        </div>

        {/* 1. Every Major App Store Direct Shortcuts (Including Meta Muse Store at #1) */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Every App Store Direct Portal (Meta Muse Store, Google Play, Apple, Meta, Samsung, Amazon, Microsoft, APK)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MAJOR_APP_STORES.map((store) => (
              <div
                key={store.id}
                className={`p-3.5 rounded-xl bg-gradient-to-br ${store.accent} border flex flex-col justify-between gap-3 transition-all`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white">{store.name}</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950/70 text-slate-200 border border-white/10">
                      {store.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300/90">{store.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {store.isInternalAnchor ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAppCategory('Meta Muse (My Apps)');
                        document
                          .getElementById('meta-muse-creator-store')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Crown className="w-3 h-3" />
                      <span>Browse My Apps ({allMetaMuseCreatorApps.length})</span>
                    </button>
                  ) : (
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 text-white text-[11px] font-semibold flex items-center justify-center gap-1 border border-white/10 transition-colors"
                    >
                      <span>Open Store</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {storeSearchQuery.trim() && (
                    <a
                      href={store.searchUrl(storeSearchQuery.trim())}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title={`Search "${storeSearchQuery}" in ${store.name}`}
                    >
                      <Search className="w-3 h-3" />
                      <span>Search</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom App Shortcut Builder Modal/Drawer */}
        {showAddShortcutForm && (
          <form
            onSubmit={handleAddCustomShortcut}
            className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Add Any App from Google Play or Any App Store to Your Shortcut Dock</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddShortcutForm(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  App Name (e.g. Twitch, Lightroom, Roblox)
                </label>
                <input
                  type="text"
                  required
                  value={newShortcutName}
                  onChange={(e) => setNewShortcutName(e.target.value)}
                  placeholder="App Name..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Google Play Package ID (Optional)
                </label>
                <input
                  type="text"
                  value={newShortcutPackage}
                  onChange={(e) => setNewShortcutPackage(e.target.value)}
                  placeholder="e.g. tv.twitch.android.app"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Direct Web / App Launch URL (Optional)
                </label>
                <input
                  type="text"
                  value={newShortcutWebUrl}
                  onChange={(e) => setNewShortcutWebUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pin App Shortcut to Dock</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. Search & Filter Bar across Meta Muse + Google Play + All App Stores */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={storeSearchQuery}
              onChange={(e) => setStoreSearchQuery(e.target.value)}
              placeholder="Search Meta Muse apps, Google Play, or App Store (e.g. Meta Muse, 1D World, Instagram, CapCut, WhatsApp, TikTok)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>

          {storeSearchQuery.trim() && (
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://play.google.com/store/search?q=${encodeURIComponent(storeSearchQuery.trim())}&c=apps`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
              >
                <span>Search &ldquo;{storeSearchQuery.trim()}&rdquo; on Google Play</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent('site:apps.apple.com ' + storeSearchQuery.trim())}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5"
              >
                <span>Search on App Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            'All',
            'Meta Muse (My Apps)',
            'Meta & Social',
            'Creator & Video',
            'Google & Cloud',
            'Finance & Pay',
            'AI & Dev',
            'Custom',
          ].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedAppCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedAppCategory === cat
                  ? cat === 'Meta Muse (My Apps)'
                    ? 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-200'
                    : 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Grid of All Meta Muse, Google Play & App Store App Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredAppShortcuts.map((app) => (
            <div
              key={app.id}
              className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-3 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${app.badgeColor}`}>
                    {app.category}
                  </span>
                  {app.id.startsWith('custom-app-') ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomShortcut(app.id)}
                      className="text-slate-500 hover:text-rose-400"
                      title="Remove custom shortcut"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                      {app.packageName}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{app.name}</span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80">
                {app.internalTab && onSelectTab ? (
                  <button
                    type="button"
                    onClick={() => onSelectTab(app.internalTab!)}
                    className="px-2 py-1.5 rounded-lg bg-fuchsia-600/25 hover:bg-fuchsia-600/40 border border-fuchsia-500/40 text-fuchsia-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Open</span>
                  </button>
                ) : (
                  <a
                    href={app.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    title={`Launch ${app.name}`}
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}

                <a
                  href={app.playStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                  title={`Open ${app.name} in Google Play Store`}
                >
                  <Download className="w-2.5 h-2.5" />
                  <span>Google Play</span>
                </a>

                <a
                  href={app.appStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                  title={`Open ${app.name} in Apple App Store / Repo`}
                >
                  <span>App Store</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: META MUSE OMNI-CHANNEL BROADCAST COMPOSER & TEMPLATES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleBroadcastPost}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span>Meta Muse Cross-Platform Social Broadcast Composer</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Compose once through Meta Muse — syndicates in the background &amp; queues in your persistent Outbox if offline
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={selectAllMeta}
                className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-colors"
              >
                Meta Only
              </button>
              <button
                type="button"
                onClick={selectEveryPlatform}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-colors"
              >
                All {accounts.length} Networks
              </button>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Meta Muse Templates:</span>
            {[
              { id: 'metamuse', label: 'Meta Muse Store Launch' },
              { id: 'reiki', label: '528Hz Reiki Drop' },
              { id: 'kiki', label: "Kiki's World Reel" },
              { id: 'github', label: 'GitHub / App Release' },
              { id: 'paypal', label: 'PayPal Creator Tip' },
            ].map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() =>
                  applyTemplate(tpl.id as 'metamuse' | 'reiki' | 'kiki' | 'github' | 'paypal')
                }
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition-colors"
              >
                {tpl.label}
              </button>
            ))}
          </div>

          {/* Target Platform Toggles */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Target Networks ({selectedPlatforms.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {accounts.map((acc) => {
                const active = selectedPlatforms.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => togglePlatformSelection(acc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-indigo-600/25 border-indigo-400 text-white shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        active ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                    <span>{acc.name.replace('Meta ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Caption / Post Textarea */}
          <div className="space-y-2.5">
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Meta Muse Broadcast Headline / Campaign Title (Optional)..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              placeholder="Write your Meta Muse announcement, Instagram Reel caption, Threads post, Facebook update, or YouTube/TikTok description..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Attach Drive Media & Project Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Attach Google Drive Media
              </label>
              <select
                value={selectedDriveFile}
                onChange={(e) => setSelectedDriveFile(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              >
                <option value="">No Drive media attached</option>
                {driveFiles.slice(0, 25).map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Link Meta Muse App / Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              >
                <option value="Meta Muse App Store">Meta Muse App Store</option>
                <option value="OmniSync Hub">OmniSync Hub</option>
                <option value="1D World & Reiki HQ">1D World &amp; Reiki HQ</option>
                <option value="Kiki's World 2.0">Kiki&apos;s World 2.0</option>
                <option value="KikiOS Cyber-Deck">KikiOS Cyber-Deck</option>
                <option value="Remixed App Studio">Remixed App Studio</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Hashtags / Topics</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Meta Muse Background Syndication Daemon &amp; Offline Outbox Active</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!postContent.trim()) return;
                  onAddNote({
                    title: `Meta Muse Draft: ${postTitle.trim() || postContent.slice(0, 36)}...`,
                    content: postContent,
                    tags: ['MetaMuse', 'SocialMedia', 'Meta', 'Draft'],
                    pinned: true,
                  });
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Save to Notes
              </button>

              <button
                type="submit"
                disabled={!postContent.trim() || selectedPlatforms.length === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-fuchsia-600/25 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Through Meta Muse</span>
              </button>
            </div>
          </div>
        </form>

        {/* Meta Business Suite & Quick Launchers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-fuchsia-400" />
              <span>Meta Muse &amp; Meta Creator Studios</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch Meta Business Suite, Meta AI, Instagram Reels Composer, Threads, or YouTube Studio while Meta Muse keeps your apps, captions, and Drive assets synced in the background.
            </p>

            <div className="space-y-2 pt-1">
              {[
                {
                  name: 'Meta Business Suite',
                  desc: 'Facebook Pages, IG Reels & Insights',
                  url: 'https://business.facebook.com/latest/home',
                  color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
                },
                {
                  name: 'Meta AI & Creative Muse',
                  desc: 'Visual prompts, Reels & Meta AI studio',
                  url: 'https://www.meta.ai',
                  color: 'text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-500/10',
                },
                {
                  name: 'Instagram Creator Studio',
                  desc: 'Reels, Stories & Grid Scheduler',
                  url: 'https://www.instagram.com',
                  color: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
                },
                {
                  name: 'Meta Threads Web Hub',
                  desc: 'Real-time community threads',
                  url: 'https://www.threads.net',
                  color: 'text-slate-200 border-slate-600 bg-slate-800/80',
                },
                {
                  name: 'YouTube Studio & Shorts',
                  desc: 'Channel analytics & video uploads',
                  url: 'https://studio.youtube.com',
                  color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
                },
              ].map((studio) => (
                <a
                  key={studio.name}
                  href={studio.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-white">
                      {studio.name}
                    </div>
                    <div className="text-[11px] text-slate-400">{studio.desc}</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${studio.color}`}
                  >
                    Launch <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/30 text-xs text-fuchsia-200 flex items-center justify-between">
            <span>Meta Muse Daemon:</span>
            <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active (24/7 Auto-Sync)
            </span>
          </div>
        </div>
      </div>

      {/* Connected Meta & Social Accounts Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Connected Meta &amp; Social Media Channels ({accounts.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              All channels are wired into the autonomous Meta Muse background sync loop and linked to your Creator App Store.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {acc.networkGroup}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                </div>
                <div className={`text-xs font-bold ${acc.accentColor}`}>{acc.name}</div>

                {editingHandleId === acc.id ? (
                  <div className="flex items-center gap-1 pt-1">
                    <input
                      type="text"
                      value={handleDraft}
                      onChange={(e) => setHandleDraft(e.target.value)}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                    <button
                      onClick={() => saveAccountHandle(acc.id)}
                      className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span className="truncate">{acc.handle}</span>
                    <button
                      onClick={() => {
                        setEditingHandleId(acc.id);
                        setHandleDraft(acc.handle);
                      }}
                      className="text-[10px] text-indigo-400 hover:underline font-sans"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acc.autoSyncBackground}
                    onChange={() => toggleAccountBackgroundSync(acc.id)}
                    className="w-3.5 h-3.5 accent-indigo-600 rounded"
                  />
                  <span>Bg Sync</span>
                </label>

                <a
                  href={acc.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Social Syndication Feed & Background Outbox Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-fuchsia-400" />
            <span>Meta Muse &amp; Social Syndication Stream ({posts.length})</span>
          </h3>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                      post.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {post.status === 'published' ? 'Synced & Published' : 'Queued in Background Outbox'}
                  </span>
                  {post.title && (
                    <span className="text-xs font-bold text-white">{post.title}</span>
                  )}
                  {post.linkedProjectName && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                      App: {post.linkedProjectName}
                    </span>
                  )}
                  {post.mediaFileName && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Film className="w-3 h-3" /> {post.mediaFileName}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

                <div className="flex flex-wrap items-center gap-1.5">
                  {post.platforms.map((pid) => {
                    const acc = accounts.find((a) => a.id === pid);
                    return (
                      <span
                        key={pid}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium"
                      >
                        {acc ? acc.name : pid}
                      </span>
                    );
                  })}
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-fuchsia-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyCaption(post.content, post.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === post.id ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={() =>
                    onAddTask({
                      title: `Follow up Meta Muse engagement on: "${post.content.slice(0, 38)}..."`,
                      description: `Respond to comments & DMs across ${post.platforms.join(', ')}`,
                      status: 'todo',
                      priority: 'medium',
                      source: 'manual',
                      tags: ['MetaMuse', 'SocialMedia', 'Meta'],
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Task</span>
                </button>

                <button
                  onClick={() => onDeletePost(post.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                  title="Delete post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
