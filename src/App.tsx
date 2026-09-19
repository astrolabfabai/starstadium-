import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, SeasonCode } from './types';
import { Sidebar } from './components/Sidebar';
import { DashboardGrid } from './components/DashboardGrid';
import { GamedayCommandBar } from './components/GamedayCommandBar';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { GoogleAiAssistant } from './components/GoogleAiAssistant';
import { OllamaAssistant } from './components/OllamaAssistant';
import { ScoringNotificationProvider } from './context/ScoringNotificationContext';
import { ScoringToastContainer } from './components/notifications/ScoringToastContainer';
import { ScoringNotificationCenterModal } from './components/notifications/ScoringNotificationCenterModal';
import { NotificationBellButton } from './components/notifications/NotificationBellButton';
import { Menu, Sparkles, User, Shield, RefreshCw, CheckCircle2, Calendar, Radio } from 'lucide-react';

interface CurrentSeasonInfo {
  season: SeasonCode;
  year: number;
  seasonType: string;
  week: number;
  label: string;
  source: string;
  timestamp?: string;
}

function AppContent() {
  const [activeView, setActiveView] = useState<ViewMode>('scoreboard');
  const [selectedSeason, setSelectedSeason] = useState<SeasonCode>('2026REG');
  const [currentSeasonInfo, setCurrentSeasonInfo] = useState<CurrentSeasonInfo>({
    season: '2026REG',
    year: 2026,
    seasonType: 'REG',
    week: 1,
    label: '2026 NFL Regular Season',
    source: 'sportsdata_io_current_season_api'
  });
  const [selectedGameKey, setSelectedGameKey] = useState<string>('202610101');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [aiContextData, setAiContextData] = useState<any>(null);
  const [isOllamaOpen, setIsOllamaOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

  const handleSelectGame = (gameKey: string) => {
    setSelectedGameKey(gameKey);
    setActiveView('playbyplay');
  };

  // Fetch current season from SportsData API endpoint
  const fetchCurrentSeason = useCallback(async () => {
    try {
      const [seasonRes, weekRes] = await Promise.all([
        fetch('/api/sportsdata/current-season'),
        fetch('/api/sportsdata/current-week')
      ]);

      let weekNum = 1;
      if (weekRes.ok) {
        const weekData = await weekRes.json();
        if (typeof weekData.week === 'number') {
          weekNum = weekData.week;
        }
      }

      if (seasonRes.ok) {
        const data = await seasonRes.json();
        if (data && data.season) {
          const updated: CurrentSeasonInfo = {
            season: data.season as SeasonCode,
            year: data.year || 2026,
            seasonType: data.seasonType || 'REG',
            week: weekNum,
            label: data.label || '2026 NFL Regular Season',
            source: data.source || 'sportsdata_io_current_season_api',
            timestamp: new Date().toISOString()
          };
          setCurrentSeasonInfo(updated);
          setSelectedSeason(updated.season);
        }
      }
    } catch (err) {
      console.warn('Could not fetch current season from API, fallback to active 2026REG:', err);
    }
  }, []);

  useEffect(() => {
    fetchCurrentSeason();
  }, [fetchCurrentSeason]);

  // Global user-triggered live refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCurrentSeason();
      // Increment refreshKey to trigger re-rendering and data fetching in views
      setRefreshKey((prev) => prev + 1);
      // Dispatch custom event for widgets listening to data refresh
      window.dispatchEvent(
        new CustomEvent('starstadium:refresh-data', {
          detail: { season: selectedSeason, timestamp: Date.now() }
        })
      );
      setLastRefreshedAt(new Date().toLocaleTimeString());
      setRefreshNotification(`Synced ${selectedSeason} (Week ${currentSeasonInfo.week}) from live feeds`);
      setTimeout(() => setRefreshNotification(null), 3000);
    } catch (err) {
      console.error('Failed refreshing data:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleOpenAiWithPrompt = (prompt?: string, context?: any) => {
    setAiInitialPrompt(prompt || '');
    setAiContextData(context || null);
    setIsAiAssistantOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col lg:flex-row relative">
      {/* Real-time Scoring Drive Toast Notifications Overlay */}
      <ScoringToastContainer
        onSelectGame={handleSelectGame}
        onOpenAiWithPrompt={handleOpenAiWithPrompt}
      />

      {/* Slide-over Scoring Notification Center History Drawer */}
      <ScoringNotificationCenterModal
        onSelectGame={handleSelectGame}
        onOpenAiWithPrompt={handleOpenAiWithPrompt}
        onNavigateToAlertsHub={() => setActiveView('alerts')}
      />

      {/* Left Combined Sidebar Menu */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        selectedSeason={selectedSeason}
        onSeasonChange={setSelectedSeason}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenGoogleAi={() => handleOpenAiWithPrompt()}
        onOpenOllama={() => setIsOllamaOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Area (Offset by left sidebar on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Mobile Header with Hamburger, Current Season, & Refresh */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0c0c0e]/95 backdrop-blur border-b border-white/10 px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-lg bg-[#18181b] text-slate-300 hover:text-white border border-white/10"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🏈</span>
              <h1 className="text-sm font-bold text-white uppercase italic tracking-wider font-serif">
                Star<span className="text-amber-500 font-sans not-italic font-black">Stadium</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mobile Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-2 py-1 rounded bg-[#18181b] border border-amber-500/30 text-amber-400 hover:text-white flex items-center gap-1 text-[11px] font-mono font-bold"
              title="Refresh Current Season Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
              <span>{selectedSeason}</span>
            </button>

            <NotificationBellButton />
            <button
              onClick={() => setActiveView('user_account')}
              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                activeView === 'user_account' ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-[#18181b] text-sky-400 border-white/10'
              }`}
              title="User Account"
              aria-label="User Account"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                activeView === 'admin' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-[#18181b] text-amber-400 border-white/10'
              }`}
              title="Server Admin"
              aria-label="Server Admin"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Desktop Top Status, Current Season & Live Refresh Control Bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-[#0c0d10] border-b border-white/10 text-xs">
          {/* Current Season Badges & Broadcast Status */}
          <div className="flex items-center gap-3 font-mono">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>LIVE BROADCAST</span>
            </div>

            {/* Current Season Info Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#141518] border border-white/10 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Current Season:</span>
              <strong className="text-amber-400 font-bold">{currentSeasonInfo.label}</strong>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                Week {currentSeasonInfo.week}
              </span>
            </div>

            {/* Data Source & Auto-Refresh Policy Badge */}
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Refresh: Only During Games</span>
            </div>
          </div>

          {/* Right Action Controls: Refresh Button, Notification Center, AI Assistant */}
          <div className="flex items-center gap-3">
            {/* Global Season Data Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-[#141518] hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-400 hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="Refresh Current Season Data & Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
              <span>{isRefreshing ? 'Refreshing Data...' : 'Refresh Current Season'}</span>
              <span className="text-[10px] text-slate-500 font-normal border-l border-white/10 pl-2">
                {lastRefreshedAt}
              </span>
            </button>

            {/* Real-Time Notification Bell Action */}
            <NotificationBellButton showLabel />

            <button
              onClick={() => handleOpenAiWithPrompt('Analyze key offensive and red zone trends across the current NFL slate.')}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 text-amber-400 hover:text-white hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Coach Assistant</span>
            </button>
          </div>
        </div>

        {/* Temporary Refresh Flash Toast */}
        {refreshNotification && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 px-6 py-1.5 text-xs font-mono flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{refreshNotification}</span>
          </div>
        )}

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-2.5 sm:p-4 lg:p-5 max-w-7xl w-full mx-auto space-y-3.5">
          <GamedayCommandBar
            selectedGameKey={selectedGameKey}
            onSelectGameKey={setSelectedGameKey}
            activeView={activeView}
            onViewChange={setActiveView}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            onOpenGoogleAi={() => handleOpenAiWithPrompt(`Analyze active game matchup key: ${selectedGameKey}`)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
          <DashboardGrid
            activeView={activeView}
            onViewChange={setActiveView}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={setSelectedGameKey}
            refreshKey={refreshKey}
          />
        </main>

        {/* App Footer */}
        <footer className="border-t border-white/10 bg-[#0c0c0e] py-3 text-center text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              🏈 StarStadium Analytics Studio &bull; SportsData.io NFL Feeds &bull; {selectedSeason} (Week {currentSeasonInfo.week})
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              Last Refreshed: {lastRefreshedAt} &bull; Real-Time Scoring Alert Engine
            </span>
          </div>
        </footer>
      </div>

      {/* API Inspector Modal */}
      <ApiInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      {/* Google AI Coach Assistant Drawer (Gemini 3.7 Flash & Dual Ollama Engine) */}
      <GoogleAiAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        initialPrompt={aiInitialPrompt}
        activeContextData={aiContextData}
      />

      {/* Local Ollama Assistant Drawer (Optional standalone) */}
      <OllamaAssistant
        isOpen={isOllamaOpen}
        onClose={() => setIsOllamaOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ScoringNotificationProvider>
      <AppContent />
    </ScoringNotificationProvider>
  );
}


