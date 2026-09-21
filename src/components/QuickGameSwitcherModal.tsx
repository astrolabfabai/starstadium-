import React, { useState } from 'react';
import { GameSchedule } from '../types';
import { TeamLogo } from './TeamLogo';
import { SCHEDULES_DATA } from '../data/sportsDataMock';
import { useRealtimeSync } from '../context/RealtimeSyncContext';
import {
  Search,
  X,
  Clock,
  Radio,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Flame
} from 'lucide-react';

interface QuickGameSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGameKey: string;
  onSelectGameKey: (key: string) => void;
  seasonYear?: number;
}

export const QuickGameSwitcherModal: React.FC<QuickGameSwitcherModalProps> = ({
  isOpen,
  onClose,
  selectedGameKey,
  onSelectGameKey,
  seasonYear = 2026
}) => {
  const { games: realtimeGames } = useRealtimeSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'FINAL'>('ALL');

  if (!isOpen) return null;

  const currentSeasonGames = SCHEDULES_DATA.filter((g) => g.Season === seasonYear);

  const filteredGames = currentSeasonGames.filter((g) => {
    // Status filter
    if (filter === 'LIVE' && g.Status !== 'InProgress') return false;
    if (filter === 'FINAL' && g.Status !== 'Final') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAway = g.AwayTeam.toLowerCase().includes(q);
      const matchHome = g.HomeTeam.toLowerCase().includes(q);
      const matchCity = (g.StadiumCity || '').toLowerCase().includes(q);
      return matchAway || matchHome || matchCity;
    }

    return true;
  });

  const handleChooseGame = (gameKey: string) => {
    onSelectGameKey(gameKey);
    onClose();
  };

  return (
    <div
      id="quick-game-switcher-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        id="quick-game-switcher-modal-card"
        className="bg-[#0f131a] border border-amber-500/30 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="bg-[#141a24] border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Select NFL Game Matchup</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {filteredGames.length} Games
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 bg-black/50 border-b border-white/10 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team or city (e.g. KC, Ravens, Dallas)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              autoFocus
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#14161f] p-0.5 rounded-xl border border-white/10 text-[11px] font-mono shrink-0">
            {(['ALL', 'LIVE', 'FINAL'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filter === mode
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'LIVE' ? '🔴 Live Now' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Matchup Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredGames.map((game) => {
            const isSelected = game.GameKey === selectedGameKey;
            const liveData = realtimeGames[game.GameKey];

            const awayScore = liveData ? liveData.awayScore : (game.AwayScore ?? 0);
            const homeScore = liveData ? liveData.homeScore : (game.HomeScore ?? 0);
            const quarter = liveData ? liveData.quarter : (game.Quarter || 'Q4');
            const clock = liveData ? liveData.clockDisplay : (game.TimeRemaining || '02:15');
            const isLive = game.Status === 'InProgress';

            return (
              <button
                key={game.GameKey}
                onClick={() => handleChooseGame(game.GameKey)}
                className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 select-none cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-lg ring-1 ring-amber-400/30'
                    : 'bg-[#141720] border-white/10 hover:border-white/25 hover:bg-[#1a1e2a]'
                }`}
              >
                {/* Top Status Strip */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  {isLive ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>{quarter} {clock}</span>
                    </span>
                  ) : game.Status === 'Final' ? (
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold">
                      FINAL
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                      {game.Time || 'UPCOMING'}
                    </span>
                  )}

                  <span className="text-slate-400 font-mono">
                    {game.Channel || 'NBC'} &bull; {game.StadiumCity}
                  </span>
                </div>

                {/* Teams & Scores */}
                <div className="space-y-1 py-1">
                  {/* Away */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TeamLogo teamKey={game.AwayTeam} size="sm" shape="circle" />
                      <span className="font-bold text-white text-xs font-mono">{game.AwayTeam}</span>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-sm">{awayScore}</span>
                  </div>

                  {/* Home */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TeamLogo teamKey={game.HomeTeam} size="sm" shape="circle" />
                      <span className="font-bold text-white text-xs font-mono">{game.HomeTeam}</span>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-sm">{homeScore}</span>
                  </div>
                </div>

                {/* Footer Selection State */}
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">
                    Spread: {game.PointSpread ? `${game.PointSpread > 0 ? '+' : ''}${game.PointSpread}` : 'PK'}
                  </span>
                  {isSelected ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>CURRENTLY ACTIVE</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-0.5 group-hover:text-slate-300">
                      <span>Switch View</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#141a24] border-t border-white/10 px-5 py-2.5 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/20 text-white font-bold">G</kbd> anytime to open this switcher</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
