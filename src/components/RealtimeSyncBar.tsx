import React, { useState } from 'react';
import { useRealtimeSync } from '../context/RealtimeSyncContext';
import {
  Activity,
  Zap,
  RefreshCw,
  Layers,
  Clock,
  ShieldAlert,
  Flame,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Keyboard,
  Radio
} from 'lucide-react';

export const RealtimeSyncBar: React.FC = () => {
  const {
    connectionStatus,
    transportMode,
    latencyMs,
    tickCount,
    selectedGame,
    simulatePlay,
    forceSync,
    toggleTransport,
    setIsArchitectureModalOpen,
    setIsUiModalOpen,
    setIsShortcutsModalOpen,
    setIsGameSwitcherOpen,
    soundAlertsEnabled,
    setSoundAlertsEnabled
  } = useRealtimeSync();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSimMenu, setShowSimMenu] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await forceSync();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const isConnected = connectionStatus === 'connected';

  return (
    <div
      id="realtime-sync-telemetry-bar"
      className="bg-[#0b0e14] border-b border-sky-500/20 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono select-none"
    >
      {/* Left: Connection State & Protocol */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Pulse Dot & Status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : connectionStatus === 'polling_fallback'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected
                ? 'bg-emerald-400 animate-ping'
                : connectionStatus === 'polling_fallback'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-rose-400'
            }`}
          />
          <Activity className="w-3 h-3" />
          <span>{isConnected ? 'LIVE SYNC' : connectionStatus.toUpperCase()}</span>
        </div>

        {/* Transport Mode Toggle Button (SSE vs Smart Polling) */}
        <button
          onClick={toggleTransport}
          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] hover:text-white transition cursor-pointer"
          title="Click to toggle between Server-Sent Events (SSE) and Smart Polling"
        >
          Protocol: <span className="text-sky-300 font-bold">{transportMode}</span>
        </button>

        {/* Round-trip Latency */}
        <span
          className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-slate-400"
          title="Round-trip data propagation latency"
        >
          ⚡ {latencyMs}ms
        </span>

        {/* Sound Alerts Toggle (Flashscore / SofaScore Model) */}
        <button
          onClick={() => setSoundAlertsEnabled((prev) => !prev)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold transition cursor-pointer ${
            soundAlertsEnabled
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle scoring and alert chimes (Flashscore & SofaScore audio model)"
        >
          {soundAlertsEnabled ? (
            <>
              <Volume2 className="w-3 h-3 text-emerald-400" />
              <span>Audio: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3 h-3 text-slate-500" />
              <span>Audio: MUTED</span>
            </>
          )}
        </button>
      </div>

      {/* Center: Live Game Synchronized Pill with Quick Switch Trigger */}
      {selectedGame && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsGameSwitcherOpen(true)}
            className="flex items-center gap-2 bg-[#121620] hover:bg-[#181d2a] border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-slate-200 hover:border-amber-400 transition cursor-pointer"
            title="Click or press 'G' to switch active game"
          >
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="font-bold text-white">
              {selectedGame.awayTeam} {selectedGame.awayScore} @ {selectedGame.homeTeam} {selectedGame.homeScore}
            </span>
            <span className="text-amber-400 font-bold">
              {selectedGame.quarter} {selectedGame.clockDisplay}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
              Switch [G]
            </span>
          </button>

          {/* Red Zone Auto-Lock Indicator (FanDuel/DraftKings model) */}
          {selectedGame.isRedZone && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[10px] font-bold animate-pulse">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>RED ZONE (ODDS AUTO-LOCKED)</span>
            </span>
          )}
        </div>
      )}

      {/* Right: Architecture Inspector, UI Principles, Shortcuts & Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Play Simulator Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSimMenu(!showSimMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition cursor-pointer"
            title="Simulate live football game events in real time"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Simulate</span>
            <ChevronDown className="w-3 h-3 text-amber-400" />
          </button>

          {showSimMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-52 bg-[#12161f] border border-white/15 rounded-lg shadow-2xl p-1 z-50 text-[11px]"
              onMouseLeave={() => setShowSimMenu(false)}
            >
              <div className="px-2 py-1 text-[9px] text-slate-400 uppercase font-mono border-b border-white/10 mb-1">
                Real-Time Event Triggers
              </div>
              <button
                onClick={() => {
                  simulatePlay('TOUCHDOWN');
                  setShowSimMenu(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 flex items-center gap-2 text-emerald-300 transition cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>Touchdown (+7 pts, &Delta;WP)</span>
              </button>
              <button
                onClick={() => {
                  simulatePlay('RED_ZONE');
                  setShowSimMenu(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 flex items-center gap-2 text-rose-300 transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Red Zone Snap (Lock Odds)</span>
              </button>
              <button
                onClick={() => {
                  simulatePlay('INTERCEPTION');
                  setShowSimMenu(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 flex items-center gap-2 text-amber-300 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Interception (Turnover &Delta;WP)</span>
              </button>
              <div className="h-px bg-white/10 my-1" />
              <button
                onClick={() => {
                  simulatePlay('RESET');
                  setShowSimMenu(false);
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-white/10 flex items-center gap-2 text-slate-400 hover:text-white transition text-[10px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Simulation State</span>
              </button>
            </div>
          )}
        </div>

        {/* 10 UI Principles Inspector Button */}
        <button
          onClick={() => setIsUiModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition cursor-pointer"
          title="Learn how 10 top sports, betting, and sports APIs keep UI user-friendly"
        >
          <Compass className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">10 UI</span> Principles
        </button>

        {/* 10-Platform Architecture Inspector Button */}
        <button
          onClick={() => setIsArchitectureModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-[11px] font-bold transition cursor-pointer"
          title="Learn how 10 top sports, betting, and sports APIs keep data correct & real-time"
        >
          <Layers className="w-3 h-3 text-sky-400" />
          <span className="hidden sm:inline">Realtime</span> Arch
        </button>

        {/* Keyboard Shortcuts Button */}
        <button
          onClick={() => setIsShortcutsModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-bold transition cursor-pointer"
          title="View Keyboard Shortcuts [?]"
        >
          <Keyboard className="w-3 h-3 text-sky-400" />
          <span className="hidden sm:inline">Keys [?]</span>
        </button>

        {/* Fast Force Sync */}
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
          title="Force immediate cache revalidation & sync"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
