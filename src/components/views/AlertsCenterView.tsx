import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SeasonCode, ScoringDriveAlert, ScoreType } from '../../types';
import { useScoringNotifications } from '../../context/ScoringNotificationContext';
import { SCHEDULES_DATA } from '../../data/sportsDataMock';
import { TeamLogo } from '../TeamLogo';
import { ScoringAlertSettings } from '../notifications/ScoringAlertSettings';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Radio,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  Sliders,
  RotateCcw,
  Search,
  Filter,
  Trash2,
  CheckCheck,
  ShieldCheck,
  Clock,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Cookie,
  Download,
  Play
} from 'lucide-react';

interface AlertsCenterViewProps {
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  onNavigateToPlayByPlay?: (gameKey: string) => void;
  onOpenAiWithPrompt?: (prompt: string, context?: any) => void;
}

export const AlertsCenterView: React.FC<AlertsCenterViewProps> = ({
  selectedSeason = '2026REG',
  onNavigateToPlayByPlay,
  onOpenAiWithPrompt
}) => {
  const {
    alerts,
    unreadCount,
    isSoundEnabled,
    isNotificationsEnabled,
    isAutoSimulationActive,
    alertFilters,
    setIsSoundEnabled,
    setIsNotificationsEnabled,
    setIsAutoSimulationActive,
    toggleFilterCategory,
    cookieMeta,
    resetCookiesAndTurnOff,
    markAllAsRead,
    clearAlertHistory,
    triggerSampleScoringDrive,
    dismissToast
  } = useScoringNotifications();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'TD' | 'FG' | 'DEF' | 'REDZONE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  // Filter alerts based on active tab and search query
  const filteredAlerts = alerts.filter((alert) => {
    // Tab filter
    if (activeFilter === 'UNREAD' && alert.read) return false;
    if (activeFilter === 'TD' && alert.scoreType !== 'TOUCHDOWN') return false;
    if (activeFilter === 'FG' && alert.scoreType !== 'FIELD_GOAL') return false;
    if (
      activeFilter === 'DEF' &&
      alert.scoreType !== 'PICK_SIX' &&
      alert.scoreType !== 'FUMBLE_RETURN_TD' &&
      alert.scoreType !== 'SAFETY'
    )
      return false;
    if (activeFilter === 'REDZONE' && !alert.isRedZoneStrike) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeam =
        alert.scoringTeam.toLowerCase().includes(q) ||
        alert.scoringTeamName.toLowerCase().includes(q) ||
        alert.opponentTeam.toLowerCase().includes(q) ||
        alert.opponentTeamName.toLowerCase().includes(q);
      const matchPlayer = alert.scoringPlayer.toLowerCase().includes(q);
      const matchDesc = alert.playDescription.toLowerCase().includes(q);
      if (!matchTeam && !matchPlayer && !matchDesc) return false;
    }

    return true;
  });

  const handleTriggerTest = (type?: ScoreType, gameKey?: string) => {
    // If notifications are currently off, temporarily let the user know they can turn them on
    if (!isNotificationsEnabled) {
      showFeedback('Tip: Turn Alerts ON above to see live pop-up banners and hear chimes!');
    }
    const alert = triggerSampleScoringDrive(type, gameKey);
    showFeedback(`Generated ${alert.scoreType} alert for ${alert.scoringTeam}!`);
  };

  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(alerts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `nfl-alerts-export-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showFeedback('Alerts export downloaded as JSON');
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      {/* Toast feedback pill */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 right-8 z-50 pointer-events-none"
          >
            <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-2xl border border-amber-300 flex items-center gap-2 text-xs font-mono">
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{copiedToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="bg-gradient-to-r from-[#141418] via-[#101014] to-[#0c0c0e] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 z-10">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-serif">
                Scoring Alerts & Live Game Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                {selectedSeason}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                  isNotificationsEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                    : 'bg-slate-700/40 text-slate-400 border-white/10'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isNotificationsEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                <span>Alerts: {isNotificationsEnabled ? 'ACTIVE [ON]' : 'MUTED [OFF by Default]'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              The dedicated control plane for real-time NFL scoring drives, red-zone strikes, high-EPA swings, turnover touchdowns, and win probability shift alarms.
            </p>
          </div>
        </div>

        {/* Master Quick Toggle */}
        <div className="z-10 flex items-center gap-3">
          <button
            id="alerts-hub-master-toggle"
            onClick={() => {
              const next = !isNotificationsEnabled;
              setIsNotificationsEnabled(next);
              showFeedback(next ? 'Alerts turned ON (Saved in browser cookies)!' : 'Alerts turned OFF (Saved in browser cookies)');
            }}
            className={`px-5 py-2.5 rounded-xl font-mono font-black text-xs transition-all flex items-center gap-2 shadow-lg ${
              isNotificationsEnabled
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-500/30 to-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/40'
            }`}
          >
            {isNotificationsEnabled ? (
              <>
                <Bell className="w-4 h-4" />
                <span>ALERTS ENABLED [ON]</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4" />
                <span>ALERTS DISABLED [OFF]</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cookie Persistence & Policy Card */}
      <div className="bg-[#121216] border border-amber-500/20 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-amber-300">Cookie Storage Intelligence</span>
              <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">
                document.cookie
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Alerts start <strong>OFF</strong> by default. When you switch alerts ON or configure sound and filters, your selection is automatically saved in browser cookies (<code className="text-amber-400 font-mono">starstadium_alerts_enabled</code>) with a 365-day lifespan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
            <span className="text-slate-500">Cookie:</span>
            <span className={cookieMeta.isStoredInCookie ? 'text-emerald-400 font-bold' : 'text-slate-400 font-normal'}>
              {cookieMeta.isStoredInCookie ? `"${cookieMeta.cookieValue}"` : 'Default (Not Set - OFF)'}
            </span>
          </div>

          <button
            onClick={() => {
              resetCookiesAndTurnOff();
              showFeedback('Reset alert preferences to default (OFF) & cleared cookies');
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
            title="Clear all cookies and return to default OFF state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset (OFF)</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Configuration & Test Deck (Left) | Alert Feed & Inbox (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preferences, Switches, and Interactive Simulation Lab */}
        <div className="lg:col-span-5 space-y-6">
          {/* Centralized ScoringAlertSettings Component (js-cookie powered) */}
          <ScoringAlertSettings
            variant="card"
            showCookieDetails={true}
            showTestButton={true}
            showResetButton={true}
          />

          {/* Interactive Live Alert Simulation Lab */}
          <div className="bg-[#101014] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Test & Simulation Lab
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">Try Alert</span>
            </div>

            <p className="text-xs text-slate-400">
              Fire test scoring drives across Week 1 matchups to preview toast notifications, audio chimes, and win probability shift telemetry.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTriggerTest('TOUCHDOWN', '202610101')}
                className="p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex flex-col items-start gap-1 transition"
              >
                <div className="flex items-center gap-1.5 text-white">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Touchdown</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">KC vs BAL (7 pts)</span>
              </button>

              <button
                onClick={() => handleTriggerTest('FIELD_GOAL', '202610103')}
                className="p-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold flex flex-col items-start gap-1 transition"
              >
                <div className="flex items-center gap-1.5 text-white">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Field Goal</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">DET vs LAR (3 pts)</span>
              </button>

              <button
                onClick={() => handleTriggerTest('PICK_SIX', '202610106')}
                className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold flex flex-col items-start gap-1 transition"
              >
                <div className="flex items-center gap-1.5 text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Pick-Six TD</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">DAL vs CLE (6 pts)</span>
              </button>

              <button
                onClick={() => handleTriggerTest('SAFETY', '202610101')}
                className="p-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex flex-col items-start gap-1 transition"
              >
                <div className="flex items-center gap-1.5 text-white">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Safety</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Defensive (2 pts)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Alert History Feed & Search Filter ("The Place for Alerts") */}
        <div className="lg:col-span-7 space-y-4">
          {/* Feed Toolbar */}
          <div className="bg-[#101014] border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, player, or play..."
                className="w-full bg-[#18181c] text-white text-xs rounded-xl pl-9 pr-3 py-2 border border-white/10 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Bulk Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Mark all alerts as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Mark Read</span>
              </button>

              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
                title="Export alert feed to JSON"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={clearAlertHistory}
                disabled={alerts.length === 0}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-300 hover:text-rose-300 text-xs font-mono flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Clear all alerts"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            {[
              { id: 'ALL' as const, label: `All Alerts (${alerts.length})` },
              { id: 'UNREAD' as const, label: `Unread (${unreadCount})`, badge: unreadCount > 0 },
              { id: 'TD' as const, label: 'Touchdowns' },
              { id: 'FG' as const, label: 'Field Goals' },
              { id: 'DEF' as const, label: 'Defensive' },
              { id: 'REDZONE' as const, label: 'Red Zone' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#121216] border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Inactive State Banner if Notifications are disabled */}
          {!isNotificationsEnabled && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BellOff className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs">
                  Alerts are currently <strong>OFF</strong>. You can browse recorded history below, or enable real-time pop-up notifications to receive live updates.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsNotificationsEnabled(true);
                  showFeedback('Alerts enabled & saved in browser cookie!');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono shrink-0 shadow"
              >
                Turn ON
              </button>
            </div>
          )}

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="bg-[#101014] border border-white/10 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-500">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Matching Alerts</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No alerts match your current filter or search criteria. Use the Simulation Lab on the left to fire a live scoring alert.
                </p>
                <button
                  onClick={() => handleTriggerTest('TOUCHDOWN')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold font-mono inline-flex items-center gap-2 hover:bg-amber-400 transition"
                >
                  <Flame className="w-4 h-4" />
                  <span>Simulate Score</span>
                </button>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-[#121216] border rounded-2xl p-4 transition-all hover:border-white/20 space-y-3 ${
                    alert.read ? 'border-white/5 opacity-90' : 'border-amber-500/30 bg-[#16161c] shadow-lg'
                  }`}
                >
                  {/* Card Header: Teams & Points */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <TeamLogo teamKey={alert.scoringTeam} className="w-6 h-6" />
                        <span className="font-bold text-sm text-white">{alert.scoringTeam}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black border ${
                          alert.scoreType === 'TOUCHDOWN' || alert.scoreType === 'PICK_SIX'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : alert.scoreType === 'FIELD_GOAL'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {alert.scoreType === 'TOUCHDOWN'
                          ? 'TOUCHDOWN (+7)'
                          : alert.scoreType === 'PICK_SIX'
                          ? 'PICK-SIX (+6)'
                          : alert.scoreType === 'FIELD_GOAL'
                          ? 'FIELD GOAL (+3)'
                          : 'SAFETY (+2)'}
                      </span>

                      {alert.isRedZoneStrike && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" />
                          <span>Red Zone</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-400">
                        {alert.quarter} &bull; {alert.timeRemaining}
                      </span>
                      <span className="text-white font-black bg-black/40 px-2 py-0.5 rounded border border-white/10">
                        {alert.homeTeam} {alert.updatedHomeScore} - {alert.awayTeam} {alert.updatedAwayScore}
                      </span>
                    </div>
                  </div>

                  {/* Play description */}
                  <div className="text-xs text-slate-200 pl-1 border-l-2 border-amber-500/40">
                    <p className="font-semibold text-white">{alert.scoringPlayer}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{alert.playDescription}</p>
                  </div>

                  {/* Telemetry Chips & Stats */}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5 flex-wrap">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span>Drive: {alert.drivePlays} plays, {alert.driveYards} yds, {alert.driveTimeOfPossession}</span>
                      </span>

                      {typeof alert.epaGain === 'number' && (
                        <span className="text-emerald-400 font-bold">
                          +{alert.epaGain.toFixed(2)} EPA
                        </span>
                      )}

                      {typeof alert.winProbShift === 'number' && (
                        <span className="text-amber-400 font-bold">
                          +{alert.winProbShift.toFixed(1)}% Win Prob
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {onNavigateToPlayByPlay && (
                        <button
                          onClick={() => onNavigateToPlayByPlay(alert.gameKey)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1 transition"
                        >
                          <Play className="w-3 h-3 text-amber-400 fill-current" />
                          <span>Film Room</span>
                        </button>
                      )}

                      {onOpenAiWithPrompt && (
                        <button
                          onClick={() => {
                            const prompt = `Analyze this scoring drive between ${alert.scoringTeamName} and ${alert.opponentTeamName}: "${alert.playDescription}". Breakdown: ${alert.drivePlays} plays for ${alert.driveYards} yards in ${alert.driveTimeOfPossession}. EPA gain: +${alert.epaGain}. Win probability shift: +${alert.winProbShift}%. What tactical adjustments should the defensive coordinator make?`;
                            onOpenAiWithPrompt(prompt, { scoringDrive: alert });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 transition"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>AI Coach</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
