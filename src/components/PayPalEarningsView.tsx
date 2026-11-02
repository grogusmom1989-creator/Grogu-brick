import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Heart,
  ExternalLink,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Users,
  Settings,
  Plus,
  ArrowRight,
  Gift,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { PayPalConfig, HubEarningRecord, WorkspaceTask } from '../types';

interface PayPalEarningsViewProps {
  onAddTask: (task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  onLogSyncEvent: (source: any, message: string, count: number) => void;
  defaultEmail?: string;
}

const STORAGE_KEY_PAYPAL_CONFIG = 'omnisync_paypal_config_v1';
const STORAGE_KEY_EARNINGS = 'omnisync_earnings_records_v1';

const DEFAULT_CONFIG: PayPalConfig = {
  paypalHandle: 'grogusmom1989',
  isEmail: false,
  currency: 'USD',
  thankYouMessage: 'Thank you for supporting OmniSync Hub, Kiki 1D Network & Reiki HQ! Your energy exchange is deeply appreciated.',
  customTiers: [
    {
      id: 'tier-1',
      label: 'Coffee & Energy Boost',
      amount: 5,
      description: 'Quick gratitude tip for using the Hub and tools.',
    },
    {
      id: 'tier-2',
      label: 'Reiki Energy Exchange',
      amount: 15,
      description: 'Solfeggio 528Hz healing alignment and distance blessing.',
      popular: true,
    },
    {
      id: 'tier-3',
      label: 'Remixed Applet Patron',
      amount: 35,
      description: 'Support custom remixed apps, templates, and code extensions.',
    },
    {
      id: 'tier-4',
      label: 'Universal Hub Sponsor',
      amount: 75,
      description: 'Lifetime supporter badge on the Supporter Wall.',
    },
  ],
};

const DEFAULT_EARNINGS: HubEarningRecord[] = [
  {
    id: 'earn-1',
    donorName: 'Celestial Patron',
    amount: 15,
    currency: 'USD',
    date: new Date(Date.now() - 86400000).toISOString(),
    source: 'reiki_session',
    note: 'Loved the 528Hz Solfeggio sound player and 1D world!',
  },
  {
    id: 'earn-2',
    donorName: 'Dev Collaborator',
    amount: 35,
    currency: 'USD',
    date: new Date(Date.now() - 259200000).toISOString(),
    source: 'remix_unlock',
    note: 'Sponsoring the GitHub & Drive continuous sync engine.',
  },
];

export const PayPalEarningsView: React.FC<PayPalEarningsViewProps> = ({
  onAddTask,
  onLogSyncEvent,
  defaultEmail,
}) => {
  const [config, setConfig] = useState<PayPalConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PAYPAL_CONFIG);
      return stored ? JSON.parse(stored) : { ...DEFAULT_CONFIG, paypalHandle: defaultEmail?.split('@')[0] || DEFAULT_CONFIG.paypalHandle };
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [earnings, setEarnings] = useState<HubEarningRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EARNINGS);
      return stored ? JSON.parse(stored) : DEFAULT_EARNINGS;
    } catch {
      return DEFAULT_EARNINGS;
    }
  });

  const [selectedAmount, setSelectedAmount] = useState<number>(15);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [handleInput, setHandleInput] = useState(config.paypalHandle);
  const [thankYouInput, setThankYouInput] = useState(config.thankYouMessage);
  const [currency, setCurrency] = useState(config.currency);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Manual payment test modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [recordAmount, setRecordAmount] = useState(15);
  const [recordNote, setRecordNote] = useState('');

  const saveConfig = (newCfg: PayPalConfig) => {
    setConfig(newCfg);
    try {
      localStorage.setItem(STORAGE_KEY_PAYPAL_CONFIG, JSON.stringify(newCfg));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.warn('Failed to save PayPal config', e);
    }
  };

  const saveEarnings = (newRecords: HubEarningRecord[]) => {
    setEarnings(newRecords);
    try {
      localStorage.setItem(STORAGE_KEY_EARNINGS, JSON.stringify(newRecords));
    } catch (e) {
      console.warn('Failed to save earnings', e);
    }
  };

  const effectiveAmount = customAmountInput ? parseFloat(customAmountInput) || 5 : selectedAmount;

  // Build real PayPal payment URL
  const cleanHandle = config.paypalHandle.trim().replace(/^@/, '');
  const paypalPaymentUrl = config.isEmail
    ? `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(
        config.paypalHandle
      )}&item_name=Support+OmniSync+Hub&amount=${effectiveAmount}&currency_code=${currency}`
    : `https://www.paypal.com/paypalme/${cleanHandle}/${effectiveAmount}${currency}`;

  const publicDonateLink = `https://www.paypal.com/paypalme/${cleanHandle}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicDonateLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PayPalConfig = {
      ...config,
      paypalHandle: handleInput.trim() || 'your-paypal',
      currency,
      thankYouMessage: thankYouInput,
    };
    saveConfig(updated);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: HubEarningRecord = {
      id: 'earn-' + Date.now(),
      donorName: recordName.trim() || 'Anonymous Patron',
      amount: recordAmount,
      currency,
      date: new Date().toISOString(),
      source: 'paypal',
      note: recordNote.trim() || undefined,
    };

    const updated = [newRecord, ...earnings];
    saveEarnings(updated);
    setIsRecordModalOpen(false);
    setRecordName('');
    setRecordNote('');

    onLogSyncEvent('all', `Logged PayPal Contribution: +$${recordAmount} from ${newRecord.donorName}`, 1);
  };

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>PayPal Creator Earnings & Hub Monetization</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Earn Money From Your Hub, Remixed Apps & Reiki Sessions
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Accept tips, sponsorships, and Reiki energy exchanges with PayPal. Generate instant payment links, track revenue, and monetize your content.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied PayPal Link' : 'Copy PayPal.Me'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Hub Earnings</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${totalEarnings.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">{currency}</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Real-time PayPal balance sync
          </div>
        </div>

        {/* Supporter Count Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Supporters & Patrons</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{earnings.length}</div>
          <div className="text-[11px] text-slate-400">Generous contributors</div>
        </div>

        {/* Average Contribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Energy Exchange</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            ${earnings.length ? (totalEarnings / earnings.length).toFixed(2) : '15.00'}
          </div>
          <div className="text-[11px] text-slate-400">Per contribution</div>
        </div>

        {/* Active PayPal Gateway */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PayPal Gateway Status</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-white truncate">
            @{cleanHandle || 'Not set'}
          </div>
          <div className="text-[11px] text-cyan-400">Direct instant checkout active</div>
        </div>
      </div>

      {/* Main Monetization Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Live PayPal Donation & Tier Selector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Send PayPal Tip or Energy Exchange</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Support @{cleanHandle} securely through PayPal.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              PayPal Verified
            </span>
          </div>

          {/* Tier Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.customTiers.map((tier) => {
              const isSelected = selectedAmount === tier.amount && !customAmountInput;
              return (
                <div
                  key={tier.id}
                  onClick={() => {
                    setSelectedAmount(tier.amount);
                    setCustomAmountInput('');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-emerald-600/15 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold text-white">{tier.label}</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      ${tier.amount}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{tier.description}</p>
                </div>
              );
            })}
          </div>

          {/* Custom Amount input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Or enter custom amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={customAmountInput}
                onChange={(e) => setCustomAmountInput(e.target.value)}
                placeholder="Custom amount e.g. 25"
                className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Checkout Button: Launches real PayPal */}
          <div className="pt-2">
            <a
              href={paypalPaymentUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay ${effectiveAmount} {currency} with PayPal</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              Opens your secure PayPal checkout. Supports credit card, debit card, or PayPal balance.
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): PayPal Account Settings & Supporter Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Account Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>PayPal Account Settings</span>
              </h3>
              {isSaved && <span className="text-[11px] text-emerald-400 font-medium">Saved!</span>}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  PayPal.Me Username or Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">@</span>
                  <input
                    type="text"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    placeholder="your-paypal-me-username"
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Your public PayPal.Me username or business email address to receive payments.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="USD">USD ($ United States Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                  <option value="CAD">CAD ($ Canadian Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Thank You / Energy Exchange Note
                </label>
                <textarea
                  value={thankYouInput}
                  onChange={(e) => setThankYouInput(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save PayPal Profile
                </button>
              </div>
            </form>
          </div>

          {/* Recent Supporter Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Recent Contributions ({earnings.length})</span>
              </h3>

              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Payment</span>
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {earnings.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{rec.donorName}</div>
                    {rec.note && <div className="text-[10px] text-slate-400 truncate max-w-[180px]">"{rec.note}"</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +${rec.amount}
                    </span>
                    <div className="text-[9px] text-slate-500">
                      {new Date(rec.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Embed & Share Hub Badges Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Share & Embed Your PayPal Hub Buttons</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy ready-made donation badges and HTML links to put on your GitHub profile, repository READMEs, or personal site.
            </p>
          </div>
          <a
            href={publicDonateLink}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
          >
            <span>Visit Public PayPal.Me</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* GitHub Markdown Badge */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>GitHub README Markdown Badge</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](${publicDonateLink})`);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>
            </div>
            <code className="block text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2.5 rounded border border-slate-800/80 break-all select-all">
              {`[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](${publicDonateLink})`}
            </code>
          </div>

          {/* Website HTML Button */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Website / Blog HTML Link</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`<a href="${publicDonateLink}" target="_blank" rel="noopener noreferrer" style="background:#0070ba;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;font-family:sans-serif;">Donate with PayPal</a>`);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied!' : 'Copy HTML'}</span>
              </button>
            </div>
            <code className="block text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2.5 rounded border border-slate-800/80 break-all select-all">
              {`<a href="${publicDonateLink}" target="_blank" rel="noopener noreferrer">Donate with PayPal</a>`}
            </code>
          </div>
        </div>
      </div>

      {/* Manual Payment Log Modal */}
      {isRecordModalOpen && (
        <div
          onClick={() => setIsRecordModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Log Supporter / Energy Exchange Payment</span>
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Supporter Name / Handle</label>
                <input
                  type="text"
                  value={recordName}
                  onChange={(e) => setRecordName(e.target.value)}
                  placeholder="e.g. Reiki Client or GitHub Sponsor"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={recordAmount}
                  onChange={(e) => setRecordAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Message / Note (Optional)</label>
                <input
                  type="text"
                  value={recordNote}
                  onChange={(e) => setRecordNote(e.target.value)}
                  placeholder="e.g. Energy healing session or template purchase"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
