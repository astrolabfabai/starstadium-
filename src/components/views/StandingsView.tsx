import React, { useState, useEffect } from 'react';
import { SeasonCode, SEASONS_LIST, TeamStanding } from '../../types';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { STANDINGS_DATA, NFL_TEAMS } from '../../data/sportsDataMock';
import { Trophy, Search, Filter, Shield, Award, Calendar, RefreshCw, CheckCircle } from 'lucide-react';
import { TeamStandingsWidget } from '../widgets/TeamStandingsWidget';
import { GridironFieldTrack } from '../widgets/GridironFieldTrack';
import { SidelineDownDistanceTrack } from '../widgets/SidelineDownDistanceTrack';

interface StandingsViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  selectedSeason = '2026REG',
  onSeasonChange
}) => {
  const [selectedConf, setSelectedConf] = useState<'ALL' | 'AFC' | 'NFC'>('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof TeamStanding>('Wins');
  const [sortAsc, setSortAsc] = useState(false);
  const [standingsList, setStandingsList] = useState<TeamStanding[]>(STANDINGS_DATA);
  const [dataSource, setDataSource] = useState<string>('sportsdata_cache');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTeamKey, setSelectedTeamKey] = useState<string>('KC');

  // Fetch live current standings from the backend
  const fetchStandingsData = async (season: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sportsdata/standings?season=${season}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setStandingsList(json.data);
          setDataSource(json.source || 'sportsdata_live_api');
        } else if (Array.isArray(json) && json.length > 0) {
          setStandingsList(json);
          setDataSource('sportsdata_cache');
        }
      }
    } catch (err) {
      console.warn('Could not fetch live standings, using default cache:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStandingsData(selectedSeason);
  }, [selectedSeason]);

  const filteredStandings = standingsList.filter((st) => {
    if (selectedConf !== 'ALL' && st.Conference !== selectedConf) return false;
    if (selectedDivision !== 'ALL' && !st.Division.toLowerCase().includes(selectedDivision.toLowerCase())) return false;
    if (searchQuery && !st.Name.toLowerCase().includes(searchQuery.toLowerCase()) && !st.Team.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  // Radar chart data comparing point diff, win %, home wins, away wins, TDs
  const radarChartData = filteredStandings.slice(0, 6).map((st) => ({
    team: st.Team,
    WinPct: Math.round(st.Percentage * 100),
    PointsDiff: Math.max(0, (st.PointDifferential ?? 0) + 100) / 3,
    HomeWins: (st.HomeWins || 0) * 10,
    AwayWins: (st.AwayWins || 0) * 10,
    Touchdowns: st.Touchdowns || 0
  }));

  return (
    <div className="space-y-8">
      {/* Flagship Team Standings & Division Rankings Widget */}
      <TeamStandingsWidget
        initialSeason={selectedSeason}
        onSelectTeam={(key) => setSelectedTeamKey(key)}
      />

      {/* Advanced Visualizations & Football Gridiron Diagnostics */}
      <div className="bg-[#121214] border border-white/10 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2 border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" /> NFL Gridiron Engine &bull; Live Territorial Diagnostics
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide font-serif italic">
              Gridiron Field Dominance & Team Scrimmage Tracker ({selectedSeason})
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live Data Source: <span className="text-amber-400 font-bold">{dataSource === 'sportsdata_live_api' ? 'SportsData.io Official Live Feed' : 'SportsData Synchronized Cache'}</span> &bull; Active Teams: {filteredStandings.length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live refresh trigger */}
            <button
              onClick={() => fetchStandingsData(selectedSeason)}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-[#09090b] border border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
              title="Refresh live standings"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            {/* Conference Selector */}
            <div className="bg-[#09090b] p-1 rounded-lg flex items-center gap-1 border border-white/10">
              {(['ALL', 'AFC', 'NFC'] as const).map((conf) => (
                <button
                  key={conf}
                  onClick={() => setSelectedConf(conf)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    selectedConf === conf
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>

            {/* Division Filter */}
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-[#09090b] text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-white/10 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Divisions</option>
              <option value="East">East</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>

        {/* Primary Football-Themed Visualization: Regulation 100-Yard Field Tracker */}
        <GridironFieldTrack
          teams={filteredStandings}
          season={selectedSeason}
          selectedTeamKey={selectedTeamKey}
          onSelectTeam={(key) => setSelectedTeamKey(key)}
        />

        {/* Secondary Diagnostics Grid: Sideline Down & Distance + Multi-Attribute Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sideline Chain Gang: Home vs Away Line to Gain Track */}
          <SidelineDownDistanceTrack teams={filteredStandings} />

          {/* Radar Chart */}
          <div className="bg-[#09090b] rounded-xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300 mb-1 flex items-center gap-2 font-mono">
                <Award className="w-4 h-4 text-amber-500" /> Multi-Attribute Contender Radar
              </h3>
              <p className="text-[11px] text-slate-500 font-sans mb-3">
                Top playoff contenders evaluated across Win %, Margin, and Scoring
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="team" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" />
                  <Radar name="Win Pct (%)" dataKey="WinPct" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Radar name="Touchdowns" dataKey="Touchdowns" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#121214', borderColor: '#27272a', color: '#f8fafc', borderRadius: '4px' }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



