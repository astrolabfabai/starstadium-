import React, { useState, useMemo } from 'react';
import { SeasonCode, GameSchedule } from '../../types';
import {
  Clock,
  ChevronDown,
  ShieldCheck,
  Activity,
  Award,
  RotateCcw
} from 'lucide-react';
import { TeamLogo } from '../TeamLogo';
import { SCHEDULES_DATA } from '../../data/sportsDataMock';

interface PossessionViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  selectedGameKey?: string;
  onSelectGameKey?: (key: string) => void;
}

interface TeamTopRecord {
  team: string;
  name: string;
  conference: 'AFC' | 'NFC';
  avgTop: string;
  avgTopSecs: number;
  drivesPerGame: number;
  playsPerDrive: number;
  yardsPerDrive: number;
  threeAndOutPct: number;
  thirdDownConvPct: number;
  turnoverMargin: number;
}

const POSSESSION_LEAGUE_DATA: TeamTopRecord[] = [
  { team: 'BAL', name: 'Baltimore Ravens', conference: 'AFC', avgTop: '32:48', avgTopSecs: 1968, drivesPerGame: 10.2, playsPerDrive: 6.8, yardsPerDrive: 38.4, threeAndOutPct: 14.2, thirdDownConvPct: 48.5, turnoverMargin: +8 },
  { team: 'DET', name: 'Detroit Lions', conference: 'NFC', avgTop: '32:15', avgTopSecs: 1935, drivesPerGame: 10.5, playsPerDrive: 6.6, yardsPerDrive: 37.8, threeAndOutPct: 15.6, thirdDownConvPct: 46.8, turnoverMargin: +6 },
  { team: 'PHI', name: 'Philadelphia Eagles', conference: 'NFC', avgTop: '31:55', avgTopSecs: 1915, drivesPerGame: 10.1, playsPerDrive: 6.5, yardsPerDrive: 36.2, threeAndOutPct: 16.1, thirdDownConvPct: 45.2, turnoverMargin: +5 },
  { team: 'SF', name: 'San Francisco 49ers', conference: 'NFC', avgTop: '31:40', avgTopSecs: 1900, drivesPerGame: 9.8, playsPerDrive: 6.4, yardsPerDrive: 37.1, threeAndOutPct: 16.8, thirdDownConvPct: 44.9, turnoverMargin: +4 },
  { team: 'KC', name: 'Kansas City Chiefs', conference: 'AFC', avgTop: '31:22', avgTopSecs: 1882, drivesPerGame: 10.4, playsPerDrive: 6.3, yardsPerDrive: 36.5, threeAndOutPct: 17.2, thirdDownConvPct: 47.1, turnoverMargin: +7 },
  { team: 'BUF', name: 'Buffalo Bills', conference: 'AFC', avgTop: '30:58', avgTopSecs: 1858, drivesPerGame: 10.6, playsPerDrive: 6.1, yardsPerDrive: 35.8, threeAndOutPct: 18.0, thirdDownConvPct: 43.6, turnoverMargin: +3 },
  { team: 'GB', name: 'Green Bay Packers', conference: 'NFC', avgTop: '30:45', avgTopSecs: 1845, drivesPerGame: 10.8, playsPerDrive: 6.0, yardsPerDrive: 34.9, threeAndOutPct: 18.8, thirdDownConvPct: 42.5, turnoverMargin: +2 },
  { team: 'HOU', name: 'Houston Texans', conference: 'AFC', avgTop: '30:20', avgTopSecs: 1820, drivesPerGame: 11.0, playsPerDrive: 5.9, yardsPerDrive: 33.4, threeAndOutPct: 19.4, thirdDownConvPct: 41.2, turnoverMargin: +1 },
  { team: 'MIA', name: 'Miami Dolphins', conference: 'AFC', avgTop: '29:50', avgTopSecs: 1790, drivesPerGame: 11.2, playsPerDrive: 5.8, yardsPerDrive: 34.0, threeAndOutPct: 20.1, thirdDownConvPct: 40.8, turnoverMargin: 0 },
  { team: 'CIN', name: 'Cincinnati Bengals', conference: 'AFC', avgTop: '29:35', avgTopSecs: 1775, drivesPerGame: 11.3, playsPerDrive: 5.7, yardsPerDrive: 32.8, threeAndOutPct: 21.0, thirdDownConvPct: 39.5, turnoverMargin: -1 },
  { team: 'DAL', name: 'Dallas Cowboys', conference: 'NFC', avgTop: '29:10', avgTopSecs: 1750, drivesPerGame: 11.5, playsPerDrive: 5.6, yardsPerDrive: 32.1, threeAndOutPct: 21.8, thirdDownConvPct: 38.9, turnoverMargin: -2 },
  { team: 'LAR', name: 'Los Angeles Rams', conference: 'NFC', avgTop: '28:50', avgTopSecs: 1730, drivesPerGame: 11.6, playsPerDrive: 5.5, yardsPerDrive: 31.4, threeAndOutPct: 22.5, thirdDownConvPct: 38.0, turnoverMargin: -3 }
];

export default function PossessionView({
  selectedSeason = '2026REG',
  onSeasonChange,
  selectedGameKey,
  onSelectGameKey
}: PossessionViewProps) {
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

  const homeTeamKey = activeGame?.HomeTeam || 'KC';
  const awayTeamKey = activeGame?.AwayTeam || 'BAL';

  const [activePossession, setActivePossession] = useState<string>(homeTeamKey);
  const [driveYardStart] = useState<number>(25);
  const [currentYardLine] = useState<number>(68);
  const [drivePlays] = useState<number>(8);
  const [driveTime] = useState<string>('4:12');
  const [selectedConference, setSelectedConference] = useState<'ALL' | 'AFC' | 'NFC'>('ALL');
  const [sortField, setSortField] = useState<'avgTopSecs' | 'playsPerDrive' | 'thirdDownConvPct'>('avgTopSecs');

  const homeTopSeconds = 1940; // 32:20
  const awayTopSeconds = 1660; // 27:40
  const totalTopSecs = homeTopSeconds + awayTopSeconds;
  const homeTopPct = Math.round((homeTopSeconds / totalTopSecs) * 100);
  const awayTopPct = 100 - homeTopPct;

  const filteredRankings = useMemo(() => {
    return POSSESSION_LEAGUE_DATA
      .filter((t) => selectedConference === 'ALL' || t.conference === selectedConference)
      .sort((a, b) => b[sortField] - a[sortField]);
  }, [selectedConference, sortField]);

  // Field coordinate math (0 to 100)
  // Endzones: Left 0-10, Right 90-100.
  // Playing field: 10 to 90 (80 units = 100 yards, ratio 0.8)
  const fieldStartX = 10 + (driveYardStart * 0.8);
  const fieldCurrentX = 10 + (currentYardLine * 0.8);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header & Matchup Ribbon */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              TIME OF POSSESSION &amp; DRIVE TRACKER
            </span>
            <span className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
              Ball Control &bull; Drive Sequences &bull; {selectedSeason}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time football possession distribution, sustained drive metrics, 3rd down conversions, and clock management analytics.
          </p>
        </div>

        {/* Game Selector */}
        <div className="relative w-full sm:w-64">
          <select
            value={activeGame?.GameKey || ''}
            onChange={(e) => {
              if (onSelectGameKey) onSelectGameKey(e.target.value);
            }}
            className="w-full bg-[#18181e] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
          >
            {games.map((g) => {
              const gKey = g.GameKey;
              return (
                <option key={gKey} value={gKey}>
                  {g.AwayTeam} @ {g.HomeTeam} ({g.Status})
                </option>
              );
            })}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* TIME OF POSSESSION SPLIT COMPARISON BAR */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Game Time of Possession Battle</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Total Reg. Time Expended: 60:00
          </span>
        </div>

        {/* TOP Percentage Split Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center font-mono">
            <div className="flex items-center gap-2">
              <TeamLogo teamKey={awayTeamKey} size="xs" shape="circle" />
              <span className="font-bold text-white text-sm">{awayTeamKey}</span>
              <span className="text-blue-400 font-bold text-lg">27:40 ({awayTopPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold text-lg">32:20 ({homeTopPct}%)</span>
              <span className="font-bold text-white text-sm">{homeTeamKey}</span>
              <TeamLogo teamKey={homeTeamKey} size="xs" shape="circle" />
            </div>
          </div>

          <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${awayTopPct}%` }}
              title={`${awayTeamKey}: ${awayTopPct}% TOP`}
            />
            <div
              className="h-full bg-rose-600 transition-all duration-500"
              style={{ width: `${homeTopPct}%` }}
              title={`${homeTeamKey}: ${homeTopPct}% TOP`}
            />
          </div>
        </div>

        {/* Drive Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase block">Total Drives</span>
            <span className="text-base font-bold text-white mt-1 block">
              {awayTeamKey}: 10 &bull; {homeTeamKey}: 10
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase block">Avg Plays / Drive</span>
            <span className="text-base font-bold text-emerald-400 mt-1 block">
              {awayTeamKey}: 5.4 &bull; {homeTeamKey}: 6.7
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase block">3rd Down Conv</span>
            <span className="text-base font-bold text-amber-400 mt-1 block">
              {awayTeamKey}: 4/11 &bull; {homeTeamKey}: 7/12
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <span className="text-[10px] text-slate-400 uppercase block">Turnover Margin</span>
            <span className="text-base font-bold text-slate-200 mt-1 block">
              {awayTeamKey}: -1 &bull; {homeTeamKey}: +1
            </span>
          </div>
        </div>
      </div>

      {/* SUSTAINED DRIVE VISUALIZER (NO TEAM LOGOS ON THE FIELD) */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Tactical Field Drive Progression</span>
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/40">
                Active Drive
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing the full 100-yard field drive track, ball control progress, start point, and current yard line.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePossession(activePossession === homeTeamKey ? awayTeamKey : homeTeamKey)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 border border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Possession: {activePossession}</span>
            </button>
          </div>
        </div>

        {/* Active Drive Telemetry Bar */}
        <div className="bg-[#18181e] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-black">
              {activePossession} BALL
            </span>
            <span className="text-slate-300">
              Drive Started: <strong className="text-white">Own {driveYardStart} yd line</strong>
            </span>
            <span className="text-slate-300">
              Current Ball: <strong className="text-emerald-400">Opp {100 - currentYardLine} yd line</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span>
              Plays: <strong className="text-amber-400">{drivePlays}</strong>
            </span>
            <span>
              Yards Gained: <strong className="text-emerald-400">+{currentYardLine - driveYardStart} yds</strong>
            </span>
            <span>
              Clock Used: <strong className="text-white">{driveTime}</strong>
            </span>
          </div>
        </div>

        {/* 100-YARD TURF FIELD - Zero Team Logos on Field */}
        <div className="w-full aspect-[21/9] sm:aspect-[24/9] bg-[#164326] relative rounded-xl border border-emerald-500/40 overflow-hidden shadow-inner select-none">
          <svg className="w-full h-full" viewBox="0 0 100 53.3" preserveAspectRatio="none">
            <defs>
              <linearGradient id="posLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#172554" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="posRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#881337" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#4c0519" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="driveFill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.35" />
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

            {/* Drive Trajectory Overlay Area */}
            <rect
              x={fieldStartX}
              y="10"
              width={Math.max(2, fieldCurrentX - fieldStartX)}
              height="33.3"
              fill="url(#driveFill)"
              stroke="#10b981"
              strokeWidth="0.4"
              strokeDasharray="2,1"
              rx="2"
            />

            {/* Left Endzone (0 - 10) - Pure turf text, no team logo */}
            <rect x="0" y="0" width="10" height="53.3" fill="url(#posLeftGrad)" />
            <text x="5" y="27" fill="#ffffff" fillOpacity="0.5" fontSize="4.5" fontWeight="900" textAnchor="middle" transform="rotate(-90 5 27)" letterSpacing="2">
              {awayTeamKey}
            </text>

            {/* Right Endzone (90 - 100) - Pure turf text, no team logo */}
            <rect x="90" y="0" width="10" height="53.3" fill="url(#posRightGrad)" />
            <text x="95" y="27" fill="#ffffff" fillOpacity="0.5" fontSize="4.5" fontWeight="900" textAnchor="middle" transform="rotate(90 95 27)" letterSpacing="2">
              {homeTeamKey}
            </text>

            {/* 10-Yard Lines */}
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
              <line
                key={`pos-line-${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2="53.3"
                stroke="#ffffff"
                strokeWidth={x === 10 || x === 90 ? '0.6' : '0.25'}
                strokeOpacity="0.5"
              />
            ))}

            {/* Yard Markers */}
            {[
              { x: 20, num: '10' },
              { x: 30, num: '20' },
              { x: 40, num: '30' },
              { x: 50, num: '40' },
              { x: 60, num: '50' },
              { x: 70, num: '40' },
              { x: 80, num: '30' }
            ].map((m, i) => (
              <g key={`pos-num-${i}`} fill="#ffffff" fillOpacity="0.45" fontSize="3" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                <text x={m.x} y="8">{m.num}</text>
                <text x={m.x} y="47">{m.num}</text>
              </g>
            ))}

            {/* Drive Start Marker */}
            <circle cx={fieldStartX} cy="26.65" r="1.4" fill="#fbbf24" />
            <text x={fieldStartX} y="22" fill="#fbbf24" fontSize="2" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              START ({driveYardStart})
            </text>

            {/* Current Ball Position Line */}
            <line
              x1={fieldCurrentX}
              y1="0"
              x2={fieldCurrentX}
              y2="53.3"
              stroke="#10b981"
              strokeWidth="0.8"
            />
            <circle cx={fieldCurrentX} cy="26.65" r="2" fill="#10b981" />
            <text x={fieldCurrentX} y="34" fill="#10b981" fontSize="2.3" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              BALL ON {100 - currentYardLine} YD
            </text>

            {/* Football Icon */}
            <text x={fieldCurrentX} y="27.4" fill="#f59e0b" fontSize="2.8" textAnchor="middle">
              🏈
            </text>
          </svg>
        </div>
      </div>

      {/* LEAGUE POSSESSION & BALL CONTROL STANDINGS */}
      <div className="bg-[#121216] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>NFL Time of Possession &amp; Ball Control Standings</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ranked by average game time of possession, sustained drive length, and third-down sustainability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Conference Selector */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
              {(['ALL', 'AFC', 'NFC'] as const).map((conf) => (
                <button
                  key={conf}
                  onClick={() => setSelectedConference(conf)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    selectedConference === conf
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>

            {/* Sort Field */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono text-slate-400">
              <span className="px-1 text-[10px]">SORT:</span>
              <button
                onClick={() => setSortField('avgTopSecs')}
                className={`px-2 py-0.5 rounded font-bold transition ${sortField === 'avgTopSecs' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'}`}
              >
                TOP
              </button>
              <button
                onClick={() => setSortField('playsPerDrive')}
                className={`px-2 py-0.5 rounded font-bold transition ${sortField === 'playsPerDrive' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'}`}
              >
                Plays/Dr
              </button>
              <button
                onClick={() => setSortField('thirdDownConvPct')}
                className={`px-2 py-0.5 rounded font-bold transition ${sortField === 'thirdDownConvPct' ? 'bg-amber-500 text-slate-950' : 'hover:text-white'}`}
              >
                3rd Down
              </button>
            </div>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#18181e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3 text-center">Conf</th>
                <th className="py-3 px-3 text-right text-emerald-400 font-bold">Avg TOP</th>
                <th className="py-3 px-3 text-right">Drives/G</th>
                <th className="py-3 px-3 text-right text-amber-400 font-bold">Plays/Drive</th>
                <th className="py-3 px-3 text-right">Yards/Drive</th>
                <th className="py-3 px-3 text-right">3 &amp; Out %</th>
                <th className="py-3 px-3 text-right text-rose-400 font-bold">3rd Down %</th>
                <th className="py-3 px-3 text-right">TO Margin</th>
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
                  <td className="py-2.5 px-3 text-right font-black text-emerald-400 text-sm">
                    {team.avgTop}
                  </td>
                  <td className="py-2.5 px-3 text-right text-white">{team.drivesPerGame}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-400">{team.playsPerDrive}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{team.yardsPerDrive}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{team.threeAndOutPct}%</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">{team.thirdDownConvPct}%</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                    {team.turnoverMargin > 0 ? `+${team.turnoverMargin}` : team.turnoverMargin}
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
