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
} from 'lucide-react';
import {
  AppTab,
  SocialAccount,
  SocialPost,
  SocialPlatformId,
  GoogleDriveFile,
  WorkspaceProject,
  WorkspaceTask,
  WorkspaceNote,
} from '../types';

export interface AppStoreShortcut {
  id: string;
  name: string;
  category: 'Meta & Social' | 'Creator & Video' | 'Google & Cloud' | 'Finance & Pay' | 'AI & Dev' | 'Custom';
  packageName: string;
  webUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
  badgeColor: string;
  description: string;
}

const MAJOR_APP_STORES = [
  {
    id: 'google-play',
    name: 'Google Play Store',
    subtitle: 'Android, ChromeOS & Play Pass Apps',
    url: 'https://play.google.com/store/apps',
    searchUrl: (q: string) => `https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps`,
    accent: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
    badge: 'Google Play',
  },
  {
    id: 'apple-app-store',
    name: 'Apple App Store',
    subtitle: 'iPhone, iPad & Mac Universal Apps',
    url: 'https://www.apple.com/app-store/',
    searchUrl: (q: string) => `https://www.google.com/search?q=${encodeURIComponent('site:apps.apple.com ' + q)}`,
    accent: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-300',
    badge: 'iOS / macOS',
  },
  {
    id: 'meta-quest-store',
    name: 'Meta Horizon / Quest Store',
    subtitle: 'Meta Ecosystem, VR & Spatial Apps',
    url: 'https://www.meta.com/experiences/',
    searchUrl: (q: string) => `https://www.meta.com/experiences/search/?q=${encodeURIComponent(q)}`,
    accent: 'from-indigo-500/20 to-cyan-500/10 border-indigo-500/40 text-indigo-300',
    badge: 'Meta Store',
  },
  {
    id: 'samsung-galaxy-store',
    name: 'Samsung Galaxy Store',
    subtitle: 'Galaxy Exclusives & Android Apps',
    url: 'https://galaxystore.samsung.com/games',
    searchUrl: (q: string) => `https://www.google.com/search?q=${encodeURIComponent('Samsung Galaxy Store ' + q)}`,
    accent: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-300',
    badge: 'Galaxy Store',
  },
  {
    id: 'amazon-appstore',
    name: 'Amazon Appstore',
    subtitle: 'Android, Fire OS & Windows 11',
    url: 'https://www.amazon.com/gp/mas/get/android',
    searchUrl: (q: string) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&i=mobile-apps`,
    accent: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
    badge: 'Amazon',
  },
  {
    id: 'microsoft-store',
    name: 'Microsoft Store',
    subtitle: 'Windows PC, Web & Mobile Bridges',
    url: 'https://apps.microsoft.com/home',
    searchUrl: (q: string) => `https://apps.microsoft.com/search?query=${encodeURIComponent(q)}`,
    accent: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300',
    badge: 'Windows',
  },
  {
    id: 'f-droid',
    name: 'F-Droid Open Source',
    subtitle: 'FOSS Android APK Repository',
    url: 'https://f-droid.org/en/packages/',
    searchUrl: (q: string) => `https://search.f-droid.org/?q=${encodeURIComponent(q)}`,
    accent: 'from-lime-500/20 to-emerald-500/10 border-lime-500/40 text-lime-300',
    badge: 'Open APK',
  },
  {
    id: 'apkmirror-pwa',
    name: 'APKMirror & Web Store',
    subtitle: 'Direct Android Packages & PWAs',
    url: 'https://www.apkmirror.com/',
    searchUrl: (q: string) => `https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s=${encodeURIComponent(q)}`,
    accent: 'from-rose-500/20 to-orange-500/10 border-rose-500/40 text-rose-300',
    badge: 'Direct APK',
  },
];

const DEFAULT_APP_SHORTCUTS: AppStoreShortcut[] = [
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

interface SocialMediaViewProps {
  accounts: SocialAccount[];
  onUpdateAccounts: (accounts: SocialAccount[]) => void;
  posts: SocialPost[];
  onAddPost: (post: Omit<SocialPost, 'id' | 'createdAt'>) => void;
  onDeletePost: (id: string) => void;
  driveFiles?: GoogleDriveFile[];
  projects?: WorkspaceProject[];
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
  projects = [],
  onAddTask,
  onAddNote,
  onOpenPlayStore,
  onSyncSocialBackground,
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
  const [selectedProject, setSelectedProject] = useState<string>('OmniSync Hub');
  const [tagsInput, setTagsInput] = useState('Meta, Reels, OmniSync, Creator');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingHandleId, setEditingHandleId] = useState<SocialPlatformId | null>(null);
  const [handleDraft, setHandleDraft] = useState('');

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
      `${selectedProject || 'OmniSync'} Broadcast — ${postContent.trim().slice(0, 42)}`;

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

  const applyTemplate = (templateType: 'reiki' | 'kiki' | 'github' | 'paypal') => {
    if (templateType === 'reiki') {
      setPostTitle('528Hz Miracle Tone & Quantum Reiki Drop');
      setPostContent(
        '✨ 528Hz Miracle Tone & Quantum Reiki Alignment session is live! Tune your meridian field and experience cellular harmony in 1D World & Reiki HQ.'
      );
      setSelectedProject('1D World & Reiki HQ');
      setTagsInput('Reiki, 528Hz, SoundHealing, MetaReels');
    } else if (templateType === 'kiki') {
      setPostTitle("Kiki's World 2.0 — Daily Divine Oracle & Crystal Grid");
      setPostContent(
        "🔮 New Daily Divine Oracle Card & Crystal Grid activation inside Kiki's World 2.0! Watch the audio-reactive cinema stream now."
      );
      setSelectedProject("Kiki's World 2.0");
      setTagsInput('KikisWorld, CrystalHealing, OracleDeck, InstagramReels');
    } else if (templateType === 'github') {
      setPostTitle('OmniSync Hub Release — Background Daemon & Play Store App');
      setPostContent(
        '🚀 Shipped a new update to OmniSync Hub (@grogusmom1989) with continuous background cloud sync, offline outbox queueing, and Google Play Store TWA packaging!'
      );
      setSelectedProject('OmniSync Hub');
      setTagsInput('GitHub, BuildInPublic, React, GooglePlay');
    } else {
      setPostTitle('Support Creator Studio & Reiki Healing Sessions');
      setPostContent(
        '💖 Support our Reiki sessions, sound healing instruments, and open-source creator tools directly via PayPal (@grogusmom1989)!'
      );
      setSelectedProject('Creator Earnings & PayPal Hub');
      setTagsInput('CreatorEconomy, PayPal, SupportCreators, Meta');
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
      {/* Top Hero Banner — Built the Exact Same Way as Standalone App */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/90 via-indigo-950/85 to-pink-950/80 border border-indigo-500/30 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Meta Ecosystem, Social Media & Universal App Store Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Meta, Social Media &amp; Every App Store Command App
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Built the exact same way as a standalone app — persistent login, autonomous background sync daemon, offline localStorage Outbox, Firestore Cloud backup, and direct shortcuts to{' '}
            <strong className="text-white">
              Google Play Store, Apple App Store, Meta Quest Store, Samsung Galaxy Store, Amazon Appstore, Microsoft Store, Meta (Facebook, Instagram, Threads, WhatsApp), TikTok, YouTube &amp; 25+ apps
            </strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onSyncSocialBackground}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Socials...' : 'Sync Meta & Socials'}</span>
          </button>

          <button
            onClick={onOpenPlayStore}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Install / Google Play Packager</span>
          </button>
        </div>
      </div>

      {/* UNIVERSAL GOOGLE PLAY & EVERY APP STORE SHORTCUT DOCK */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Universal App Store Launcher • Google Play &amp; Every App Store</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Google Play &amp; All App Stores Shortcut Matrix ({allAppShortcuts.length} App Shortcuts + 8 Global App Stores)
            </h2>
            <p className="text-xs text-slate-400">
              Instant 1-click shortcuts to every major App Store and direct deep links to launch or install any app on Google Play, Apple App Store, Meta Store, or Web.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddShortcutForm((prev) => !prev)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pin Custom Google Play / App Store Shortcut</span>
            </button>
          </div>
        </div>

        {/* 1. Every Major App Store Direct Shortcuts (8 Stores) */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Every App Store Direct Portal (Click to Open Store or Search Directly)</span>
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
                  <a
                    href={store.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 text-white text-[11px] font-semibold flex items-center justify-center gap-1 border border-white/10 transition-colors"
                  >
                    <span>Open Store</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
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

        {/* 2. Search & Filter Bar across Google Play + All App Stores */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={storeSearchQuery}
              onChange={(e) => setStoreSearchQuery(e.target.value)}
              placeholder="Search any Google Play or App Store app (e.g. Instagram, CapCut, WhatsApp, TikTok, PayPal, Netflix)..."
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
          {['All', 'Meta & Social', 'Creator & Video', 'Google & Cloud', 'Finance & Pay', 'AI & Dev', 'Custom'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedAppCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedAppCategory === cat
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* 3. Grid of All Google Play & App Store App Shortcuts */}
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
                  title={`Open ${app.name} in Apple App Store`}
                >
                  <span>App Store</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Omni-Channel Broadcast Composer & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleBroadcastPost}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Cross-Platform Meta &amp; Social Broadcast Composer</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Compose once — dispatches in the background &amp; queues in your persistent Outbox if offline
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
            <span className="text-[11px] text-slate-400 font-medium">1-Click Templates:</span>
            {[
              { id: 'reiki', label: '528Hz Reiki Drop' },
              { id: 'kiki', label: "Kiki's World Reel" },
              { id: 'github', label: 'GitHub / App Release' },
              { id: 'paypal', label: 'PayPal Creator Tip' },
            ].map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl.id as 'reiki' | 'kiki' | 'github' | 'paypal')}
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
              placeholder="Broadcast Headline / Campaign Title (Optional)..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              placeholder="Write your Meta Reel caption, Threads post, Facebook update, or YouTube/TikTok description..."
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
                Link Portfolio Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
              >
                <option value="OmniSync Hub">OmniSync Hub</option>
                <option value="1D World & Reiki HQ">1D World &amp; Reiki HQ</option>
                <option value="Kiki's World 2.0">Kiki&apos;s World 2.0</option>
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
              <span>Background Syndication Daemon &amp; Offline Outbox Ready</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!postContent.trim()) return;
                  onAddNote({
                    title: `Social Draft: ${postTitle.trim() || postContent.slice(0, 36)}...`,
                    content: postContent,
                    tags: ['SocialMedia', 'Meta', 'Draft'],
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast &amp; Sync in Background</span>
              </button>
            </div>
          </div>
        </form>

        {/* Meta Business Suite & Quick Launchers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Meta Business &amp; Creator Studios</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch native Meta Business Suite, Instagram Reels Composer, Threads, or TikTok Studio while OmniSync keeps your assets, captions, and Drive files synced in the background.
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
                {
                  name: 'TikTok Creator Center',
                  desc: 'Short-form video & sound sync',
                  url: 'https://www.tiktok.com/creator-center',
                  color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
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

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
            <span>Background Social Daemon:</span>
            <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active (Auto-Sync)
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
              All channels are wired into the autonomous background sync loop and linked to your Projects Portfolio.
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
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Meta &amp; Social Syndication Stream ({posts.length})</span>
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
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      Project: {post.linkedProjectName}
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
                    <span key={tag} className="text-[10px] text-indigo-400 font-mono">
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
                      title: `Follow up engagement on: "${post.content.slice(0, 38)}..."`,
                      description: `Respond to comments & DMs across ${post.platforms.join(', ')}`,
                      status: 'todo',
                      priority: 'medium',
                      source: 'manual',
                      tags: ['SocialMedia', 'Meta'],
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
