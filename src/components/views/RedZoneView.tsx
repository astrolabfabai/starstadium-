import React, { useState, useMemo } from 'react';
import { SeasonCode, GameSchedule } from '../../types';
import {
  Flame,
  Target,
  ChevronDown,
  Award
} from 'lucide-react';
import { TeamLogo } from '../TeamLogo';
import { SCHEDULES_DATA } from '../../data/sportsDataMock';

interface RedZoneViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  selectedGameKey?: string;
  onSelectGameKey?: (key: string) => void;
}

interface TeamRzRecord {
  team: string;
  name: string;
  conference: 'AFC' | 'NFC';
  trips: number;
  tds: number;
  fgs: number;
  tdPct: number;
  fgPct: number;
  turnovers: number;
  epaPerPlay: number;
}

const RED_ZONE_TEAM_DATA: TeamRzRecord[] = [
  { team: 'KC', name: 'Kansas City Chiefs', conference: 'AFC', trips: 46, tds: 34, fgs: 10, tdPct: 73.9, fgPct: 21.7, turnovers: 2, epaPerPlay: 0.38 },
  { team: 'BAL', name: 'Baltimore Ravens', conference: 'AFC', trips: 51, tds: 37, fgs: 11, tdPct: 72.5, fgPct: 21.6, turnovers: 3, epaPerPlay: 0.42 },
  { team: 'DET', name: 'Detroit Lions', conference: 'NFC', trips: 54, tds: 38, fgs: 12, tdPct: 70.4, fgPct: 22.2, turnovers: 4, epaPerPlay: 0.36 },
  { team: 'BUF', name: 'Buffalo Bills', conference: 'AFC', trips: 49, tds: 34, fgs: 11, tdPct: 69.4, fgPct: 22.4, turnovers: 4, epaPerPlay: 0.35 },
  { team: 'PHI', name: 'Philadelphia Eagles', conference: 'NFC', trips: 48, tds: 33, fgs: 12, tdPct: 68.8, fgPct: 25.0, turnovers: 3, epaPerPlay: 0.33 },
  { team: 'SF', name: 'San Francisco 49ers', conference: 'NFC', trips: 45, tds: 30, fgs: 12, tdPct: 66.7, fgPct: 26.7, turnovers: 3, epaPerPlay: 0.29 },
  { team: 'GB', name: 'Green Bay Packers', conference: 'NFC', trips: 42, tds: 27, fgs: 11, tdPct: 64.3, fgPct: 26.2, turnovers: 4, epaPerPlay: 0.26 },
  { team: 'MIA', name: 'Miami Dolphins', conference: 'AFC', trips: 44, tds: 28, fgs: 12, tdPct: 63.6, fgPct: 27.3, turnovers: 4, epaPerPlay: 0.24 },
  { team: 'DAL', name: 'Dallas Cowboys', conference: 'NFC', trips: 41, tds: 25, fgs: 13, tdPct: 61.0, fgPct: 31.7, turnovers: 3, epaPerPlay: 0.21 },
  { team: 'HOU', name: 'Houston Texans', conference: 'AFC', trips: 39, tds: 23, fgs: 12, tdPct: 59.0, fgPct: 30.8, turnovers: 4, epaPerPlay: 0.19 },
  { team: 'CIN', name: 'Cincinnati Bengals', conference: 'AFC', trips: 40, tds: 23, fgs: 13, tdPct: 57.5, fgPct: 32.5, turnovers: 4, epaPerPlay: 0.18 },
  { team: 'LAR', name: 'Los Angeles Rams', conference: 'NFC', trips: 38, tds: 21, fgs: 13, tdPct: 55.3, fgPct: 34.2, turnovers: 4, epaPerPlay: 0.15 },
  { team: 'TB', name: 'Tampa Bay Buccaneers', conference: 'NFC', trips: 37, tds: 20, fgs: 13, tdPct: 54.1, fgPct: 35.1, turnovers: 4, epaPerPlay: 0.14 },
  { team: 'PIT', name: 'Pittsburgh Steelers', conference: 'AFC', trips: 35, tds: 18, fgs: 14, tdPct: 51.4, fgPct: 40.0, turnovers: 3, epaPerPlay: 0.11 },
  { team: 'SEA', name: 'Seattle Seahawks', conference: 'NFC', trips: 36, tds: 18, fgs: 14, tdPct: 50.0, fgPct: 38.9, turnovers: 4, epaPerPlay: 0.09 },
  { team: 'NYJ', name: 'New York Jets', conference: 'AFC', trips: 33, tds: 16, fgs: 13, tdPct: 48.5, fgPct: 39.4, turnovers: 4, epaPerPlay: 0.07 },
  { team: 'CHI', name: 'Chicago Bears', conference: 'NFC', trips: 34, tds: 16, fgs: 14, tdPct: 47.1, fgPct: 41.2, turnovers: 4, epaPerPlay: 0.05 },
  { team: 'NE', name: 'New England Patriots', conference: 'AFC', trips: 30, tds: 13, fgs: 13, tdPct: 43.3, fgPct: 43.3, turnovers: 4, epaPerPlay: 0.01 }
];

export default function RedZoneView({
  selectedSeason = '2026REG',
  onSeasonChange,
  selectedGameKey,
  onSelectGameKey
}: RedZoneViewProps) {
  const games: GameSchedule[] = useMemo(() => {
    return (SCHEDULES_DATA && SCHEDULES_DATA[selectedSeason]) || (SCHEDULES_DATA && SCHEDULES_DATA['2026REG']) || [];
  }, [selectedSeason]);

  const activeGame: GameSchedule | undefined = useMemo(() => {
    if (selectedGameKey) {
      const found = games.find((g) => g.GameKey === selectedGameKey);
      if (found) return found;
    }
    return games[0];
  }, [games, selectedGameKey]);

  // Current down, distance, yardline in Red Zone
  const [currentYardLine, setCurrentYardLine] = useState<number>(12);
  const [currentDown, setCurrentDown] = useState<number>(2);
  const [distanceToGo, setDistanceToGo] = useState<number>(4);
  const [selectedConference, setSelectedConference] = useState<'ALL' | 'AFC' | 'NFC'>('ALL');
  const [sortField, setSortField] = useState<'tdPct' | 'trips' | 'epaPerPlay'>('tdPct');

  const filteredRankings = useMemo(() => {
    return RED_ZONE_TEAM_DATA
      .filter((t) => selectedConference === 'ALL' || t.conference === selectedConference)
      .sort((a, b) => b[sortField] - a[sortField]);
  }, [selectedConference, sortField]);

  // Matchup specific red zone statistics
  const homeTeamKey = activeGame?.HomeTeam || 'KC';
  const awayTeamKey = activeGame?.AwayTeam || 'BAL';

  const homeRzTrips = 4;
  const homeRzTds = 3;
  const homeRzFgs = 1;
  const awayRzTrips = 3;
  const awayRzTds = 2;
  const awayRzFgs = 1;

  const homeRzPct = Math.round((homeRzTds / Math.max(1, homeRzTrips)) * 100);
  const awayRzPct = Math.round((awayRzTds / Math.max(1, awayRzTrips)) * 100);

  // Field calculation (0 to 100 yards):
  // Red Zone is from Opponent 20 to Goal Line (x = 70 to 90).
  const losSvgX = 90 - currentYardLine;
  const firstDownSvgX = Math.min(90, losSvgX + distanceToGo);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header & Context Bar */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              RED ZONE COMMAND CENTER
            </span>
            <span className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
              Inside the 20-Yard Line Efficiency &bull; {selectedSeason}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Goal-to-go conversion rates, red-zone football play execution, touchdown percentages, and high-leverage scoring efficiency.
          </p>
        </div>

        {/* Game Matchup Selector */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <div className="relative w-full sm:w-64">
            <select
              value={activeGame?.GameKey || ''}
              onChange={(e) => {
                if (onSelectGameKey) onSelectGameKey(e.target.value);
              }}
              className="w-full bg-[#18181e] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-rose-500 appearance-none pr-8 cursor-pointer"
            >
              {games.map((g) => {
                const gKey = g.GameKey;
                return (
                  <option key={gKey} value={gKey}>
                    {g.AwayTeam} @ {g.HomeTeam} ({g.Status === 'InProgress' ? `LIVE Q${g.Quarter}` : g.Status})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* MATCHUP RED ZONE BENCHMARK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Away Team Card */}
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <TeamLogo teamKey={awayTeamKey} size="md" shape="circle" />
              <div>
                <h3 className="font-bold text-white text-base">{awayTeamKey} Red Zone</h3>
                <span className="text-xs font-mono text-slate-400">Away &bull; Scoring Efficiency</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-rose-400">{awayRzPct}%</span>
              <p className="text-[10px] font-mono uppercase text-slate-400">TD Rate</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase block">Trips</span>
              <span className="text-lg font-bold text-white">{awayRzTrips}</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
              <span className="text-[10px] text-emerald-400 uppercase block">TDs</span>
              <span className="text-lg font-bold text-emerald-400">{awayRzTds}</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
              <span className="text-[10px] text-amber-400 uppercase block">FGs</span>
              <span className="text-lg font-bold text-amber-400">{awayRzFgs}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Goal-to-Go Conversion</span>
              <span className="text-white font-bold">100% (2/2)</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Home Team Card */}
        <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <TeamLogo teamKey={homeTeamKey} size="md" shape="circle" />
              <div>
                <h3 className="font-bold text-white text-base">{homeTeamKey} Red Zone</h3>
                <span className="text-xs font-mono text-slate-400">Home &bull; Scoring Efficiency</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-rose-400">{homeRzPct}%</span>
              <p className="text-[10px] font-mono uppercase text-slate-400">TD Rate</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 uppercase block">Trips</span>
              <span className="text-lg font-bold text-white">{homeRzTrips}</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5">
              <span className="text-[10px] text-emerald-400 uppercase block">TDs</span>
              <span className="text-lg font-bold text-emerald-400">{homeRzTds}</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
              <span className="text-[10px] text-amber-400 uppercase block">FGs</span>
              <span className="text-lg font-bold text-amber-400">{homeRzFgs}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Goal-to-Go Conversion</span>
              <span className="text-white font-bold">75% (3/4)</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 100-YARD RED ZONE TACTICAL FIELD VISUALIZER (NO TEAM LOGOS ON FIELD) */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" />
                <span>Gridiron Red Zone Field Visualizer</span>
              </h2>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold border border-rose-500/40">
                Inside the 20
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing the red-zone scoring boundary, line of scrimmage, down-and-distance, and goal line target.
            </p>
          </div>

          {/* Interactive Yard Line Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
              <span className="px-1.5 text-slate-400 text-[10px]">BALL ON:</span>
              {[18, 12, 5, 2].map((yd) => (
                <button
                  key={yd}
                  onClick={() => {
                    setCurrentYardLine(yd);
                    if (yd <= 5) setDistanceToGo(yd);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    currentYardLine === yd
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {yd} yd
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
              <span className="px-1.5 text-slate-400 text-[10px]">DOWN:</span>
              {[1, 2, 3, 4].map((d) => (
                <button
                  key={d}
                  onClick={() => setCurrentDown(d)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    currentDown === d
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Situation Pill */}
        <div className="bg-[#18181e] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-white font-bold">
              {currentDown === 1 ? '1st' : currentDown === 2 ? '2nd' : currentDown === 3 ? '3rd' : '4th'} &amp;{' '}
              {distanceToGo <= 0 || currentYardLine <= distanceToGo ? 'Goal' : distanceToGo} at Opponent {currentYardLine}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Distance to Goal: <strong className="text-rose-400">{currentYardLine} Yards</strong>
            </span>
            <span>
              Expected Points: <strong className="text-emerald-400">+{currentYardLine <= 5 ? '5.4' : '4.6'} EPA</strong>
            </span>
            <span>
              Scoring Prob: <strong className="text-amber-400">89.4%</strong>
            </span>
          </div>
        </div>

        {/* SVG Turf Field - Zero Team Logos on Field */}
        <div className="w-full aspect-[21/9] sm:aspect-[24/9] bg-[#164326] relative rounded-xl border border-emerald-500/40 overflow-hidden shadow-inner select-none">
          <svg className="w-full h-full" viewBox="0 0 100 53.3" preserveAspectRatio="none">
            <defs>
              <linearGradient id="rzLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#172554" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="rzRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#881337" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4c0519" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="redZoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Grass Turf Stripes */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((x, i) => (
              <rect
                key={`stripe-${x}`}
                x={x}
                y="0"
                width="10"
                height="53.3"
                fill={i % 2 === 0 ? '#1b4d2e' : '#164326'}
              />
            ))}

            {/* Red Zone Highlight (Opponent 20 to Goal Line = x: 70 to 90) */}
            <rect x="70" y="0" width="20" height="53.3" fill="url(#redZoneGrad)" stroke="#f43f5e" strokeWidth="0.3" strokeDasharray="1,1" />

            {/* Red Zone Text Banner on Turf */}
            <text x="80" y="27.5" fill="#f43f5e" fillOpacity="0.25" fontSize="6.5" fontWeight="900" textAnchor="middle" letterSpacing="4">
              RED ZONE
            </text>

            {/* Left Endzone (0 - 10) - Pure turf text, no team logo */}
            <rect x="0" y="0" width="10" height="53.3" fill="url(#rzLeftGrad)" />
            <text x="5" y="27" fill="#ffffff" fillOpacity="0.5" fontSize="4.5" fontWeight="900" textAnchor="middle" transform="rotate(-90 5 27)" letterSpacing="2">
              {awayTeamKey}
            </text>

            {/* Right Endzone (90 - 100) - Pure turf text, no team logo */}
            <rect x="90" y="0" width="10" height="53.3" fill="url(#rzRightGrad)" />
            <text x="95" y="27" fill="#ffffff" fillOpacity="0.5" fontSize="4.5" fontWeight="900" textAnchor="middle" transform="rotate(90 95 27)" letterSpacing="2">
              {homeTeamKey}
            </text>

            {/* Yard Lines & Numbers */}
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
              <line
                key={`rz-line-${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2="53.3"
                stroke="#ffffff"
                strokeWidth={x === 10 || x === 90 ? '0.6' : x === 70 ? '0.5' : '0.25'}
                strokeOpacity={x === 70 ? '0.9' : '0.5'}
              />
            ))}

            {/* 20-Yard Red Zone Threshold Warning Line */}
            <line x1="70" y1="0" x2="70" y2="53.3" stroke="#f43f5e" strokeWidth="0.8" strokeDasharray="1.5,1" />
            <text x="70" y="4" fill="#f43f5e" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              20 YD THRESHOLD
            </text>

            {/* Yard Markers & Numbers */}
            {[
              { x: 20, num: '10' },
              { x: 30, num: '20' },
              { x: 40, num: '30' },
              { x: 50, num: '40' },
              { x: 60, num: '50' },
              { x: 70, num: '40' },
              { x: 80, num: '10' }
            ].map((m, i) => (
              <g key={`num-${i}`} fill="#ffffff" fillOpacity="0.45" fontSize="3" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                <text x={m.x} y="8">{m.num}</text>
                <text x={m.x} y="47">{m.num}</text>
              </g>
            ))}

            {/* Goal Line & Pylons */}
            <line x1="90" y1="0" x2="90" y2="53.3" stroke="#ffffff" strokeWidth="0.8" />
            <rect x="89.5" y="0.5" width="1" height="2" fill="#f97316" />
            <rect x="89.5" y="50.8" width="1" height="2" fill="#f97316" />

            {/* 1st Down Line */}
            <line
              x1={firstDownSvgX}
              y1="0"
              x2={firstDownSvgX}
              y2="53.3"
              stroke="#fbbf24"
              strokeWidth="0.6"
              strokeDasharray="2,1"
            />

            {/* Line of Scrimmage */}
            <line
              x1={losSvgX}
              y1="0"
              x2={losSvgX}
              y2="53.3"
              stroke="#38bdf8"
              strokeWidth="0.7"
            />

            {/* Line of Scrimmage Indicator */}
            <circle cx={losSvgX} cy="26.65" r="1.5" fill="#38bdf8" />
            <text x={losSvgX} y="32" fill="#38bdf8" fontSize="2.2" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              LOS ({currentYardLine} yd)
            </text>

            {/* Football at Scrimmage */}
            <text x={losSvgX} y="27.4" fill="#f59e0b" fontSize="2.8" textAnchor="middle">
              🏈
            </text>
          </svg>
        </div>
      </div>

      {/* NFL LEAGUE-WIDE RED ZONE EFFICIENCY TABLE */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>NFL Red Zone Team Standings &amp; Conversion Rates</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ranked by red-zone touchdown conversion percentage and expected points added per play.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Conference Filter */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
              {(['ALL', 'AFC', 'NFC'] as const).map((conf) => (
                <button
                  key={conf}
                  onClick={() => setSelectedConference(conf)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedConference === conf
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono text-slate-400">
              <span className="px-1 text-[10px]">SORT:</span>
              <button
                onClick={() => setSortField('tdPct')}
                className={`px-2 py-0.5 rounded font-bold transition ${sortField === 'tdPct' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'}`}
              >
                TD%
              </button>
              <button
                onClick={() => setSortField('trips')}
                className={`px-2 py-0.5 rounded font-bold transition ${sortField === 'trips' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'}`}
              >
                Trips
              </button>
              <button
                onClick={() => setSortField('epaPerPlay')}
                className={`px-2 py-0.5 rounded font-bold transition ${sortField === 'epaPerPlay' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'}`}
              >
                EPA
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#18181e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3 text-center">Conf</th>
                <th className="py-3 px-3 text-right">Trips</th>
                <th className="py-3 px-3 text-right">TDs</th>
                <th className="py-3 px-3 text-right">FGs</th>
                <th className="py-3 px-3 text-right text-rose-400 font-bold">TD Rate</th>
                <th className="py-3 px-3 text-right">FG Rate</th>
                <th className="py-3 px-3 text-right">TOs</th>
                <th className="py-3 px-3 text-right text-emerald-400 font-bold">EPA / Play</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#121216]">
              {filteredRankings.map((team, idx) => (
                <tr key={team.team} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <TeamLogo teamKey={team.team} size="xs" shape="circle" />
                      <span className="font-bold text-white">{team.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-400">{team.conference}</td>
                  <td className="py-2.5 px-3 text-right text-white">{team.trips}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">{team.tds}</td>
                  <td className="py-2.5 px-3 text-right text-amber-400">{team.fgs}</td>
                  <td className="py-2.5 px-3 text-right font-black text-rose-400 text-sm">
                    {team.tdPct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{team.fgPct.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{team.turnovers}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                    +{team.epaPerPlay.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
