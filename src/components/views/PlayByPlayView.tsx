import React, { useState, useEffect } from 'react';
import { SeasonCode, SEASONS_LIST, PlayByPlayEvent, GameSchedule } from '../../types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { SCHEDULES_DATA } from '../../data/sportsDataMock';
import { getPlaysForGame } from '../../data/gamePlaysData';
import { getPlayTacticalConcept } from '../../data/footballDiagramsData';
import { GridironTacticalCanvas } from '../football/GridironTacticalCanvas';
import { WinProbabilityChart } from '../football/WinProbabilityChart';
import { TeamLogo } from '../TeamLogo';
import { exportPlayAnimationsAsHtml, exportPlayAnimationsAsJson, exportCoachingReport } from '../../utils/playAnimationsExporter';
import { MOCK_HIGHLIGHT_VIDEOS } from '../../data/highlightVideosData';
import { HighlightVideoItem } from '../../types';
import { YouTubePlayerModal } from '../video/YouTubePlayerModal';
import {
  Activity,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Zap,
  Shield,
  Calendar,
  Layers,
  Sparkles,
  Target,
  ChevronRight,
  TrendingUp,
  Clock,
  Radio,
  Download,
  Film,
  X,
  FileCode,
  FileText,
  Sliders,
  Filter,
  Tv,
  Youtube,
  Minus,
  Plus,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const PLAY_TYPE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface PlayByPlayViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  selectedGameKey?: string;
  initialGameKey?: string;
  onSelectGameKey?: (gameKey: string) => void;
}

export const PlayByPlayView: React.FC<PlayByPlayViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange,
  selectedGameKey: propSelectedGameKey,
  initialGameKey,
  onSelectGameKey
}) => {
  // Available games in this season
  const gamesForSeason = SCHEDULES_DATA.filter((g) => {
    const s = String(selectedSeason || '');
    if (s.startsWith('2026') && g.Season === 2026) return true;
    if (s.startsWith('2025') && g.Season === 2025) return true;
    if (s.startsWith('2024') && g.Season === 2024) return true;
    if (s.startsWith('2023') && g.Season === 2023) return true;
    return true;
  });

  const [selectedGameKey, setSelectedGameKey] = useState<string>(
    propSelectedGameKey || initialGameKey || gamesForSeason[0]?.GameKey || '202610203'
  );

  // Synchronize when parent passes a new selectedGameKey (e.g. from Scoreboard or Schedule)
  useEffect(() => {
    if (propSelectedGameKey && propSelectedGameKey !== selectedGameKey) {
      setSelectedGameKey(propSelectedGameKey);
    }
  }, [propSelectedGameKey]);

  // Minimize states for each widget / module
  const [isGamesListMinimized, setIsGamesListMinimized] = useState<boolean>(false);
  const [isFieldMinimized, setIsFieldMinimized] = useState<boolean>(false);
  const [isStepperMinimized, setIsStepperMinimized] = useState<boolean>(false);
  const [isTelemetryMinimized, setIsTelemetryMinimized] = useState<boolean>(false);
  const [isWinProbMinimized, setIsWinProbMinimized] = useState<boolean>(false);
  const [isPlayLogMinimized, setIsPlayLogMinimized] = useState<boolean>(false);

  // Helper to parse "mm:ss" to total seconds
  const parseTimeToSeconds = (tStr: string | undefined): number => {
    if (!tStr) return 900;
    const parts = String(tStr).split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      return mins * 60 + secs;
    }
    return 900;
  };

  const [clockSeconds, setClockSeconds] = useState<number>(900);
  const [playClockSeconds, setPlayClockSeconds] = useState<number>(25);
  const [isLiveClockTicking, setIsLiveClockTicking] = useState<boolean>(true);

  const handleSelectGame = (gameKey: string) => {
    setSelectedGameKey(gameKey);
    setIsGamesListMinimized(true); // Auto-minimize the list of live games on selection!
    if (onSelectGameKey) {
      onSelectGameKey(gameKey);
    }
  };

  const [gameStatusFilter, setGameStatusFilter] = useState<'ALL' | 'LIVE' | 'FINAL'>('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'ALL'>('ALL');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(1);
  const [isRoutesAnimating, setIsRoutesAnimating] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFilmRoomModalOpen, setIsFilmRoomModalOpen] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<HighlightVideoItem | null>(null);

  // Selected game - checks gamesForSeason first, then full SCHEDULES_DATA
  const activeGame =
    gamesForSeason.find((g) => g.GameKey === selectedGameKey) ||
    SCHEDULES_DATA.find((g) => g.GameKey === selectedGameKey) ||
    gamesForSeason[0] ||
    SCHEDULES_DATA[0];

  // Dynamic plays for the selected game (Live or Final)
  const gamePlays = getPlaysForGame(
    activeGame?.GameKey || '202610203',
    activeGame?.AwayTeam || 'BAL',
    activeGame?.HomeTeam || 'KC',
    activeGame?.Status || 'Final'
  );

  const filteredPlays = gamePlays.filter((p) => {
    if (selectedQuarter !== 'ALL' && p.Quarter !== selectedQuarter) return false;
    return true;
  });

  const fallbackPlay: PlayByPlayEvent = {
    PlayID: 9001,
    GameID: Number(activeGame?.GameKey) || 202610203,
    Quarter: 1,
    TimeRemaining: '15:00',
    Possession: activeGame?.HomeTeam || 'KC',
    Down: 1,
    Distance: 10,
    YardLine: 25,
    YardLineSide: activeGame?.HomeTeam || 'KC',
    Description: `Kickoff and opening tactical drive. Ready for chalkboard simulation.`,
    PlayType: 'Pass',
    YardsGained: 6,
    IsBigPlay: false,
    WinProbabilityPct: 54.0
  };

  const [selectedPlayId, setSelectedPlayId] = useState<number>(filteredPlays[0]?.PlayID || 5001);

  // When game or filter changes, reset selected play if needed
  useEffect(() => {
    if (filteredPlays.length > 0) {
      setSelectedPlayId(filteredPlays[0].PlayID);
      setSelectedNodeId(null);
    }
  }, [selectedGameKey, selectedQuarter]);

  const activePlay = filteredPlays.find((p) => p.PlayID === selectedPlayId) || filteredPlays[0] || gamePlays[0] || fallbackPlay;
  const activePlayConcept = getPlayTacticalConcept(activePlay);
  const activePlayIndex = filteredPlays.findIndex((p) => p.PlayID === selectedPlayId);
  const currentPlayIndexNumber = activePlayIndex >= 0 ? activePlayIndex + 1 : 1;

  // Synchronize game clock ticker with active play and SportsData.io play-by-play feed
  useEffect(() => {
    if (activePlay?.TimeRemaining) {
      setClockSeconds(parseTimeToSeconds(activePlay.TimeRemaining));
      setPlayClockSeconds(25);
    }
  }, [activePlay?.TimeRemaining, activePlay?.PlayID]);

  // Real-time ticking effect
  useEffect(() => {
    if (!isLiveClockTicking) return;
    const interval = setInterval(() => {
      setClockSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setPlayClockSeconds((prev) => (prev > 0 ? prev - 1 : 40));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveClockTicking]);

  const formatClockTime = (totalSecs: number): string => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Auto-step through play sequence
  useEffect(() => {
    if (!isAutoPlaying || filteredPlays.length === 0) return;

    const intervalTime = Math.max(2000, 4500 / autoSpeed);
    const timer = setInterval(() => {
      setSelectedPlayId((currentId) => {
        const currentIndex = filteredPlays.findIndex((p) => p.PlayID === currentId);
        const nextIndex = (currentIndex + 1) % filteredPlays.length;
        return filteredPlays[nextIndex].PlayID;
      });
      setSelectedNodeId(null);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, autoSpeed, filteredPlays]);

  // Keyboard navigation for step back and step forward (Left / Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredPlays, selectedPlayId]);

  const handlePrevPlay = () => {
    const currentIndex = filteredPlays.findIndex((p) => p.PlayID === selectedPlayId);
    const prevIndex = (currentIndex - 1 + filteredPlays.length) % filteredPlays.length;
    setSelectedPlayId(filteredPlays[prevIndex].PlayID);
    setSelectedNodeId(null);
  };

  const handleNextPlay = () => {
    const currentIndex = filteredPlays.findIndex((p) => p.PlayID === selectedPlayId);
    const nextIndex = (currentIndex + 1) % filteredPlays.length;
    setSelectedPlayId(filteredPlays[nextIndex].PlayID);
    setSelectedNodeId(null);
  };

  const visibleGames = gamesForSeason.filter((g) => {
    if (gameStatusFilter === 'LIVE') return g.Status === 'InProgress';
    if (gameStatusFilter === 'FINAL') return g.Status === 'Final';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* REAL-TIME BROADCAST SCOREBOARD & GAME CLOCK TICKER HEADER */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Top Control Bar: Season & Film/Export */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              🏈 NFL GRIDIRON TACTICAL ENGINE
            </span>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <span>🏟️ {activeGame.StadiumName}</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-amber-400 font-bold">
                {activeGame.Status === 'InProgress' ? '🔴 LIVE' : activeGame.Status === 'Final' ? '🏁 FINAL' : '📅 SCHEDULED'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {/* Season Selector */}
            {onSeasonChange && (
              <div className="flex items-center gap-1.5 bg-[#09090b] px-2.5 py-1 rounded-xl border border-white/10 text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <select
                  value={selectedSeason}
                  onChange={(e) => onSeasonChange(e.target.value as SeasonCode)}
                  className="bg-transparent text-amber-400 font-bold font-mono focus:outline-none cursor-pointer text-xs"
                >
                  {SEASONS_LIST.map((s) => (
                    <option key={s.code} value={s.code} className="bg-[#121214] text-slate-200">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Film Room & Video Highlights */}
            <button
              onClick={() => {
                const hlVid = MOCK_HIGHLIGHT_VIDEOS.find(
                  (v) => v.gameKey === activeGame.GameKey && (v.category === 'HIGHLIGHTS' || v.videoType === 'HIGHLIGHTS')
                ) || MOCK_HIGHLIGHT_VIDEOS[1];
                setActiveVideoModal(hlVid);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition"
              title="Watch Highlights"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>📺 Highlights</span>
            </button>

            <button
              onClick={() => setIsFilmRoomModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs transition shadow-md"
            >
              <Film className="w-3.5 h-3.5" />
              <span>🎬 Film Theater</span>
            </button>
          </div>
        </div>

        {/* STADIUM SCOREBOARD & REAL-TIME CLOCK TICKER */}
        <div className="bg-[#0b0b0e] border border-white/10 rounded-xl p-3.5 sm:p-4 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            {/* Away Team */}
            <div className="md:col-span-3 flex items-center justify-start gap-3">
              <TeamLogo teamKey={activeGame.AwayTeam} size="lg" shape="circle" />
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Away</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-wide">
                  {activeGame.AwayTeam}
                </span>
                <span className="ml-2 text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  {activeGame.AwayScore ?? 0}
                </span>
              </div>
            </div>

            {/* CENTER REAL-TIME GAME CLOCK TICKER (Synchronized with SportsData.io) */}
            <div className="md:col-span-6 flex flex-col items-center justify-center text-center space-y-2 py-1">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {/* Quarter Badge */}
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 font-mono font-black text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Q{activePlay.Quarter}
                </span>

                {/* Real-time Game Clock LCD Readout */}
                <div className="flex items-center gap-1 bg-black/80 border border-amber-500/40 px-4 py-1 rounded-xl shadow-lg shadow-amber-500/10">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 tracking-wider">
                    {formatClockTime(clockSeconds)}
                  </span>
                </div>

                {/* NFL Play Clock (40s / 25s ticker) */}
                <div
                  className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black border transition-all ${
                    playClockSeconds <= 5
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                      : playClockSeconds <= 15
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                  title="NFL Play Clock"
                >
                  :{playClockSeconds < 10 ? '0' : ''}{playClockSeconds}
                </div>

                {/* Clock Ticker Controls */}
                <button
                  onClick={() => setIsLiveClockTicking(!isLiveClockTicking)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                    isLiveClockTicking
                      ? 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                  title={isLiveClockTicking ? 'Pause Live Clock Ticker' : 'Start Live Clock Ticker'}
                >
                  {isLiveClockTicking ? '⏸️' : '▶️'}
                </button>

                <button
                  onClick={() => {
                    setClockSeconds(parseTimeToSeconds(activePlay.TimeRemaining));
                    setPlayClockSeconds(25);
                  }}
                  className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 transition"
                  title="Reset clock to active play timestamp"
                >
                  🔄 Sync
                </button>
              </div>

              {/* Down & Distance & Ball Spot with Possession Logo */}
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
                <TeamLogo teamKey={activePlay.Possession} size="xs" shape="circle" />
                <span className="text-amber-400">
                  {activePlay.Down === 1 ? '1st' : activePlay.Down === 2 ? '2nd' : activePlay.Down === 3 ? '3rd' : '4th'} &amp; {activePlay.Distance}
                </span>
                <span className="text-slate-500">&bull;</span>
                <span>Ball on {activePlay.YardLineSide} {activePlay.YardLine}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-emerald-400">{activePlay.PlayType || 'Play'}</span>
              </div>

              {/* SportsData.io Sync Feed Badge */}
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SportsData.io Live Play-by-Play Feed Synced</span>
              </div>
            </div>

            {/* Home Team */}
            <div className="md:col-span-3 flex items-center justify-end gap-3 text-right">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Home</span>
                <span className="mr-2 text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  {activeGame.HomeScore ?? 0}
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-wide">
                  {activeGame.HomeTeam}
                </span>
              </div>
              <TeamLogo teamKey={activeGame.HomeTeam} size="lg" shape="circle" />
            </div>
          </div>
        </div>

        {/* MATCHUPS SECTION WITH AUTO-MINIMIZE ON CLICK */}
        {isGamesListMinimized ? (
          /* Minimized Strip */
          <div className="bg-[#09090c] border border-white/10 rounded-xl px-3 py-2 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span className="text-slate-400 text-[11px] uppercase font-bold">Selected Game:</span>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <TeamLogo teamKey={activeGame.AwayTeam} size="xs" shape="circle" />
                <span className="font-bold text-white">{activeGame.AwayTeam} {activeGame.AwayScore ?? 0}</span>
                <span className="text-slate-500">@</span>
                <TeamLogo teamKey={activeGame.HomeTeam} size="xs" shape="circle" />
                <span className="font-bold text-white">{activeGame.HomeTeam} {activeGame.HomeScore ?? 0}</span>
              </div>
              <span className="text-slate-400 hidden md:inline">&bull; {activeGame.StadiumName}</span>
            </div>

            <button
              onClick={() => setIsGamesListMinimized(false)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition cursor-pointer"
            >
              <span>Show All Matchups ({visibleGames.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Expanded Matchups List */
          <div className="space-y-2 bg-[#09090c] border border-white/10 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-amber-500" /> Choose Game:
                </span>
                {/* Game status filter */}
                <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                  <button
                    onClick={() => setGameStatusFilter('ALL')}
                    className={`px-2 py-0.5 rounded ${gameStatusFilter === 'ALL' ? 'bg-white/20 text-white font-bold' : 'text-slate-400'}`}
                  >
                    All ({gamesForSeason.length})
                  </button>
                  <button
                    onClick={() => setGameStatusFilter((prev) => prev === 'LIVE' ? 'ALL' : 'LIVE')}
                    className="px-2 py-0.5 rounded flex items-center gap-1 bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>LIVE</span>
                  </button>
                  <button
                    onClick={() => setGameStatusFilter('FINAL')}
                    className={`px-2 py-0.5 rounded ${gameStatusFilter === 'FINAL' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-400'}`}
                  >
                    Finals
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsGamesListMinimized(true)}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10"
                title="Minimize matchups list"
              >
                <Minus className="w-3 h-3" />
                <span>Minimize Matchups</span>
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>

            {/* Horizontal scrollable Game Cards */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {visibleGames.map((g) => {
                const isSelected = g.GameKey === selectedGameKey;
                const isLive = g.Status === 'InProgress';
                return (
                  <button
                    key={g.GameKey}
                    onClick={() => handleSelectGame(g.GameKey)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2.5 shrink-0 transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                        : 'bg-[#09090b] text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="tracking-wide flex items-center gap-1.5">
                      <TeamLogo teamKey={g.AwayTeam} size="xs" shape="circle" showBackground={!isSelected} />
                      <span>{g.AwayTeam} {g.AwayScore ?? 0}</span>
                      <span className="opacity-40 font-normal">@</span>
                      <TeamLogo teamKey={g.HomeTeam} size="xs" shape="circle" showBackground={!isSelected} />
                      <span>{g.HomeTeam} {g.HomeScore ?? 0}</span>
                    </span>
                    {isLive ? (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${isSelected ? 'bg-slate-950 text-rose-400' : 'bg-rose-500/20 text-rose-300 animate-pulse'}`}>
                        🔴 {g.Quarter || 'LIVE'}
                      </span>
                    ) : g.Status === 'Final' ? (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${isSelected ? 'bg-slate-950 text-slate-200' : 'bg-slate-800 text-slate-400'}`}>
                        FINAL
                      </span>
                    ) : (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-white/5 text-slate-400">
                        UPCOMING
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TACTICAL VISUALIZER & PLAY REEL HERO COMPONENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: THE GRIDIRON TACTICAL CANVAS & REEL CONTROLS (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Football Play Number & Situation Header */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <TeamLogo teamKey={activePlay.Possession} size="sm" shape="circle" />
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-black text-xs border border-amber-500/30">
                FOOTBALL PLAY #{currentPlayIndexNumber} OF {filteredPlays.length}
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-white">
                {activePlay.Down === 1 ? '1st' : activePlay.Down === 2 ? '2nd' : activePlay.Down === 3 ? '3rd' : '4th'} &amp; {activePlay.Distance} &bull; {activePlay.YardLineSide} {activePlay.YardLine}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="text-emerald-400 font-semibold">{activePlay.PlayType || 'Play Action'}</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-300">Q{activePlay.Quarter} ({activePlay.TimeRemaining})</span>
            </div>
          </div>

          {/* Football Play Stepper Progress & Step Numbers Strip (With Minimize) */}
          <div className="bg-[#0e0e11] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-md shadow-amber-500/20">
                  PLAY #{currentPlayIndexNumber}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Play {currentPlayIndexNumber} of {filteredPlays.length} in Sequence
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-400/90 font-semibold hidden sm:inline-block">
                  {activePlay.Down === 1 ? '1st' : activePlay.Down === 2 ? '2nd' : activePlay.Down === 3 ? '3rd' : '4th'} &amp; {activePlay.Distance} &bull; {activePlay.YardLineSide} {activePlay.YardLine}
                </span>
                <button
                  onClick={() => setIsStepperMinimized(!isStepperMinimized)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 border border-white/10"
                  title={isStepperMinimized ? 'Expand Stepper' : 'Minimize Stepper'}
                >
                  {isStepperMinimized ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  <span>{isStepperMinimized ? 'Expand' : 'Minimize'}</span>
                </button>
              </div>
            </div>

            {!isStepperMinimized && (
              <>
                {/* Micro Stepper Pills for Sequence Progress */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {filteredPlays.map((p, idx) => {
                    const stepNum = idx + 1;
                    const isCurrent = idx === activePlayIndex;
                    const isPast = idx < activePlayIndex;

                    return (
                      <button
                        key={p.PlayID}
                        onClick={() => {
                          setSelectedPlayId(p.PlayID);
                          setSelectedNodeId(null);
                        }}
                        title={`Football Play #${stepNum}: Q${p.Quarter} ${p.TimeRemaining}`}
                        className={`shrink-0 px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/30'
                            : isPast
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-[#18181b] text-slate-400 hover:text-white border border-white/10 hover:border-white/25'
                        }`}
                      >
                        <span className="opacity-70">#</span>
                        <span>{stepNum}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stepper Control Ribbon */}
                <div className="bg-[#121214] border border-white/10 rounded-xl p-2.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Prev & Next Step Buttons */}
                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={handlePrevPlay}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1 transition font-mono"
                        title="Step Backward (Left Arrow ◄)"
                      >
                        <SkipBack className="w-3.5 h-3.5 text-amber-400" />
                        <span>⏮️ Prev</span>
                      </button>
                      <button
                        onClick={handleNextPlay}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1 transition font-mono"
                        title="Step Forward (Right Arrow ►)"
                      >
                        <span>Next ⏭️</span>
                        <SkipForward className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>

                    {/* Auto Play Reel */}
                    <button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition shadow-sm ${
                        isAutoPlaying
                          ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                      }`}
                    >
                      {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isAutoPlaying ? '⏸️ Pause' : '▶️ Auto Reel'}</span>
                    </button>

                    {/* Speed Multiplier */}
                    <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-white/10 text-[10px] font-mono text-slate-400">
                      <span>⚡ Speed:</span>
                      {[1, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setAutoSpeed(spd)}
                          className={`px-1.5 py-0.5 rounded font-bold transition ${
                            autoSpeed === spd
                              ? 'bg-amber-500 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Route Animation Toggle & Quarter Segmented Controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isRoutesAnimating}
                        onChange={(e) => setIsRoutesAnimating(e.target.checked)}
                        className="rounded border-white/20 bg-black/60 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" /> 📐 Routes
                      </span>
                    </label>

                    {/* Quarter Filter Chips */}
                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
                      {[
                        { id: 'ALL', label: '🌐 All' },
                        { id: 1, label: '1️⃣ Q1' },
                        { id: 2, label: '2️⃣ Q2' },
                        { id: 3, label: '3️⃣ Q3' },
                        { id: 4, label: '4️⃣ Q4' }
                      ].map((q) => (
                        <button
                          key={String(q.id)}
                          onClick={() => setSelectedQuarter(q.id as any)}
                          className={`px-2 py-0.5 rounded font-bold transition ${
                            selectedQuarter === q.id
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* THE GRIDIRON TACTICAL CANVAS CHALKBOARD (With Minimize) */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-4 py-2.5 bg-[#18181d] border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white flex items-center gap-1.5">
                  <span>🏈 Gridiron Tactical Chalkboard</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">&bull; 22-Player Animated Coordinates</span>
                </h3>
              </div>
              <button
                onClick={() => setIsFieldMinimized(!isFieldMinimized)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 border border-white/10 cursor-pointer"
                title={isFieldMinimized ? 'Expand Canvas' : 'Minimize Canvas'}
              >
                {isFieldMinimized ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                <span>{isFieldMinimized ? 'Expand Field' : 'Minimize Field'}</span>
              </button>
            </div>

            {isFieldMinimized ? (
              <div
                onClick={() => setIsFieldMinimized(false)}
                className="p-4 text-center cursor-pointer hover:bg-white/5 transition flex items-center justify-center gap-2 text-xs font-mono text-slate-300"
              >
                <span>🏈 Chalkboard Canvas Minimized &bull; <strong>{activePlay.playConceptName || activePlayConcept.name}</strong> (Ball on {activePlay.YardLineSide} {activePlay.YardLine})</span>
                <span className="text-amber-400 font-bold underline ml-2">[Click to Expand]</span>
              </div>
            ) : (
              <div className="p-2 sm:p-3">
                <GridironTacticalCanvas
                  playConcept={activePlayConcept}
                  playEvent={activePlay}
                  stepNumber={currentPlayIndexNumber}
                  totalSteps={filteredPlays.length}
                  isAnimating={isRoutesAnimating}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  teamHome={activeGame.HomeTeam}
                  teamAway={activeGame.AwayTeam}
                />
              </div>
            )}
          </div>

          {/* ACTIVE PLAY TELEMETRY BAR (With Minimize) */}
          {activePlay && (
            <div className="bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-4 py-2 bg-[#121216] border-b border-white/10 flex justify-between items-center">
                <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scheme &amp; Play Telemetry</span>
                </span>
                <button
                  onClick={() => setIsTelemetryMinimized(!isTelemetryMinimized)}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 border border-white/10"
                >
                  {isTelemetryMinimized ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  <span>{isTelemetryMinimized ? 'Expand' : 'Minimize'}</span>
                </button>
              </div>

              {!isTelemetryMinimized && (
                <div className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <TeamLogo teamKey={activePlay.Possession} size="sm" shape="circle" />
                      <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {activePlay.Possession} &bull; Q{activePlay.Quarter} &bull; {activePlay.TimeRemaining}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {activePlay.Down === 1 ? '1st' : activePlay.Down === 2 ? '2nd' : activePlay.Down === 3 ? '3rd' : '4th'} &amp; {activePlay.Distance} at {activePlay.YardLineSide} {activePlay.YardLine}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-400">
                        EPA: <strong className={activePlay.epa && activePlay.epa > 0 ? 'text-emerald-400' : 'text-rose-400'}>{activePlay.epa ? `${activePlay.epa > 0 ? '+' : ''}${activePlay.epa}` : '0.00'}</strong>
                      </span>
                      <span className="text-slate-400">
                        Win Prob: <strong className="text-amber-400">{activePlay.WinProbabilityPct || 50}%</strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {activePlay.Description}
                  </p>

                  {/* Scheme & Coverage Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151518] text-amber-300 border border-amber-500/20">
                      📐 Concept: <strong>{activePlay.playConceptName || activePlayConcept.name}</strong>
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151518] text-sky-300 border border-sky-500/20">
                      🛡️ Coverage: <strong>{activePlay.defensiveCoverage || activePlayConcept.defensiveCoverage}</strong>
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#151518] text-emerald-300 border border-emerald-500/20">
                      👥 Personnel: <strong>{activePlay.formation || activePlayConcept.personnel}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Win Probability Shift Line Chart (With Minimize) */}
          <div className="mt-4 bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 bg-[#18181d] border-b border-white/10 flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Win Probability Engine ({activeGame.HomeTeam} vs {activeGame.AwayTeam})</span>
              </span>
              <button
                onClick={() => setIsWinProbMinimized(!isWinProbMinimized)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 border border-white/10"
              >
                {isWinProbMinimized ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                <span>{isWinProbMinimized ? 'Expand' : 'Minimize'}</span>
              </button>
            </div>

            {!isWinProbMinimized && (
              <div className="p-3 sm:p-4">
                <WinProbabilityChart
                  gameKey={activeGame.GameKey}
                  homeTeam={{ abbreviation: activeGame.HomeTeam, name: activeGame.HomeTeam, score: activeGame.HomeScore || 0 }}
                  awayTeam={{ abbreviation: activeGame.AwayTeam, name: activeGame.AwayTeam, score: activeGame.AwayScore || 0 }}
                  status={activeGame.Status}
                  plays={gamePlays}
                  pointSpread={activeGame.PointSpread}
                  onSelectPlay={(playId) => {
                    setSelectedPlayId(playId);
                    setSelectedNodeId(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DRIVE PLAY-BY-PLAY FEED & ADVANCED STATS (4 COLS - With Minimize) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="px-4 py-3 bg-[#18181d] border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Radio className="w-3.5 h-3.5 text-amber-500" /> Full Play Log ({filteredPlays.length})
              </h3>
              <button
                onClick={() => setIsPlayLogMinimized(!isPlayLogMinimized)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 border border-white/10"
              >
                {isPlayLogMinimized ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                <span>{isPlayLogMinimized ? 'Expand' : 'Minimize'}</span>
              </button>
            </div>

            {isPlayLogMinimized ? (
              <div
                onClick={() => setIsPlayLogMinimized(false)}
                className="p-4 text-center cursor-pointer hover:bg-white/5 text-xs font-mono text-slate-400"
              >
                <span>📋 Play Log Minimized ({filteredPlays.length} Plays) &bull; <strong className="text-amber-400 underline">Click to Expand</strong></span>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[560px] space-y-2 p-3 pr-1">
                {filteredPlays.map((p, idx) => {
                  const isSelected = p.PlayID === selectedPlayId;
                  const isBigPlay = p.IsBigPlay || p.YardsGained >= 20;

                  return (
                    <div
                      key={p.PlayID}
                      onClick={() => {
                        setSelectedPlayId(p.PlayID);
                        setSelectedNodeId(null);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                          : 'bg-[#09090b] border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded font-black text-[9.5px] ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-white/10 text-amber-400'
                          }`}>
                            #{idx + 1}
                          </span>
                          <TeamLogo teamKey={p.Possession} size="xs" shape="circle" showBackground={false} />
                          <span className="font-bold text-amber-400">
                            Q{p.Quarter} {p.TimeRemaining} &bull; {p.Possession}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isBigPlay && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold font-mono text-[9px]">
                              BIG PLAY
                            </span>
                          )}
                          <span className="text-slate-400 font-bold">
                            {p.YardsGained > 0 ? `+${p.YardsGained}` : p.YardsGained} yds
                          </span>
                        </div>
                      </div>

                      <p className="line-clamp-2 text-[11px] leading-snug">
                        {p.Description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] font-mono text-slate-400">
                        <span>{p.Down === 1 ? '1st' : p.Down === 2 ? '2nd' : p.Down === 3 ? '3rd' : '4th'} &amp; {p.Distance}</span>
                        <span className="text-emerald-400 font-bold">{p.playConceptName ? p.playConceptName.slice(0, 22) : 'Tactical Scheme'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL FILM ROOM MODAL */}
      {isFilmRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#09090b]">
              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-1.5">
                  <TeamLogo teamKey={activeGame.AwayTeam} size="sm" shape="circle" />
                  <TeamLogo teamKey={activeGame.HomeTeam} size="sm" shape="circle" />
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Tactical Film Room &bull; {activeGame.AwayTeam} @ {activeGame.HomeTeam}
                </h3>
              </div>
              <button
                onClick={() => setIsFilmRoomModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <GridironTacticalCanvas
                playConcept={activePlayConcept}
                playEvent={activePlay}
                isAnimating={true}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
                teamHome={activeGame.HomeTeam}
                teamAway={activeGame.AwayTeam}
                zoom={1.1}
              />
              <div className="bg-[#09090b] p-4 rounded-xl border border-white/10 text-sm text-white">
                <strong>Play Telemetry:</strong> {activePlay.Description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded YouTube IFrame Modal */}
      {activeVideoModal && (
        <YouTubePlayerModal
          video={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          onSwitchVideo={(newVid) => setActiveVideoModal(newVid)}
          availableVideos={MOCK_HIGHLIGHT_VIDEOS}
        />
      )}
    </div>
  );
};
