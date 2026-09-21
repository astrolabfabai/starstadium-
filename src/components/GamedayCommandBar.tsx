import React, { useState } from 'react';
import { ViewMode, SeasonCode, GameSchedule } from '../types';
import { SCHEDULES_DATA } from '../data/sportsDataMock';
import { TeamLogo } from './TeamLogo';
import { useRealtimeSync } from '../context/RealtimeSyncContext';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  Clock,
  Radio
} from 'lucide-react';

interface GamedayCommandBarProps {
  selectedGameKey: string;
  onSelectGameKey: (key: string) => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedSeason: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  onOpenGoogleAi?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const GamedayCommandBar: React.FC<GamedayCommandBarProps> = ({
  selectedGameKey,
  onSelectGameKey,
  activeView,
  onViewChange,
  selectedSeason,
  onSeasonChange,
  onOpenGoogleAi,
  onRefresh,
  isRefreshing = false
}) => {
  // Minimize state for game list: starts minimized once a game is chosen or when user clicks a game
  const [isGamesMinimized, setIsGamesMinimized] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'FINAL'>('ALL');

  // Filter schedules for current season
  const seasonYear = selectedSeason?.startsWith('2026')
    ? 2026
    : selectedSeason?.startsWith('2025')
    ? 2025
    : selectedSeason?.startsWith('2024')
    ? 2024
    : 2026;

  const currentSeasonGames = SCHEDULES_DATA.filter((g) => g.Season === seasonYear);

  const { games } = useRealtimeSync();

  const activeGame: GameSchedule =
    currentSeasonGames.find((g) => g.GameKey === selectedGameKey) ||
    currentSeasonGames[0] ||
    SCHEDULES_DATA[0];

  // Overlay live streaming game telemetry if active
  const liveSyncData = games[selectedGameKey];
  const displayAwayScore = liveSyncData ? liveSyncData.awayScore : (activeGame.AwayScore ?? 0);
  const displayHomeScore = liveSyncData ? liveSyncData.homeScore : (activeGame.HomeScore ?? 0);
  const displayQuarter = liveSyncData ? liveSyncData.quarter : (activeGame.Quarter || 'Q4');
  const displayClock = liveSyncData ? liveSyncData.clockDisplay : (activeGame.TimeRemaining || activeGame.Clock || '02:15');
  const displayDownDistance = liveSyncData && liveSyncData.down > 0
    ? `${liveSyncData.down}th & ${liveSyncData.distance} (Ball at ${liveSyncData.yardLineSide} ${liveSyncData.yardLine})`
    : activeGame.DownDistance;

  const visibleGames = currentSeasonGames.filter((g) => {
    if (statusFilter === 'LIVE') return g.Status === 'InProgress';
    if (statusFilter === 'FINAL') return g.Status === 'Final';
    return true;
  });

  const handleSelectGame = (gameKey: string) => {
    onSelectGameKey(gameKey);
    // Auto-minimize the list of games when user clicks a game
    setIsGamesMinimized(true);
  };

  // Primary 5 Requested Gameday Menus in Exact Order + Core Hubs
  const navTabs = [
    { id: 'plays', label: 'Plays', emoji: '🏈', badge: 'FILM', keyHint: '1' },
    { id: 'red_zone', label: 'Red Zone', emoji: '🎯', badge: 'RZ', keyHint: '2' },
    { id: 'possession', label: 'Possession', emoji: '⏱️', badge: 'TOP', keyHint: '3' },
    { id: 'win_probability', label: 'Win%', emoji: '📈', badge: 'LIVE', keyHint: '4' },
    { id: 'betting', label: 'Odds', emoji: '💰', badge: 'LINES', keyHint: '5' },
    { id: 'scoreboard', label: 'Scores', emoji: '🏟️', badge: null, keyHint: '6' },
    { id: 'standings', label: 'Standings', emoji: '🏆', badge: null, keyHint: '7' },
    { id: 'dashboard', label: 'All Grid', emoji: '🎛️', badge: null, keyHint: '8' }
  ] as const;

  return (
    <div className="w-full space-y-2 sticky top-0 z-20 bg-[#0c0d11]/95 backdrop-blur-md pt-1 pb-2 border-b border-white/10 shadow-lg">
      {/* 1. TOP GAME SELECTOR STRIP: AUTO-MINIMIZES ON CLICK */}
      {isGamesMinimized ? (
        /* Minimized Compact Game Banner */
        <div className="bg-[#13141a] border border-white/10 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-inner">
          {/* Selected Game Synopsis with Logos */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE GAME:</span>
            </span>

            {/* Matchup Badges with Official Logos */}
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-2.5 py-1 rounded-lg">
              {/* Away */}
              <div className="flex items-center gap-1.5">
                <TeamLogo teamKey={activeGame.AwayTeam} size="xs" shape="circle" />
                <span className="font-mono font-bold text-white text-xs">{activeGame.AwayTeam}</span>
                <span className="font-mono font-black text-amber-400 text-xs">{displayAwayScore}</span>
              </div>

              <span className="text-slate-500 font-mono text-[10px]">@</span>

              {/* Home */}
              <div className="flex items-center gap-1.5">
                <TeamLogo teamKey={activeGame.HomeTeam} size="xs" shape="circle" />
                <span className="font-mono font-bold text-white text-xs">{activeGame.HomeTeam}</span>
                <span className="font-mono font-black text-amber-400 text-xs">{displayHomeScore}</span>
              </div>
            </div>

            {/* Quarter / Clock or Status */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              {activeGame.Status === 'InProgress' ? (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <Clock className="w-3 h-3 text-rose-400" />
                  <span>{displayQuarter}</span>
                  <span className="text-white font-bold">{displayClock}</span>
                </span>
              ) : activeGame.Status === 'Final' ? (
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold text-[11px]">
                  FINAL
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  {activeGame.Time || 'SCHEDULED'}
                </span>
              )}

              {displayDownDistance && (
                <span className="text-slate-300 hidden md:inline font-mono text-[11px]">
                  &bull; {displayDownDistance}
                </span>
              )}

              <span className="text-slate-400 hidden lg:inline text-[11px]">
                &bull; 🏟️ {activeGame.StadiumName}
              </span>
            </div>
          </div>

          {/* Quick Controls: Switch Game Toggle, Season, AI */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGamesMinimized(false)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition shadow-xs cursor-pointer"
              title="Click to view and switch between all matchups"
            >
              <span>Switch Game ({visibleGames.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {onOpenGoogleAi && (
              <button
                onClick={onOpenGoogleAi}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold transition"
                title="AI Coach Analysis for Selected Game"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Coach</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Full Expanded Game Slate Ticker */
        <div className="bg-[#111218] border border-amber-500/30 rounded-xl p-3 space-y-2.5 shadow-xl animate-fadeIn">
          {/* Header with Filters and Minimize Button */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-1.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>NFL GAMEDAY SLATE ({visibleGames.length} GAMES)</span>
              </span>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                {(['ALL', 'LIVE', 'FINAL'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2 py-0.5 rounded font-bold transition ${
                      statusFilter === filter
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsGamesMinimized(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono font-bold transition cursor-pointer"
            >
              <span>Minimize Slate</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Game Slate Ribbon with Team Logos */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-amber-500/30">
            {visibleGames.map((g) => {
              const isSelected = g.GameKey === selectedGameKey;
              return (
                <button
                  key={g.GameKey}
                  onClick={() => handleSelectGame(g.GameKey)}
                  className={`shrink-0 w-52 sm:w-56 p-2.5 rounded-xl text-left border transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                      : 'bg-[#181820] border-white/10 hover:border-white/25 hover:bg-[#1f202a]'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    {g.Status === 'InProgress' ? (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {g.Quarter || 'Q4'} {g.TimeRemaining || g.Clock || '02:15'}
                      </span>
                    ) : g.Status === 'Final' ? (
                      <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-bold">
                        FINAL
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {g.Time || 'SCHEDULED'}
                      </span>
                    )}

                    <span className="text-slate-400 text-[10px] font-bold">
                      {g.Channel || 'TV'}
                    </span>
                  </div>

                  {/* Away Team Row */}
                  <div className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2">
                      <TeamLogo teamKey={g.AwayTeam} size="sm" shape="circle" />
                      <span className="font-mono font-bold text-white text-xs">{g.AwayTeam}</span>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-sm">{g.AwayScore ?? 0}</span>
                  </div>

                  {/* Home Team Row */}
                  <div className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-2">
                      <TeamLogo teamKey={g.HomeTeam} size="sm" shape="circle" />
                      <span className="font-mono font-bold text-white text-xs">{g.HomeTeam}</span>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-sm">{g.HomeScore ?? 0}</span>
                  </div>

                  {/* Selected Active Flag */}
                  {isSelected && (
                    <div className="mt-1 pt-1 border-t border-amber-500/30 flex items-center justify-between text-[9px] font-mono text-amber-300 font-bold">
                      <span>✓ SYNCED ACTIVE</span>
                      <span>{g.StadiumCity || 'NFL'}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. COMBINED LEFT-TO-RIGHT GAMEDAY MENU BAR ("menu order: plays, red zone, possession, win%, odds") */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
        <nav className="flex items-center gap-1.5 flex-nowrap" aria-label="Gameday Navigation">
          {navTabs.map((tab) => {
            const isActive =
              activeView === tab.id || (tab.id === 'plays' && activeView === 'playbyplay');

            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id as ViewMode)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 select-none cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-[#14151b] text-slate-300 border-white/10 hover:border-white/25 hover:text-white hover:bg-[#1a1b24]'
                }`}
              >
                <span className="text-sm">{tab.emoji}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-black/30 text-slate-950'
                        : 'bg-white/10 text-amber-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.keyHint && (
                  <kbd
                    className={`text-[9px] font-mono px-1 py-0.2 rounded hidden lg:inline ${
                      isActive ? 'bg-black/30 text-slate-900' : 'bg-black/40 text-slate-400'
                    }`}
                  >
                    {tab.keyHint}
                  </kbd>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Season / Refresh Trigger */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-[#14151b] border border-white/10 text-slate-300 hover:text-white hover:border-amber-400 transition"
              title="Refresh Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
