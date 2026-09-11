import React, { useState, useMemo } from 'react';
import { TeamStanding, Team } from '../../types';
import { NFL_TEAMS } from '../../data/sportsDataMock';
import { Shield, Trophy, ArrowRight, Zap, Target, Flag, Flame, Layers } from 'lucide-react';

export type GridironDisplayMode = 'drive_win_pct' | 'point_differential' | 'scoring_firepower';

interface GridironFieldTrackProps {
  teams: TeamStanding[];
  season?: string;
  onSelectTeam?: (teamKey: string) => void;
  selectedTeamKey?: string;
}

export const GridironFieldTrack: React.FC<GridironFieldTrackProps> = ({
  teams,
  season = '2026REG',
  onSelectTeam,
  selectedTeamKey
}) => {
  const [displayMode, setDisplayMode] = useState<GridironDisplayMode>('drive_win_pct');
  const [hoveredTeam, setHoveredTeam] = useState<TeamStanding | null>(null);
  const [selectedConference, setSelectedConference] = useState<'ALL' | 'AFC' | 'NFC'>('ALL');

  // Filter teams by conference if selected
  const activeTeams = useMemo(() => {
    return teams.filter((t) => {
      if (selectedConference === 'ALL') return true;
      return t.Conference === selectedConference;
    });
  }, [teams, selectedConference]);

  // Helper to get team metadata
  const getTeamMeta = (key: string): Team | undefined => {
    return NFL_TEAMS.find((t) => t.Key === key);
  };

  // Calculate Yard Position (0 to 100) based on active mode
  const getTeamYardPosition = (team: TeamStanding): number => {
    if (displayMode === 'drive_win_pct') {
      // 0.000 win % -> 5 yd line, 1.000 win % -> 95 yd line
      const pct = typeof team.Percentage === 'number' ? team.Percentage : 0;
      return Math.min(96, Math.max(4, pct * 90 + 5));
    } else if (displayMode === 'point_differential') {
      // 50 is neutral (diff = 0). Range -120 to +120 maps to 5 to 95 yds
      const diff = team.PointDifferential ?? ((team.PointsFor || 0) - (team.PointsAgainst || 0));
      const clampedDiff = Math.min(100, Math.max(-100, diff));
      // 0 diff -> 50 yds. +100 diff -> 95 yds. -100 diff -> 5 yds.
      return 50 + (clampedDiff / 100) * 45;
    } else {
      // Scoring firepower: PointsFor compared to PointsAgainst
      const pf = team.PointsFor || 0;
      const pa = team.PointsAgainst || 1;
      const ratio = pf / Math.max(1, pf + pa);
      return Math.min(95, Math.max(5, ratio * 90 + 5));
    }
  };

  // Group teams into vertical field lanes to prevent overlap when they have similar yard line positions
  const teamPositionsWithLanes = useMemo(() => {
    const sorted = [...activeTeams].map((team) => ({
      team,
      yard: getTeamYardPosition(team)
    })).sort((a, b) => a.yard - b.yard);

    // Assign lane (0 to 4) based on proximity
    const laneOccupancy: number[] = [0, 0, 0, 0, 0];
    const positioned = sorted.map((item) => {
      // Find lane with minimum recent yard or furthest away
      let bestLane = 0;
      let minDistance = -1;

      for (let i = 0; i < laneOccupancy.length; i++) {
        const dist = Math.abs(item.yard - laneOccupancy[i]);
        if (dist > minDistance) {
          minDistance = dist;
          bestLane = i;
        }
      }

      laneOccupancy[bestLane] = item.yard;
      return {
        ...item,
        lane: bestLane
      };
    });

    return positioned;
  }, [activeTeams, displayMode]);

  // Yard line markers: 10, 20, 30, 40, 50, 40, 30, 20, 10
  const yardLines = [
    { yard: 10, label: '10' },
    { yard: 20, label: '20' },
    { yard: 30, label: '30' },
    { yard: 40, label: '40' },
    { yard: 50, label: '50' },
    { yard: 60, label: '40' },
    { yard: 70, label: '30' },
    { yard: 80, label: '20' },
    { yard: 90, label: '10' }
  ];

  return (
    <div className="bg-[#0c0d0f] border border-amber-500/20 rounded-xl p-5 shadow-2xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
              <Flag className="w-3 h-3 text-emerald-400" /> Gridiron 100-Yard Scrimmage Tracker
            </span>
            <span className="text-xs text-slate-400 font-mono">NFL {season}</span>
          </div>
          <h3 className="text-lg font-bold text-white font-serif italic flex items-center gap-2">
            Field Position & Territorial Dominance Tracker
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            {displayMode === 'drive_win_pct' && 'Drive Progress: Teams advance toward the opponent end zone based on Win Percentage.'}
            {displayMode === 'point_differential' && 'Territorial Margin: The 50-yard line is even (0 point diff). Positive differential drives deep into enemy territory.'}
            {displayMode === 'scoring_firepower' && 'Scoring Power: Field possession calculated from points scored vs points surrendered.'}
          </p>
        </div>

        {/* Mode Selector & Conference Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Conference Filter */}
          <div className="flex items-center bg-[#141518] p-1 rounded-lg border border-white/10 text-xs">
            {(['ALL', 'AFC', 'NFC'] as const).map((conf) => (
              <button
                key={conf}
                onClick={() => setSelectedConference(conf)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  selectedConference === conf
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {conf}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#141518] p-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setDisplayMode('drive_win_pct')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all font-medium ${
                displayMode === 'drive_win_pct'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> Win % Drive
            </button>
            <button
              onClick={() => setDisplayMode('point_differential')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all font-medium ${
                displayMode === 'point_differential'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Point Diff (+/-)
            </button>
            <button
              onClick={() => setDisplayMode('scoring_firepower')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all font-medium ${
                displayMode === 'scoring_firepower'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Offense vs Defense
            </button>
          </div>
        </div>
      </div>

      {/* Gridiron Field Visualizer */}
      <div className="relative overflow-hidden rounded-xl border-2 border-white/20 shadow-2xl bg-[#0e3b1c]">
        {/* Grass texture & alternating 5-yard lawn mower strips */}
        <div className="absolute inset-0 flex pointer-events-none opacity-30">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-[#0f4d22]' : 'bg-[#0a3516]'}`}
            />
          ))}
        </div>

        {/* End Zones & Field Lines */}
        <div className="relative min-h-[360px] flex flex-col justify-between py-4 px-2 select-none">
          {/* Top Field Sideline Hashmarks */}
          <div className="relative h-4 border-b border-white/40 flex justify-between px-8 text-[9px] font-mono text-white/60">
            <span>&bull; OWN GOAL LINE</span>
            <span className="text-amber-300 font-bold">&bull; 50 MIDFIELD &bull;</span>
            <span className="text-emerald-300 font-bold">&bull; TOUCHDOWN END ZONE</span>
          </div>

          {/* Major Yard Lines and Yard Numbers */}
          <div className="absolute inset-x-8 inset-y-8 flex justify-between pointer-events-none">
            {yardLines.map((y) => (
              <div
                key={y.yard}
                className="relative flex flex-col items-center justify-between h-full"
                style={{ left: `${y.yard}%`, position: 'absolute', transform: 'translateX(-50%)' }}
              >
                {/* Yard Line */}
                <div
                  className={`w-px h-full ${
                    y.yard === 50
                      ? 'bg-amber-400/80 w-0.5 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : y.yard === 20 || y.yard === 80
                      ? 'bg-red-400/70 border-l border-dashed border-red-400'
                      : 'bg-white/30'
                  }`}
                />

                {/* Yard Stencil Top */}
                <div className="absolute top-2 text-[11px] font-black text-white/70 font-mono tracking-tighter">
                  {y.label}
                </div>

                {/* Yard Stencil Bottom */}
                <div className="absolute bottom-2 text-[11px] font-black text-white/70 font-mono tracking-tighter">
                  {y.label}
                </div>
              </div>
            ))}
          </div>

          {/* Red Zone Shading Overlays */}
          <div
            className="absolute top-8 bottom-8 left-8 bg-red-950/20 border-r-2 border-red-500/50 pointer-events-none"
            style={{ width: '20%' }}
          >
            <div className="absolute bottom-2 left-2 text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono">
              Danger Zone (0-20)
            </div>
          </div>
          <div
            className="absolute top-8 bottom-8 right-8 bg-emerald-900/25 border-l-2 border-emerald-400/60 pointer-events-none"
            style={{ width: '20%' }}
          >
            <div className="absolute top-2 right-2 text-[9px] font-bold text-emerald-300 uppercase tracking-widest font-mono">
              Red Zone Strike (80-100)
            </div>
          </div>

          {/* Team Drive Markers on the Gridiron */}
          <div className="relative z-10 flex-1 my-6 mx-8 h-[240px]">
            {teamPositionsWithLanes.map(({ team, yard, lane }) => {
              const meta = getTeamMeta(team.Team);
              const isSelected = selectedTeamKey === team.Team;
              const isHovered = hoveredTeam?.Team === team.Team;
              const primaryColor = meta?.PrimaryColor ? `#${meta.PrimaryColor}` : '#f59e0b';
              const diff = team.PointDifferential ?? ((team.PointsFor || 0) - (team.PointsAgainst || 0));

              // Vertical offset based on lane (0, 1, 2, 3, 4)
              const topOffset = `${12 + lane * 18}%`;

              return (
                <div
                  key={team.Team}
                  style={{
                    left: `${yard}%`,
                    top: topOffset,
                    transform: 'translate(-50%, -50%)',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className="absolute cursor-pointer group"
                  onClick={() => onSelectTeam && onSelectTeam(team.Team)}
                  onMouseEnter={() => setHoveredTeam(team)}
                  onMouseLeave={() => setHoveredTeam(null)}
                >
                  {/* Scrimmage Marker Pin & Team Chip */}
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-lg transition-all ${
                      isSelected
                        ? 'scale-125 z-30 ring-2 ring-amber-400 bg-black'
                        : isHovered
                        ? 'scale-115 z-20 bg-slate-950 border-white'
                        : 'bg-black/85 hover:bg-black border-white/30'
                    }`}
                    style={{
                      borderColor: isSelected ? '#fbbf24' : primaryColor
                    }}
                  >
                    {/* Team Color Dot or Logo */}
                    {meta?.WikipediaLogoUrl ? (
                      <img
                        src={meta.WikipediaLogoUrl}
                        alt={team.Team}
                        className="w-4 h-4 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span
                        className="w-3 h-3 rounded-full border border-white/40 inline-block"
                        style={{ backgroundColor: primaryColor }}
                      />
                    )}

                    <span className="text-[11px] font-black text-white font-mono">
                      {team.Team}
                    </span>

                    <span className="text-[10px] font-bold text-slate-300 font-mono px-1 py-0.2 bg-white/10 rounded">
                      {team.Wins}-{team.Losses}
                    </span>

                    {/* Differential / Stat Badge */}
                    <span
                      className={`text-[9px] font-bold font-mono ${
                        diff >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {diff >= 0 ? `+${diff}` : diff}
                    </span>
                  </div>

                  {/* Field Hash Drop Line */}
                  <div
                    className="w-0.5 h-6 mx-auto opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom Sideline Chain-Gang & First Down Marker Visual */}
          <div className="relative h-6 border-t border-white/40 flex items-center justify-between px-8 text-[10px] font-mono text-white/70 bg-[#082210]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              <span>CHAIN GANG SCRIMMAGE LINE</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-red-400 font-bold">&larr; Backed Up</span>
              <span className="text-amber-400 font-bold">50-Yard Neutral</span>
              <span className="text-emerald-400 font-bold">Red Zone Attack &rarr;</span>
            </div>
            <div className="font-bold text-amber-400">
              REGULATION 100 YARDS
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Team Inspection Callout (when hovered or selected) */}
      {hoveredTeam && (
        <div className="bg-[#121418] border border-amber-500/30 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center font-bold text-amber-400 font-mono">
              {hoveredTeam.Team}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{hoveredTeam.Name}</div>
              <div className="text-slate-400 text-[11px]">
                {hoveredTeam.Conference} {hoveredTeam.Division} &bull; Streak:{' '}
                <span className="text-amber-400 font-mono font-bold">{hoveredTeam.Streak || '-'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Record</div>
              <div className="text-white font-bold">{hoveredTeam.Wins}-{hoveredTeam.Losses}{hoveredTeam.Ties ? `-${hoveredTeam.Ties}` : ''} ({Math.round(hoveredTeam.Percentage * 100)}%)</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Points (For / Against)</div>
              <div className="text-white font-bold">{hoveredTeam.PointsFor} / {hoveredTeam.PointsAgainst}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Net Margin</div>
              <div className={`font-bold ${(hoveredTeam.PointDifferential ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {(hoveredTeam.PointDifferential ?? 0) >= 0 ? `+${hoveredTeam.PointDifferential}` : hoveredTeam.PointDifferential}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Touchdowns</div>
              <div className="text-amber-400 font-bold">{hoveredTeam.Touchdowns}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
