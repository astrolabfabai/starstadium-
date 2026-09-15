import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Cookie,
  RotateCcw,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Zap,
  Play,
  Flame,
  Info
} from 'lucide-react';
import { useScoringNotifications } from '../../context/ScoringNotificationContext';
import {
  getStoredAlertsConfig,
  saveAlertsConfigToCookies,
  clearAlertCookies,
  getAlertCookieMeta,
  COOKIE_NAMES,
  StoredAlertsConfig,
  AlertsFilterConfig,
  DEFAULT_ALERTS_FILTER
} from '../../utils/cookieUtils';

export interface ScoringAlertSettingsProps {
  variant?: 'card' | 'compact' | 'drawer' | 'panel';
  className?: string;
  showCookieDetails?: boolean;
  showTestButton?: boolean;
  showResetButton?: boolean;
  onSettingsChange?: (config: StoredAlertsConfig) => void;
  title?: string;
  subtitle?: string;
}

/**
 * ScoringAlertSettings
 * 
 * Centralized component managing game scoring alert toggles.
 * - Defaults strictly to OFF unless the user explicitly enables it.
 * - Persists preferences in browser cookies using 'js-cookie' (365 days, SameSite=Lax).
 * - Synchronizes with ScoringNotificationContext and document cookies across application reloads.
 */
export const ScoringAlertSettings: React.FC<ScoringAlertSettingsProps> = ({
  variant = 'card',
  className = '',
  showCookieDetails = true,
  showTestButton = true,
  showResetButton = true,
  onSettingsChange,
  title = 'Scoring Alert Settings',
  subtitle = 'Configure real-time touchdown, field goal, and turnover alerts with cookie persistence'
}) => {
  // Use context if available
  const context = useScoringNotifications();

  // Local state as fallback if context is not present
  const [localConfig, setLocalConfig] = useState<StoredAlertsConfig>(() => getStoredAlertsConfig());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derive active values (favoring context when rendered within provider)
  const isEnabled = context ? context.isNotificationsEnabled : localConfig.alertsEnabled;
  const isSound = context ? context.isSoundEnabled : localConfig.soundEnabled;
  const isSimulation = context ? context.isAutoSimulationActive : localConfig.autoSimulation;
  const filters: AlertsFilterConfig = context ? context.alertFilters : (localConfig.filters || DEFAULT_ALERTS_FILTER);
  const cookieMeta = context ? context.cookieMeta : getAlertCookieMeta();

  const showFeedback = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Master alert toggle handler
  const handleToggleAlerts = () => {
    const nextState = !isEnabled;
    if (context) {
      context.setIsNotificationsEnabled(nextState);
    } else {
      const updated = saveAlertsConfigToCookies({ alertsEnabled: nextState });
      setLocalConfig(updated);
      if (onSettingsChange) onSettingsChange(updated);
    }
    showFeedback(
      nextState
        ? '✓ Alerts enabled & saved to browser cookie!'
        : '✓ Alerts turned OFF & saved to cookie'
    );
  };

  // Sound toggle handler
  const handleToggleSound = () => {
    const nextState = !isSound;
    if (context) {
      context.setIsSoundEnabled(nextState);
    } else {
      const updated = saveAlertsConfigToCookies({ soundEnabled: nextState });
      setLocalConfig(updated);
      if (onSettingsChange) onSettingsChange(updated);
    }
    showFeedback(nextState ? 'Audio chimes enabled' : 'Audio chimes muted');
  };

  // Live simulation toggle handler
  const handleToggleSimulation = () => {
    const nextState = !isSimulation;
    if (context) {
      context.setIsAutoSimulationActive(nextState);
    } else {
      const updated = saveAlertsConfigToCookies({ autoSimulation: nextState });
      setLocalConfig(updated);
      if (onSettingsChange) onSettingsChange(updated);
    }
    showFeedback(nextState ? 'Background score simulator started' : 'Simulator paused');
  };

  // Category filter toggle handler
  const handleToggleCategory = (cat: keyof AlertsFilterConfig) => {
    if (context) {
      context.toggleFilterCategory(cat);
    } else {
      const nextFilters = { ...filters, [cat]: !filters[cat] };
      const updated = saveAlertsConfigToCookies({ filters: nextFilters });
      setLocalConfig(updated);
      if (onSettingsChange) onSettingsChange(updated);
    }
    showFeedback(`Filter updated and persisted`);
  };

  // Reset all cookies back to default (OFF)
  const handleResetToDefaults = () => {
    if (context) {
      context.resetCookiesAndTurnOff();
    } else {
      const def = clearAlertCookies();
      setLocalConfig(def);
      if (onSettingsChange) onSettingsChange(def);
    }
    showFeedback('✓ Cookies cleared. Alerts reset to default OFF');
  };

  // Trigger test alert
  const handleTestAlert = () => {
    if (context) {
      context.triggerSampleScoringDrive('TOUCHDOWN');
      showFeedback('Triggered test touchdown drive alert!');
    } else {
      showFeedback('Test alert trigger requires NotificationProvider');
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div
      id="scoring-alert-settings"
      className={`relative bg-slate-900/90 border border-slate-700/70 rounded-2xl p-5 sm:p-6 text-slate-100 shadow-xl backdrop-blur-md overflow-hidden ${className}`}
    >
      {/* Toast Feedback Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-3 right-3 z-30 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg backdrop-blur-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${isEnabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {isEnabled ? <Bell className="w-5 h-5 animate-pulse" /> : <BellOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {title}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${isEnabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {isEnabled ? 'ACTIVE (Cookie Saved)' : 'OFF (Default)'}
                </span>
              </h2>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {showTestButton && (
            <button
              onClick={handleTestAlert}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Test a simulated scoring alert toast"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Test Alert</span>
            </button>
          )}
          {showResetButton && (
            <button
              onClick={handleResetToDefaults}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Clear all cookies and return to factory default OFF"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Switch: Game Alerts (Defaults to OFF) */}
      <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${isEnabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            <Radio className={`w-5 h-5 ${isEnabled ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Live Game Scoring Alerts</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Default: OFF
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Receive real-time toasts when touchdowns, field goals, or turnovers occur. Persisted in browser cookies.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <button
          onClick={handleToggleAlerts}
          role="switch"
          aria-checked={isEnabled}
          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            isEnabled ? 'bg-emerald-600' : 'bg-slate-700'
          }`}
        >
          <span className="sr-only">Toggle game scoring alerts</span>
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Secondary Controls Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 ${!isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Audio Chime Setting */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${isSound ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {isSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Audio Chimes</div>
              <div className="text-[11px] text-slate-400">Play chime on score</div>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            role="switch"
            aria-checked={isSound}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isSound ? 'bg-sky-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isSound ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Live Simulation Setting */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${isSimulation ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              <Play className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Auto Simulator</div>
              <div className="text-[11px] text-slate-400">Feed drives every 18s</div>
            </div>
          </div>
          <button
            onClick={handleToggleSimulation}
            role="switch"
            aria-checked={isSimulation}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isSimulation ? 'bg-amber-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isSimulation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Category Checkboxes */}
      {!isCompact && (
        <div className={`mt-4 pt-3 border-t border-slate-800/80 ${!isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-2.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Alert Event Categories</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'touchdowns', label: 'Touchdowns', color: 'border-emerald-500/30 text-emerald-400', emoji: '🏈' },
              { id: 'fieldGoals', label: 'Field Goals', color: 'border-blue-500/30 text-blue-400', emoji: '🎯' },
              { id: 'defensive', label: 'Pick-Six & Def', color: 'border-purple-500/30 text-purple-400', emoji: '🛡️' },
              { id: 'safeties', label: 'Safeties', color: 'border-rose-500/30 text-rose-400', emoji: '⚠️' },
              { id: 'redzone', label: 'Red Zone 20yd', color: 'border-amber-500/30 text-amber-400', emoji: '🔥' }
            ].map((cat) => {
              const active = filters[cat.id as keyof AlertsFilterConfig];
              return (
                <button
                  key={cat.id}
                  onClick={() => handleToggleCategory(cat.id as keyof AlertsFilterConfig)}
                  className={`px-2.5 py-2 rounded-lg border text-left flex items-center justify-between text-xs transition-colors ${
                    active
                      ? 'bg-slate-800/90 border-slate-600 text-white font-semibold'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                  </span>
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${
                    active ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                  }`}>
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cookie Storage Telemetry & Compliance Inspector */}
      {showCookieDetails && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <Cookie className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Cookie Persistence:</span>
            <code className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-emerald-400 border border-slate-800">
              {COOKIE_NAMES.ALERTS_ENABLED}={String(isEnabled)}
            </code>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400">js-cookie v3.0.5 • 365 Days • SameSite=Lax</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>App reload resilient</span>
          </div>
        </div>
      )}
    </div>
  );
};
