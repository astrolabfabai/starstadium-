import React from 'react';
import { Keyboard, X, Zap, ArrowRight, CornerDownLeft } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Gameday Menu Navigation',
      shortcuts: [
        { key: '1', action: 'Plays View (Drive Charts & Film)' },
        { key: '2', action: 'Red Zone Efficiency & Inside-20 Snaps' },
        { key: '3', action: 'Possession & Time of Possession (TOP)' },
        { key: '4', action: 'Win Probability Engine & Leverage' },
        { key: '5', action: 'Live Odds & Multi-Bookmaker Matrix' },
        { key: '6', action: 'Live NFL Scoreboard' },
        { key: '7', action: 'NFL Division & Conference Standings' },
        { key: '8', action: 'All-in-One Dashboard Grid' }
      ]
    },
    {
      category: 'Gameday Actions & Ergonomics',
      shortcuts: [
        { key: 'G', action: 'Open Matchup Switcher Drawer' },
        { key: 'M', action: 'Toggle Minimize / Expand Game Slate' },
        { key: 'R', action: 'Force Revalidate & Sync Feeds' },
        { key: 'A', action: 'Toggle AI Coach Assistant' },
        { key: 'U', action: 'Open 10 UI/UX Best Practices Modal' },
        { key: '?', action: 'Open this Keyboard Shortcuts Menu' },
        { key: 'Esc', action: 'Close any active modal or drawer' }
      ]
    }
  ];

  return (
    <div
      id="keyboard-shortcuts-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="keyboard-shortcuts-modal-card"
        className="bg-[#0f131a] border border-sky-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="bg-[#141a24] border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Keyboard Shortcuts (Power-User Mode)</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Inspired by Sportradar &amp; RapidAPI analyst workstations
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

        {/* Shortcuts Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto font-mono text-xs">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {group.category}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.shortcuts.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-300 text-[11px] truncate">{sc.action}</span>
                    <kbd className="px-2 py-0.5 rounded bg-black/70 border border-white/20 text-amber-400 font-bold text-xs shadow-xs shrink-0">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[#141a24] border-t border-white/10 px-5 py-3 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-white font-bold">Esc</kbd> to return
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
