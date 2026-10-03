import React, { useState, useEffect } from 'react';
import { useRealtime } from '../context/RealtimeContext';
import { useAuth } from '../context/AuthContext';
import { Locale, TRANSLATIONS } from '../utils/i18n';
import { 
  Zap, 
  Terminal, 
  Server, 
  Globe2, 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Check, 
  ChevronDown, 
  CreditCard, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface LandingHeroProps {
  onOpenIde: () => void;
  onDeployClick?: () => void;
  onExploreClick: () => void;
  locale: Locale;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ 
  onOpenIde, 
  onDeployClick,
  onExploreClick, 
  locale 
}) => {
  const { isConnected, onlineCount, latencyMs } = useRealtime();
  const { openPaymentModal } = useAuth();
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  const [stats, setStats] = useState({
    totalProjects: 142,
    totalViews: 84930,
    totalBandwidthKb: 458920,
    uptimeSeconds: 86400
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStats({
            totalProjects: data.totalProjects || 142,
            totalViews: data.totalViews || 84930,
            totalBandwidthKb: data.totalBandwidthKb || 458920,
            uptimeSeconds: data.uptimeSeconds || 86400
          });
        }
      })
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: 'How does the real-time global hosting engine work?',
      a: 'Whenever you click "Deploy Live", your HTML, CSS, and JS are instantly minified, scanned for vulnerabilities, bundled, and synced across all edge nodes via WebSocket and server database streams. Your site is assigned a unique URL like /view/yourname/project-slug that is accessible anywhere worldwide in milliseconds.'
    },
    {
      q: 'How does manual bKash & Nagad payment verification work?',
      a: 'Choose your plan (Pro ৳550 or Enterprise ৳1,650), send money to our official Merchant / Personal wallet number, and submit your Sender Phone Number and Transaction ID (TrxID) in the payment modal. Our automated verification queue verifies the transaction and instantly activates your unlimited storage and custom limits.'
    },
    {
      q: 'Is JavaScript execution secure and sandboxed?',
      a: 'Yes! The preview engine executes inside an isolated iframe sandbox with restricted cross-origin permissions, preventing access to the parent session while allowing full interactive DOM manipulation, canvas 2D/3D games, animations, audio, and event listeners.'
    },
    {
      q: 'Can I lock my hosted website with a password?',
      a: 'Yes. In the deployment modal, enable "Password Protection" and set a passcode. Any visitor browsing your URL will be greeted with an encrypted unlock gateway before the HTML is decrypted and rendered.'
    },
    {
      q: 'Can I export my code or rollback versions?',
      a: 'Every time you update your code in the Cloud IDE, an immutable version is recorded (e.g. v1.0, v1.1). You can rollback to any prior release with one click, or export the entire project directory as a clean .zip archive.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-teal-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>GLOBAL EDGE ENGINE 2.4 • SUB-5MS CODE EXECUTION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            {t.heroTitle.split(' ')[0]} <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">{t.heroTitle.split(' ').slice(1, 4).join(' ')}</span> {t.heroTitle.split(' ').slice(4).join(' ')}
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onDeployClick || onOpenIde}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Zap className="w-4 h-4 fill-current animate-pulse" />
              <span>Host Website Live</span>
            </button>

            <button
              onClick={onExploreClick}
              className="flex items-center gap-2 px-7 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm rounded-xl transition-all"
            >
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>{t.exploreBtn}</span>
            </button>

            <button
              onClick={openPaymentModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold text-sm rounded-xl transition-all"
            >
              <CreditCard className="w-4 h-4 text-pink-400" />
              <span>bKash / Nagad Upgrade</span>
            </button>
          </div>

          {/* Live Node Statistics Grid */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
                <span>ACTIVE SITES</span>
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{stats.totalProjects}</div>
              <div className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Real-Time Synced
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
                <span>GLOBAL VIEWS</span>
                <Zap className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{stats.totalViews.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-mono">Instant edge delivery</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
                <span>EDGE LATENCY</span>
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{latencyMs} ms</div>
              <div className="text-[11px] text-blue-400 mt-1 font-mono">Sub-millisecond loop</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-mono">
                <span>ONLINE PEERS</span>
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{onlineCount}</div>
              <div className="text-[11px] text-indigo-400 mt-1 font-mono">Active global sockets</div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Designed for Instant Code Execution & Zero Lag
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every layer from file ingestion to sandboxed rendering is optimized for real-time responsiveness.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">Multi-Tab Code Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-featured IDE with syntax styling, line numbers, automatic HTML/CSS/JS minifier, templates, and zip drag-and-drop.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">Automated Malware Scanner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pre-deployment security filters block crypto miners, cookie sniffers, phishing templates, and malicious scripts automatically.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 mb-2">bKash & Nagad Gateway</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native manual transaction verification for users in Bangladesh & South Asia. Submit TrxID and unlock 50GB storage instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono text-pink-400 uppercase tracking-wider">SCALABLE CLOUD TIERS</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Simple & Transparent Pricing</h2>
          <p className="text-xs text-slate-400 mt-2">
            Pay seamlessly via bKash, Nagad, or start completely free. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Starter Free</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">FREE</span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-4">
                $0 <span className="text-xs font-normal text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Perfect for students, experiments, and personal code testing.</p>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 5 Active Hosted Sites</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 50 MB Cloud Storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Real-time Execution Sandbox</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Version Control (v1.0 - v1.2)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Standard QR Code Sharing</li>
              </ul>
            </div>

            <button
              onClick={onOpenIde}
              className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              Start Free Coding
            </button>
          </div>

          {/* Pro Developer (Highlighted) */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-900 border-2 border-cyan-500/60 shadow-xl shadow-cyan-500/10 flex flex-col justify-between transform md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
              MOST POPULAR (bKash/Nagad)
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-cyan-300">Pro Developer</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">PRO</span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                ৳550 <span className="text-xs font-normal text-slate-400">($5 USD) / month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Designed for active web developers, freelancers, and portfolios.</p>

              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Up to 50 Hosted Websites</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> 5 GB High-Speed Storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Password Protected Sites</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Unlimited Version Rollbacks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> SEO Meta-Tags Customization</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Priority bKash/Nagad Auto-Review</li>
              </ul>
            </div>

            <button
              onClick={openPaymentModal}
              className="mt-8 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition-all"
            >
              Upgrade with bKash / Nagad
            </button>
          </div>

          {/* Enterprise Cloud */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Enterprise Cloud</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">UNLIMITED</span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                ৳1,650 <span className="text-xs font-normal text-slate-400">($15 USD) / month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Complete freedom for agencies, teams, and high-traffic clients.</p>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> Unlimited Hosted Sites (9,999+)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> 50 GB Global Storage</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> Custom Domain CNAME Binding</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> Malware Bypass & Safe Whitelist</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400 shrink-0" /> 24/7 Dedicated Telegram/WhatsApp Rep</li>
              </ul>
            </div>

            <button
              onClick={openPaymentModal}
              className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              Get Enterprise Access
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 mt-1">Everything you need to know about NexusHost Global</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-slate-200 hover:text-cyan-300"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
