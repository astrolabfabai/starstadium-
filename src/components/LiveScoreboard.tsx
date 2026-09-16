import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  RefreshCw,
  Clock,
  Flame,
  ChevronRight,
  Activity,
  Shield,
  Play,
  Pause,
  Zap,
  Award,
  Tv,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Settings,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { SCHEDULES_DATA, NFL_TEAMS } from '../data/sportsDataMock';
import { GameCenterModal } from './GameCenterModal';
import { LivePossessionRedZoneStats } from './LivePossessionRedZoneStats';
import { TeamLogo } from './TeamLogo';
import { AutoRefreshConfig } from '../types';

export interface LiveScoreboardGame {
  id: string;
  gameKey: string;
  name: string;
  shortName: string;
  date: string;
  awayTeam: {
    id?: number;
    name: string;
    abbreviation: string;
    score: number;
    record?: string;
    logo?: string;
    color?: string;
  };
  homeTeam: {
    id?: number;
    name: string;
    abbreviation: string;
    score: number;
    record?: string;
    logo?: string;
    color?: string;
  };
  quarter: string;
  clock: string;
  clockSeconds: number;
  playClock?: number;
  possession?: string;
  downDistance?: string;
  isRedZone?: boolean;
  status: 'InProgress' | 'Final' | 'Scheduled' | 'Halftime';
  statusDetail: string;
  broadcast?: string;
  venue?: string;
  odds?: {
    spread?: string;
    overUnder?: string;
  };
}

interface LiveScoreboardProps {
  onSelectGame?: (gameKey: string) => void;
  onOpenAiAssistant?: (prompt?: string) => void;
  className?: string;
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  onSelectGame,
  onOpenAiAssistant,
  className = ''
}) => {
  const [games, setGames] = useState<LiveScoreboardGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<string>('SportsData.io Live Feeds');
  
  // Auto-Refresh Configuration (disabled by default to prevent page autorefreshing)
  const [autoRefresh, setAutoRefresh] = useState<AutoRefreshConfig>({
    isEnabled: false,
    intervalSeconds: 20,
    lastRefreshTime: new Date().toISOString()
  });
  const [showRefreshSettings, setShowRefreshSettings] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(20);

  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [selectedGameForModal, setSelectedGameForModal] = useState<any | null>(null);
  const [selectedGameIdForStats, setSelectedGameIdForStats] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'final' | 'upcoming'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available interval choices for auto-refresh
  const refreshIntervalOptions = [5, 10, 15, 20, 30, 60];

  // Helper to sort games with those playing "now" strictly at the top
  const sortGamesPlayingNowFirst = (list: LiveScoreboardGame[]): LiveScoreboardGame[] => {
    return [...list].sort((a, b) => {
      const aLive = a.status === 'InProgress' || a.status === 'Halftime';
      const bLive = b.status === 'InProgress' || b.status === 'Halftime';
      if (aLive && !bLive) return -1; // playing now -> top
      if (!aLive && bLive) return 1;

      const aFinal = a.status === 'Final';
      const bFinal = b.status === 'Final';
      if (!aFinal && bFinal) return -1;
      if (aFinal && !bFinal) return 1;

      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeA - timeB;
    });
  };

  // Fetch real-time scores from SportsData API endpoint
  const fetchLiveScores = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const url = '/api/sportsdata/scores/live?week=1';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      if (data.games && Array.isArray(data.games) && data.games.length > 0) {
        // Filter strictly to current week's games and place games playing "now" at top
        const currentWeekGames = data.games.filter((g: any) => g.week === 1 || !g.week);
        const sorted = sortGamesPlayingNowFirst(currentWeekGames);
        setGames(sorted);
        setDataSource(
          data.source === 'sportsdata_io_live'
            ? 'SportsData.io Live Feed'
            : data.source === 'espn_realtime_feed'
            ? 'SportsData & Real-Time Sync'
            : 'SportsData.io API Cache'
        );
        setLastUpdated(new Date().toLocaleTimeString());
        setAutoRefresh((prev) => ({ ...prev, lastRefreshTime: new Date().toISOString() }));
        setCountdownSeconds(autoRefresh.intervalSeconds);
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Could not reach live scores endpoint, using robust fallback:', err?.message);
      setErrorMessage('Using local SportsData cache');
    }

    // High-Fidelity Fallback strictly using CURRENT WEEK'S games (Week 1 of 2026)
    const currentWeekSchedules = SCHEDULES_DATA.filter((g) => g.Season === 2026 && g.Week === 1);
    const fallbackList: LiveScoreboardGame[] = currentWeekSchedules.map((g, idx) => {
      const isLive = g.Status === 'InProgress';
      const isFinal = g.Status === 'Final';
      const homeTeamInfo = NFL_TEAMS.find((t) => t.Key === g.HomeTeam);
      const awayTeamInfo = NFL_TEAMS.find((t) => t.Key === g.AwayTeam);

      return {
        id: g.GameKey || `game-${idx}`,
        gameKey: g.GameKey,
        name: `${awayTeamInfo ? awayTeamInfo.FullName : g.AwayTeam} at ${homeTeamInfo ? homeTeamInfo.FullName : g.HomeTeam}`,
        shortName: `${g.AwayTeam} @ ${g.HomeTeam}`,
        date: g.Date || new Date().toISOString(),
        awayTeam: {
          name: awayTeamInfo ? awayTeamInfo.FullName : g.AwayTeam,
          abbreviation: g.AwayTeam,
          score: g.AwayScore ?? 0,
          record: '2-1',
          color: awayTeamInfo ? `#${awayTeamInfo.PrimaryColor}` : '#ef4444'
        },
        homeTeam: {
          name: homeTeamInfo ? homeTeamInfo.FullName : g.HomeTeam,
          abbreviation: g.HomeTeam,
          score: g.HomeScore ?? 0,
          record: '3-0',
          color: homeTeamInfo ? `#${homeTeamInfo.PrimaryColor}` : '#3b82f6'
        },
        quarter: g.Quarter || (isLive ? 'Q4' : (isFinal ? 'Final' : 'Pregame')),
        clock: g.TimeRemaining || (isLive ? '02:15' : '0:00'),
        clockSeconds: g.ClockSeconds ?? (isLive ? 135 : 0),
        playClock: g.PlayClock ?? (isLive ? 22 : 0),
        possession: g.Possession || (isLive ? g.AwayTeam : ''),
        downDistance: g.DownDistance || (isLive ? '1st & 10' : (isFinal ? 'Final' : 'Pregame')),
        isRedZone: isLive && Boolean(g.DownDistance && g.DownDistance.includes('Red Zone')),
        status: isLive ? 'InProgress' : (isFinal ? 'Final' : 'Scheduled'),
        statusDetail: isLive
          ? `${g.Quarter || 'Q4'} ${g.TimeRemaining || '02:15'}`
          : (isFinal ? 'Final Score' : `${g.Date} ${g.Time ? `${g.Time} ET` : 'Upcoming'}`),
        broadcast: g.Channel || 'FOX',
        venue: `${g.StadiumName || 'NFL Stadium'}, ${g.StadiumCity || 'City'}`,
        odds: {
          spread: g.PointSpread ? `${g.PointSpread > 0 ? '+' : ''}${g.PointSpread}` : '-3.5',
          overUnder: g.OverUnder ? `O/U ${g.OverUnder}` : 'O/U 48.5'
        }
      };
    });

    const sortedFallback = sortGamesPlayingNowFirst(fallbackList);
    setGames(sortedFallback);
    setIsLoading(false);
    setLastUpdated(new Date().toLocaleTimeString());
    setCountdownSeconds(autoRefresh.intervalSeconds);
  };

  // Initial load
  useEffect(() => {
    fetchLiveScores();
  }, []);

  // Auto-Refresh: Only auto-refresh in background when live games are actively playing
  const hasLiveGames = games.some((g) => g.status === 'InProgress' || g.status === 'Halftime');

  useEffect(() => {
    if (!hasLiveGames) return;

    const timer = setInterval(() => {
      fetchLiveScores();
    }, 15000); // 15 seconds live game score refresh

    return () => clearInterval(timer);
  }, [hasLiveGames]);

  // Filter games according to active filter tab, keeping games playing "now" at the top
  const filteredGames = sortGamesPlayingNowFirst(
    games.filter((g) => {
      if (activeFilter === 'live') return g.status === 'InProgress' || g.status === 'Halftime';
      if (activeFilter === 'final') return g.status === 'Final';
      if (activeFilter === 'upcoming') return g.status === 'Scheduled';
      return true;
    })
  );

  const liveCount = games.filter((g) => g.status === 'InProgress' || g.status === 'Halftime').length;
  const finalCount = games.filter((g) => g.status === 'Final').length;

  // Auto-select first active/in-progress game on load
  useEffect(() => {
    if (games.length > 0 && !selectedGameIdForStats) {
      const firstLive = games.find((g) => g.status === 'InProgress') || games[0];
      if (firstLive) {
        setSelectedGameIdForStats(firstLive.id);
      }
    }
  }, [games]);

  const handleGameCardClick = (game: LiveScoreboardGame) => {
    setSelectedGameIdForStats((prevId) => (prevId === game.id ? null : game.id));
  };

  const handleOpenGameCenter = (game: LiveScoreboardGame, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSelectGame) {
      onSelectGame(game.gameKey);
    } else {
      const scheduleMatch = SCHEDULES_DATA.find((s) => s.GameKey === game.gameKey) || {
        GameKey: game.gameKey,
        Season: 2026,
        Week: 4,
        Date: game.date,
        AwayTeam: game.awayTeam.abbreviation,
        HomeTeam: game.homeTeam.abbreviation,
        AwayScore: game.awayTeam.score,
        HomeScore: game.homeTeam.score,
        Quarter: game.quarter,
        TimeRemaining: game.clock,
        StadiumName: game.venue?.split(',')?.[0] || 'NFL Stadium',
        StadiumCity: game.venue?.split(',')?.[1]?.trim() || 'City',
        Channel: game.broadcast || 'NBC',
        PointSpread: -3.5,
        OverUnder: 48.5,
        Status: game.status
      };
      setSelectedGameForModal(scheduleMatch);
    }
  };

  const selectedGameForStats = games.find((g) => g.id === selectedGameIdForStats);

  return (
    <section
      id="live-nfl-scoreboard"
      aria-label="Live NFL Scoreboard"
      className={`bg-[#0e0e12] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/3 w-80 h-32 bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls & Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Indicator Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE NFL SCOREBOARD</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
            <span className="hidden md:inline font-mono text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {dataSource}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Updated {lastUpdated}
            </span>
          </div>
        </div>

        {/* Filter Pills, Auto-Refresh Interval & Controls */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Status Filter Chips */}
          <div className="flex items-center bg-[#09090b] p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({games.length})
            </button>
            <button
              onClick={() => setActiveFilter('live')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activeFilter === 'live'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live ({liveCount})
            </button>
            <button
              onClick={() => setActiveFilter('final')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                activeFilter === 'final'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Final ({finalCount})
            </button>
          </div>

          {/* Live Feed Status Badge */}
          {hasLiveGames && (
            <div className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <span className="font-mono text-[11px]">Live Scores</span>
            </div>
          )}

          {/* Auto Refresh Setting Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowRefreshSettings(!showRefreshSettings)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
                autoRefresh.isEnabled
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
                  : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Configure live data auto-refresh interval"
            >
              <Sliders className="w-3 h-3" />
              <span>
                {autoRefresh.isEnabled ? `Auto: ${countdownSeconds}s` : 'Auto: OFF'}
              </span>
            </button>

            {/* Auto-Refresh Dropdown Menu */}
            {showRefreshSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#14141c] border border-white/15 rounded-xl shadow-2xl p-3 z-50 text-xs font-mono space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    Auto-Refresh Setting
                  </span>
                  <button
                    onClick={() =>
                      setAutoRefresh((prev) => ({
                        ...prev,
                        isEnabled: !prev.isEnabled
                      }))
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      autoRefresh.isEnabled
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {autoRefresh.isEnabled ? 'ENABLED' : 'PAUSED'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 block font-sans">
                    Refresh Interval Frequency:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {refreshIntervalOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setAutoRefresh((prev) => ({ ...prev, intervalSeconds: opt, isEnabled: true }));
                          setCountdownSeconds(opt);
                        }}
                        className={`py-1 px-1.5 rounded text-[11px] font-bold border transition-all ${
                          autoRefresh.intervalSeconds === opt && autoRefresh.isEnabled
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-black/40 text-slate-300 border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {opt}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Next Sync: {autoRefresh.isEnabled ? `${countdownSeconds}s` : 'Paused'}</span>
                  <button
                    onClick={() => {
                      fetchLiveScores();
                      setShowRefreshSettings(false);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold underline"
                  >
                    Refresh Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manual Refresh Action */}
          <button
            onClick={fetchLiveScores}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-[#18181b] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
            title="Fetch fresh NFL scores from SportsData.io"
            aria-label="Refresh Scores"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Matchup Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
        {filteredGames.map((game) => {
          const isLive = game.status === 'InProgress';
          const isHalftime = game.status === 'Halftime';
          const isFinal = game.status === 'Final';
          const isAwayLeading = game.awayTeam.score > game.homeTeam.score;
          const isHomeLeading = game.homeTeam.score > game.awayTeam.score;
          const isSelected = game.id === selectedGameIdForStats;

          return (
            <div
              key={game.id}
              onClick={() => handleGameCardClick(game)}
              className={`group border rounded-xl p-3.5 transition-all duration-200 cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#181822] ring-2 ring-amber-500 border-amber-500 shadow-amber-500/25 scale-[1.01]'
                  : isLive
                  ? 'bg-[#141418] hover:bg-[#1a1a20] border-emerald-500/40 hover:border-emerald-500 shadow-emerald-950/20'
                  : 'bg-[#141418] hover:bg-[#1a1a20] border-white/10 hover:border-amber-500/50'
              }`}
            >
              {/* Red Zone Banner Accent */}
              {isLive && game.isRedZone && (
                <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-[9px] font-black text-white text-center py-0.5 tracking-wider uppercase flex items-center justify-center gap-1 shadow-sm z-10">
                  <Flame className="w-3 h-3 animate-bounce" />
                  <span>RED ZONE ALERT &bull; {game.possession} ON DRIVE</span>
                </div>
              )}

              {/* Matchup Header: Status & Broadcast Channel */}
              <div className={`flex justify-between items-center text-xs pb-2.5 border-b border-white/5 ${isLive && game.isRedZone ? 'pt-3' : ''}`}>
                <div className="flex items-center gap-2">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {game.quarter} {game.clock}
                    </span>
                  ) : isHalftime ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[11px] border border-amber-500/30">
                      HALFTIME
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono font-semibold text-[11px]">
                      {isFinal ? 'FINAL' : game.statusDetail}
                    </span>
                  )}

                  {isSelected && (
                    <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-mono font-black text-[9px] uppercase tracking-wider">
                      Telemetry Open
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  {game.broadcast && (
                    <span className="bg-white/5 px-1.5 py-0.5 rounded text-amber-400 font-bold border border-white/10">
                      {game.broadcast}
                    </span>
                  )}
                  {game.odds?.spread && (
                    <span className="text-slate-300 font-semibold">{game.odds.spread}</span>
                  )}
                </div>
              </div>

              {/* Matchup Team Scores Row */}
              <div className="py-3 space-y-2">
                {/* Away Team */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <TeamLogo
                      teamKey={game.awayTeam.abbreviation}
                      teamName={game.awayTeam.name}
                      logoUrl={game.awayTeam.logo}
                      size="md"
                      shape="circle"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-extrabold ${isAwayLeading ? 'text-white' : 'text-slate-300'}`}>
                          {game.awayTeam.name}
                        </span>
                        {isLive && game.possession === game.awayTeam.abbreviation && (
                          <span className="text-amber-400 text-xs animate-pulse" title="In Possession">🏈</span>
                        )}
                      </div>
                      {game.awayTeam.record && (
                        <span className="text-[10px] text-slate-500 font-mono">{game.awayTeam.record}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xl font-mono font-black ${
                    isAwayLeading ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {game.awayTeam.score}
                  </span>
                </div>

                {/* Home Team */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <TeamLogo
                      teamKey={game.homeTeam.abbreviation}
                      teamName={game.homeTeam.name}
                      logoUrl={game.homeTeam.logo}
                      size="md"
                      shape="circle"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-extrabold ${isHomeLeading ? 'text-white' : 'text-slate-300'}`}>
                          {game.homeTeam.name}
                        </span>
                        {isLive && game.possession === game.homeTeam.abbreviation && (
                          <span className="text-amber-400 text-xs animate-pulse" title="In Possession">🏈</span>
                        )}
                      </div>
                      {game.homeTeam.record && (
                        <span className="text-[10px] text-slate-500 font-mono">{game.homeTeam.record}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xl font-mono font-black ${
                    isHomeLeading ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {game.homeTeam.score}
                  </span>
                </div>
              </div>

              {/* Matchup Footer: Down & Distance, Telemetry Trigger & Box Score */}
              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                {isLive && game.downDistance ? (
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate text-[10.5px] font-bold text-amber-400">{game.downDistance}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 truncate max-w-[140px]">{game.venue}</span>
                )}

                <div className="flex items-center gap-2 shrink-0 ml-1">
                  <span className={`text-[10px] font-mono flex items-center gap-0.5 ${isSelected ? 'text-amber-400 font-bold' : 'text-slate-400 group-hover:text-rose-400'}`}>
                    <Flame className="w-3 h-3 text-rose-500" />
                    {isSelected ? 'Stats Active' : 'Telemetry'}
                  </span>

                  <button
                    onClick={(e) => handleOpenGameCenter(game, e)}
                    className="flex items-center gap-0.5 text-[10px] font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded border border-white/5 transition-all"
                    title="Open full box score & film room"
                  >
                    <span>Box</span>
                    <ChevronRight className="w-3 h-3 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Possession & Red-Zone Telemetry Panel */}
      {selectedGameForStats && (
        <LivePossessionRedZoneStats
          game={selectedGameForStats}
          onClose={() => setSelectedGameIdForStats(null)}
          onOpenGameCenter={() => handleOpenGameCenter(selectedGameForStats)}
          onOpenAiAssistant={onOpenAiAssistant}
        />
      )}

      {/* Game Center Detailed Box Score Modal */}
      {selectedGameForModal && (
        <GameCenterModal
          isOpen={true}
          onClose={() => setSelectedGameForModal(null)}
          game={selectedGameForModal}
        />
      )}
    </section>
  );
};
