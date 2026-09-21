import React, { useState } from 'react';
import {
  Compass,
  X,
  Keyboard,
  Volume2,
  Minimize2,
  Maximize2,
  MousePointerClick,
  Sparkles,
  Zap,
  CheckCircle2,
  LayoutGrid,
  Eye,
  Sliders,
  Smartphone,
  Radio,
  ExternalLink
} from 'lucide-react';
import { playScoreChime } from '../utils/audioChimes';

interface UiPrinciple {
  id: string;
  platform: string;
  category: 'Sports Media' | 'Betting / Odds' | 'Sports API Provider' | 'Sensors & NGS';
  logoEmoji: string;
  principleTitle: string;
  coreRule: string;
  whyUsersLoveIt: string;
  howWeAppliedIt: string;
  interactiveDemoType?: 'sound' | 'density' | 'shortcuts' | 'minimize';
}

const UI_10_PRINCIPLES: UiPrinciple[] = [
  {
    id: 'espn',
    platform: 'ESPN (ScoreCenter / Gamecast)',
    category: 'Sports Media',
    logoEmoji: '🔴',
    principleTitle: 'Glanceable Hierarchy & Progressive Disclosure',
    coreRule: 'Show the most critical information (who is playing, what is the score, and how much time is left) in under 0.5 seconds of eye scan.',
    whyUsersLoveIt: 'Users do not want to read paragraphs to find out if their team is winning. Big scores, high-res team crests, and bold quarter clocks allow instant comprehension. Detailed drive charts and play logs remain tucked away until tapped.',
    howWeAppliedIt: 'Designed the Gameday Command Bar with immediate team logos, bold yellow scores, live quarter clocks, and auto-minimizing match lists to maximize analytics viewport.'
  },
  {
    id: 'action_network',
    platform: 'Action Network',
    category: 'Betting / Odds',
    logoEmoji: '📈',
    principleTitle: 'Visual Micro-Interactions & Color-Coded Delta Flashes',
    coreRule: 'Never require mental arithmetic for changes. If a line moves, flash emerald (+ favor) or rose (- drift) immediately.',
    whyUsersLoveIt: 'Bettors can monitor 12 games simultaneously because their peripheral vision immediately catches line movement without having to inspect every number.',
    howWeAppliedIt: 'Integrated instant line movement indicator pills (📈 STEAM MOVE UP / 📉 LINE DRIFT DOWN) and live market status badges in BettingOddsWidget.'
  },
  {
    id: 'fanduel',
    platform: 'FanDuel Sportsbook',
    category: 'Betting / Odds',
    logoEmoji: '🟢',
    principleTitle: 'Thumb-Zone Ergonomics & 48px Touch Targets',
    coreRule: 'Primary interactive controls must be at least 44px-48px with unmistakable glowing active states.',
    whyUsersLoveIt: 'Prevents frustrating mis-clicks on mobile and tablet devices when placing rapid live wagers or switching tabs during commercials.',
    howWeAppliedIt: 'Engineered all navigation pills and game selection cards with generous hitboxes, hover elevations, and bright amber/gold active glow borders.'
  },
  {
    id: 'draftkings',
    platform: 'DraftKings',
    category: 'Betting / Odds',
    logoEmoji: '👑',
    principleTitle: 'Collapsible Bento Cards & Eye-Comfort Dark Mode',
    coreRule: 'Give users complete layout sovereignty: let them minimize widgets they do not care about with one click (+ / −).',
    whyUsersLoveIt: 'Hardcore analysts want Win Probability and EPA scatter plots, while fantasy fans only care about Plays and Red Zone. Collapsible cards let each user customize their screen.',
    howWeAppliedIt: 'Added modular minimize/expand toggles (+ / −) across the Gameday Slate, Turning Points ribbon, Swing Plays card, and Betting modules.'
  },
  {
    id: 'flashscore',
    platform: 'Flashscore / SofaScore',
    category: 'Sports Media',
    logoEmoji: '⚡',
    principleTitle: 'Instant Game State Badges & Sound/Haptic Alerts',
    coreRule: 'Use color-coded state badges (Live Red, Final Gray, Upcoming Amber) paired with subtle audio cues on scoring plays.',
    whyUsersLoveIt: 'Fans working in background tabs or looking away hear a pleasant audio chime when a touchdown occurs, immediately bringing their attention back.',
    howWeAppliedIt: 'Built a lightweight browser Web Audio API chime engine with a 1-click sound toggle in the header, playing pleasant harmonic chimes on touchdowns and turnovers.',
    interactiveDemoType: 'sound'
  },
  {
    id: 'sleeper',
    platform: 'Sleeper',
    category: 'Sports Media',
    logoEmoji: '💤',
    principleTitle: 'Less Words, More Relevant Emojis & Team Logos',
    coreRule: 'Ban unnecessary sentence clutter. Replace text labels with universally recognizable icons, team logos, and emojis.',
    whyUsersLoveIt: 'Cognitive load drops dramatically. A 🏈 emoji with "FILM" or 🎯 with "RZ" communicates context 300% faster than "Play-by-play tactical review".',
    howWeAppliedIt: 'Strictly replaced dense text headers with clean emojis (🏈 Plays, 🎯 Red Zone, ⏱️ Possession, 📈 Win%, 💰 Odds) and official team logos.'
  },
  {
    id: 'next_gen_stats',
    platform: 'Next Gen Stats (NFL NGS)',
    category: 'Sensors & NGS',
    logoEmoji: '⚡',
    principleTitle: 'Visual Tactical Field Overlays over Text Lists',
    coreRule: 'Translate abstract numbers (e.g. "KC 18, 2nd & 7") into an intuitive 2D football field with scrimmage and yard markers.',
    whyUsersLoveIt: 'Human spatial intuition processes an interactive field diagram in milliseconds, whereas reading down/distance text requires analytical parsing.',
    howWeAppliedIt: 'Constructed the interactive 100-yard field visualizer with animated line of scrimmage, first down yard line, and ball position spot.'
  },
  {
    id: 'the_athletic',
    platform: 'The Athletic / NYT Sports',
    category: 'Sports Media',
    logoEmoji: '📰',
    principleTitle: 'Spacious Typographic Contrast & No Pop-Up Chaos',
    coreRule: 'Pair distinctive display typography with high-contrast mono digits; maintain 1.5–1.7 line height and zero intrusive pop-ups.',
    whyUsersLoveIt: 'Gives the application a calm, premium, editorial atmosphere where users can read long-form play breakdowns without feeling assaulted by banners.',
    howWeAppliedIt: 'Enforced dark theme palette (#0c0d11 charcoal, not pure black #000000) with crisp font hierarchy and zero unrequested popups.'
  },
  {
    id: 'sportradar',
    platform: 'Sportradar / RapidAPI Sports',
    category: 'Sports API Provider',
    logoEmoji: '📡',
    principleTitle: 'Power-User Keyboard Shortcuts for Instant Navigation',
    coreRule: 'Enable single-key shortcuts (1-7 for tabs, G for game switcher, ? for help, Esc to close) for high-frequency workflows.',
    whyUsersLoveIt: 'Power users, fantasy commissioners, and analysts can jump between Plays, Odds, and Win% without moving their hand to the mouse.',
    howWeAppliedIt: 'Implemented global hotkeys: press 1-5 to switch between Plays, Red Zone, Possession, Win%, and Odds; press G to switch games; press ? for cheatsheet.',
    interactiveDemoType: 'shortcuts'
  },
  {
    id: 'thescore',
    platform: 'TheScore / Bleacher Report',
    category: 'Sports Media',
    logoEmoji: '📱',
    principleTitle: 'Non-Wrapping Single-Line Horizontal Navigation',
    coreRule: 'Pills and tabs must NEVER break onto two lines or wrap awkwardly. Use smooth horizontal overflow scrolling with touch swipe.',
    whyUsersLoveIt: 'Double-line wrapped navigation ruins visual rhythm and wastes vertical screen real estate. Single-line tabs keep controls clean and predictable.',
    howWeAppliedIt: 'Formatted all navigation strips with nowrap horizontal scrolling and compact indicator badges.'
  }
];

interface UserFriendlyUiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
}

export const UserFriendlyUiModal: React.FC<UserFriendlyUiModalProps> = ({
  isOpen,
  onClose,
  onOpenShortcuts
}) => {
  const [selectedId, setSelectedId] = useState<string>(UI_10_PRINCIPLES[0].id);

  if (!isOpen) return null;

  const activePrinciple = UI_10_PRINCIPLES.find((p) => p.id === selectedId) || UI_10_PRINCIPLES[0];

  return (
    <div
      id="user-friendly-ui-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="user-friendly-ui-modal-card"
        className="bg-[#0f131a] border border-amber-500/30 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="bg-[#141a24] border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>How 10 Top Platforms Keep UI User-Friendly</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Applied to StarStadium
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Glanceability, Thumb Ergonomics, Bento Collapsing, Keyboard Hotkeys, Audio Alerts, and Non-Wrapping Pills
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Ribbon */}
        <div className="bg-black/40 border-b border-white/10 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Interactive Demos:</span>
            <button
              onClick={() => playScoreChime('touchdown')}
              className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test TD Chime</span>
            </button>
            <button
              onClick={() => playScoreChime('turnover')}
              className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Alert Chime</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenShortcuts && (
              <button
                onClick={() => {
                  onClose();
                  onOpenShortcuts();
                }}
                className="px-2.5 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 flex items-center gap-1.5 transition"
              >
                <Keyboard className="w-3.5 h-3.5 text-sky-400" />
                <span>View Shortcuts [?]</span>
              </button>
            )}
          </div>
        </div>

        {/* Body Grid: Left 10 items + Right Deep Dive */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: List of 10 Platforms */}
          <div className="md:col-span-4 border-r border-white/10 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 bg-[#0c1017]">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1 font-bold">
              10 Industry Benchmarks
            </div>
            {UI_10_PRINCIPLES.map((principle, idx) => {
              const isSelected = selectedId === principle.id;
              return (
                <button
                  key={principle.id}
                  onClick={() => setSelectedId(principle.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{principle.logoEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {idx + 1}. {principle.platform.split('(')[0]}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 line-clamp-1 mt-0.5">
                      {principle.principleTitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Principle Details */}
          <div className="md:col-span-8 overflow-y-auto p-5 space-y-4 bg-[#0f141d]">
            {/* Header */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{activePrinciple.logoEmoji}</span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {activePrinciple.platform}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {activePrinciple.category}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-bold text-amber-300 font-mono mt-2">
                ✨ {activePrinciple.principleTitle}
              </p>
            </div>

            {/* Core Rule */}
            <div className="bg-[#141a24] border border-white/10 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 uppercase">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>The Core UX Rule</span>
              </div>
              <p className="text-xs text-white leading-relaxed">
                {activePrinciple.coreRule}
              </p>
            </div>

            {/* Why Users Love It */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 uppercase">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Why Users Love It</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activePrinciple.whyUsersLoveIt}
              </p>
            </div>

            {/* How We Applied It */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Applied to this Website</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {activePrinciple.howWeAppliedIt}
              </p>
            </div>

            {/* Interactive Demo for Sound or Hotkeys */}
            {activePrinciple.id === 'flashscore' && (
              <div className="bg-black/50 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">Test Sound Alerts</h4>
                  <p className="text-[11px] text-slate-400">Hear the instant audio chime that notifies users of scoring events</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playScoreChime('touchdown')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
                  >
                    Touchdown Chime
                  </button>
                  <button
                    onClick={() => playScoreChime('redzone')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition"
                  >
                    Red Zone Alert
                  </button>
                </div>
              </div>
            )}

            {activePrinciple.id === 'sportradar' && (
              <div className="bg-black/50 border border-sky-500/30 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-sky-300 font-mono flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4" /> Try Keyboard Shortcuts Right Now
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-slate-300">
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-amber-400 font-bold mr-1.5">1</kbd>
                    <span>Plays View</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-slate-300">
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-amber-400 font-bold mr-1.5">2</kbd>
                    <span>Red Zone</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-slate-300">
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-amber-400 font-bold mr-1.5">3</kbd>
                    <span>Possession</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-slate-300">
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-amber-400 font-bold mr-1.5">4</kbd>
                    <span>Win% Engine</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-slate-300">
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-amber-400 font-bold mr-1.5">5</kbd>
                    <span>Odds Matrix</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 text-slate-300">
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-sky-400 font-bold mr-1.5">G</kbd>
                    <span>Game Switcher</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#141a24] border-t border-white/10 px-5 py-3 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-white font-bold">Esc</kbd> anytime to close
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
