import React from 'react';
import { TeamStanding } from '../../types';
import { Shield, Home, Plane, Award, CheckCircle, Crosshair } from 'lucide-react';

interface SidelineDownDistanceTrackProps {
  teams: TeamStanding[];
}

export const SidelineDownDistanceTrack: React.FC<SidelineDownDistanceTrackProps> = ({ teams }) => {
  // Sort teams by Home Win % or Home Wins
  const topTeams = [...teams]
    .sort((a, b) => (b.HomeWins + b.AwayWins) - (a.HomeWins + a.AwayWins))
    .slice(0, 10);

  return (
    <div className="bg-[#0c0d0f] border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs uppercase tracking-widest font-bold text-white font-mono">
            Sideline Chain Gang &bull; Home Turf vs Road Dominance
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Line to Gain: 1st & 10 Conversion</span>
      </div>

      <div className="space-y-3">
        {topTeams.map((team) => {
          const totalGames = Math.max(1, team.Wins + team.Losses);
          const homePct = (team.HomeWins / totalGames) * 100;
          const awayPct = (team.AwayWins / totalGames) * 100;

          return (
            <div key={team.Team} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-5 rounded bg-black/80 border border-white/20 flex items-center justify-center font-bold text-amber-400 text-[10px]">
                    {team.Team}
                  </span>
                  <span className="text-slate-200 font-sans font-semibold">{team.Name}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Home className="w-3 h-3" /> {team.HomeWins}W ({team.HomeLosses}L)
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Plane className="w-3 h-3" /> {team.AwayWins}W ({team.AwayLosses}L)
                  </span>
                </div>
              </div>

              {/* Sideline Turf Bar with Chain-Gang Line to Gain */}
              <div className="relative h-4 bg-[#0a2212] rounded border border-white/10 overflow-hidden flex items-center">
                {/* 10-Yard Hash marks */}
                <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="w-px h-full bg-white/40" />
                  ))}
                </div>

                {/* Home Turf Yardage Gained */}
                <div
                  className="h-full bg-emerald-600/80 transition-all duration-500 relative flex items-center justify-end pr-1 text-[9px] font-bold text-white font-mono"
                  style={{ width: `${homePct}%` }}
                >
                  {team.HomeWins > 0 && <span>{team.HomeWins}H</span>}
                </div>

                {/* Road Yardage Gained */}
                <div
                  className="h-full bg-amber-600/80 transition-all duration-500 flex items-center pl-1 text-[9px] font-bold text-slate-950 font-mono"
                  style={{ width: `${awayPct}%` }}
                >
                  {team.AwayWins > 0 && <span>{team.AwayWins}A</span>}
                </div>

                {/* 50-Yard Sideline Marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/60 -translate-x-1/2 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-sm bg-emerald-600 inline-block" /> Home Turf Wins
        </div>
        <div className="text-slate-400">50-50 Midfield Split</div>
        <div className="flex items-center gap-1 text-amber-400">
          <span className="w-2 h-2 rounded-sm bg-amber-600 inline-block" /> Road / Away Victories
        </div>
      </div>
    </div>
  );
};
