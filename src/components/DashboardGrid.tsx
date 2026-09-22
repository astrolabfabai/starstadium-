import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewMode, WidgetConfig, SeasonCode } from '../types';

// Code-split all views with React.lazy for high-performance bundle loading
const StandingsView = lazy(() => import('./views/StandingsView').then((m) => ({ default: m.StandingsView })));
const TeamsRostersView = lazy(() => import('./views/TeamsRostersView').then((m) => ({ default: m.TeamsRostersView })));
const ScheduleVenueView = lazy(() => import('./views/ScheduleVenueView').then((m) => ({ default: m.ScheduleVenueView })));
const ScoreboardLiveView = lazy(() => import('./views/ScoreboardLiveView').then((m) => ({ default: m.ScoreboardLiveView })));
const GameHighlightsAutomationView = lazy(() => import('./views/GameHighlightsAutomationView').then((m) => ({ default: m.GameHighlightsAutomationView })));
const PlayerLeaderboardsView = lazy(() => import('./views/PlayerLeaderboardsView').then((m) => ({ default: m.PlayerLeaderboardsView })));
const PlayByPlayView = lazy(() => import('./views/PlayByPlayView').then((m) => ({ default: m.PlayByPlayView })));
const DepthInjuryView = lazy(() => import('./views/DepthInjuryView').then((m) => ({ default: m.DepthInjuryView })));
const BettingOddsView = lazy(() => import('./views/BettingOddsView').then((m) => ({ default: m.BettingOddsView })));
const FantasyDfsView = lazy(() => import('./views/FantasyDfsView').then((m) => ({ default: m.FantasyDfsView })));
const DraftPickAnalyzerView = lazy(() => import('./views/DraftPickAnalyzerView').then((m) => ({ default: m.DraftPickAnalyzerView })));
const DraftMockSimulatorView = lazy(() => import('./views/DraftMockSimulatorView').then((m) => ({ default: m.DraftMockSimulatorView })));
const WinProbabilityEngineView = lazy(() => import('./views/WinProbabilityEngineView').then((m) => ({ default: m.WinProbabilityEngineView })));
const NewsTransactionsView = lazy(() => import('./views/NewsTransactionsView').then((m) => ({ default: m.NewsTransactionsView })));
const DbViewerView = lazy(() => import('./views/DbViewerView').then((m) => ({ default: m.DbViewerView })));
const UserAccountView = lazy(() => import('./views/UserAccountView').then((m) => ({ default: m.UserAccountView })));
const ServerAdminView = lazy(() => import('./views/ServerAdminView').then((m) => ({ default: m.ServerAdminView })));
const AlertsCenterView = lazy(() => import('./views/AlertsCenterView').then((m) => ({ default: m.AlertsCenterView })));
const RedZoneView = lazy(() => import('./views/RedZoneView'));
const PossessionView = lazy(() => import('./views/PossessionView'));

const ViewLoadingFallback = () => (
  <div className="w-full min-h-[360px] flex flex-col items-center justify-center p-8 bg-[#121214] border border-white/5 rounded-2xl animate-pulse">
    <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
    <span className="text-xs uppercase tracking-widest text-white/40 font-mono">Loading telemetry view...</span>
  </div>
);
import {
  DEFAULT_WIDGET_CONFIGS,
  reorderWidgets,
  reorderWidgetsById,
  moveWidget,
  applyLayoutPreset,
  loadSavedWidgetLayout,
  saveWidgetLayout,
  LayoutPreset,
  LAYOUT_PRESETS
} from '../utils/widgetLayoutUtils';
import { DashboardWidgetWrapper } from './widgets/DashboardWidgetWrapper';
import { CustomizeLayoutDrawer } from './widgets/CustomizeLayoutDrawer';
import { playScoringChime } from '../utils/audioChime';
import {
  LayoutGrid,
  Eye,
  EyeOff,
  Move,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  ArrowUpDown,
  Check,
  Zap
} from 'lucide-react';

interface DashboardGridProps {
  activeView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  selectedSeason?: SeasonCode;
  onSeasonChange?: (season: SeasonCode) => void;
  selectedGameKey?: string;
  onSelectGameKey?: (key: string) => void;
  refreshKey?: number;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  activeView,
  onViewChange,
  selectedSeason = '2026REG',
  onSeasonChange,
  selectedGameKey,
  onSelectGameKey,
  refreshKey = 0
}) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => loadSavedWidgetLayout());
  const [isCustomizeMode, setIsCustomizeMode] = useState<boolean>(false);

  // Drag-and-drop state on master canvas
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

  // Transient notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Sync with localStorage whenever widgets state changes
  useEffect(() => {
    saveWidgetLayout(widgets);
  }, [widgets]);

  const toggleWidgetVisibility = (id: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
      const target = updated.find((w) => w.id === id);
      showToast(target?.visible ? `Enabled "${target.title}"` : `Hidden "${target?.title}"`);
      return updated;
    });
  };

  const handleToggleAllVisibility = (visible: boolean) => {
    setWidgets((prev) => prev.map((w) => ({ ...w, visible })));
    showToast(visible ? 'All 15 modules visible on canvas' : 'All modules hidden');
  };

  const handleToggleCollapse = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, collapsed: !w.collapsed } : w))
    );
  };

  const handleToggleAllCollapse = (collapsed: boolean) => {
    setWidgets((prev) => prev.map((w) => ({ ...w, collapsed })));
    showToast(collapsed ? 'Collapsed all modules to compact strips' : 'Expanded all modules');
  };

  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGET_CONFIGS);
    playScoringChime('field_goal');
    showToast('Reset dashboard to default 1-15 sequence');
  };

  const handleApplyPreset = (preset: LayoutPreset) => {
    setWidgets((prev) => applyLayoutPreset(prev, preset));
    playScoringChime('alert');
    showToast(`Applied preset: ${preset.name}`);
  };

  const handleMoveWidgetByDirection = (
    widgetId: string,
    direction: 'up' | 'down' | 'top' | 'bottom'
  ) => {
    setWidgets((prev) => {
      const updated = moveWidget(prev, widgetId, direction);
      const movedItem = updated.find((w) => w.id === widgetId);
      const newIndex = updated.findIndex((w) => w.id === widgetId);
      showToast(`Moved "${movedItem?.title}" to Priority #${newIndex + 1}`);
      return updated;
    });
    playScoringChime('alert');
  };

  const handleReorderWidgetsInDrawer = (sourceIndex: number, targetIndex: number) => {
    setWidgets((prev) => {
      const updated = reorderWidgets(prev, sourceIndex, targetIndex);
      const movedItem = updated[targetIndex];
      showToast(`Prioritized "${movedItem?.title}" at #${targetIndex + 1}`);
      return updated;
    });
    playScoringChime('alert');
  };

  // Canvas Drag-and-Drop Handlers
  const handleWidgetDragStart = (e: React.DragEvent<HTMLDivElement>, widgetId: string) => {
    setDraggedWidgetId(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
  };

  const handleWidgetDragOver = (e: React.DragEvent<HTMLDivElement>, widgetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedWidgetId && draggedWidgetId !== widgetId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const pos = e.clientY < midY ? 'top' : 'bottom';
      setDropTargetId(widgetId);
      setDropPosition(pos);
    }
  };

  const handleWidgetDragLeave = (e: React.DragEvent<HTMLDivElement>, widgetId: string) => {
    // Only clear if leaving the target element
    if (dropTargetId === widgetId) {
      setDropTargetId(null);
      setDropPosition(null);
    }
  };

  const handleWidgetDrop = (e: React.DragEvent<HTMLDivElement>, targetWidgetId: string) => {
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== targetWidgetId) {
      const insertBefore = dropPosition === 'top';
      setWidgets((prev) => {
        const updated = reorderWidgetsById(prev, draggedWidgetId, targetWidgetId, insertBefore);
        const targetItem = updated.find((w) => w.id === draggedWidgetId);
        const newRank = updated.findIndex((w) => w.id === draggedWidgetId) + 1;
        showToast(`Dropped "${targetItem?.title}" into Priority #${newRank}!`);
        return updated;
      });
      playScoringChime('alert');
    }

    setDraggedWidgetId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleWidgetDragEnd = () => {
    setDraggedWidgetId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleGameSelectAndNavigate = (gameKey: string) => {
    if (onSelectGameKey) {
      onSelectGameKey(gameKey);
    }
    onViewChange('playbyplay');
  };

  const handleNavigateToHighlights = (gameKey: string) => {
    if (onSelectGameKey) {
      onSelectGameKey(gameKey);
    }
    onViewChange('highlights');
  };

  const handleNavigateToWinProb = (gameKey: string) => {
    if (onSelectGameKey) {
      onSelectGameKey(gameKey);
    }
    onViewChange('win_probability');
  };

  const renderActiveSingleView = (view: ViewMode) => {
    switch (view) {
      case 'standings':
        return <StandingsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'teams':
        return <TeamsRostersView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'schedule':
        return (
          <ScheduleVenueView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            onSelectGame={handleGameSelectAndNavigate}
          />
        );
      case 'scoreboard':
        return (
          <ScoreboardLiveView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
            onNavigateToPlayByPlay={handleGameSelectAndNavigate}
            onNavigateToHighlights={handleNavigateToHighlights}
            onNavigateToWinProbability={handleNavigateToWinProb}
          />
        );
      case 'highlights':
        return (
          <GameHighlightsAutomationView
            selectedSeason={selectedSeason}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
            onNavigateToGame={handleGameSelectAndNavigate}
          />
        );
      case 'stats':
        return <PlayerLeaderboardsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'plays':
      case 'playbyplay':
        return (
          <PlayByPlayView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
          />
        );
      case 'red_zone':
        return (
          <RedZoneView
            selectedSeason={selectedSeason as SeasonCode}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
          />
        );
      case 'possession':
        return (
          <PossessionView
            selectedSeason={selectedSeason as SeasonCode}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
          />
        );
      case 'depth_injuries':
        return <DepthInjuryView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'betting':
        return (
          <BettingOddsView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
          />
        );
      case 'fantasy':
        return <FantasyDfsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'draft_analyzer':
        return <DraftPickAnalyzerView />;
      case 'draft_simulator':
        return <DraftMockSimulatorView onNavigateToTrades={() => onViewChange('draft_analyzer')} />;
      case 'win_probability':
        return (
          <WinProbabilityEngineView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
          />
        );
      case 'news':
        return <NewsTransactionsView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'db_viewer':
        return <DbViewerView selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />;
      case 'user_account':
        return <UserAccountView selectedSeason={selectedSeason} onNavigateToView={onViewChange} />;
      case 'admin':
        return <ServerAdminView selectedSeason={selectedSeason} />;
      case 'alerts':
        return (
          <AlertsCenterView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            onNavigateToPlayByPlay={handleGameSelectAndNavigate}
          />
        );
      default:
        return (
          <ScoreboardLiveView
            selectedSeason={selectedSeason}
            onSeasonChange={onSeasonChange}
            selectedGameKey={selectedGameKey}
            onSelectGameKey={onSelectGameKey}
            onNavigateToPlayByPlay={handleGameSelectAndNavigate}
            onNavigateToHighlights={handleNavigateToHighlights}
            onNavigateToWinProbability={handleNavigateToWinProb}
          />
        );
    }
  };

  // If viewing a specific single view tab directly
  if (activeView !== 'dashboard') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <Suspense fallback={<ViewLoadingFallback />}>
            {renderActiveSingleView(activeView)}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Master Dashboard View with customizable widget grid
  const renderWidgetContent = (type: ViewMode) => {
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        {renderActiveSingleView(type)}
      </Suspense>
    );
  };

  const visibleWidgets = widgets.filter((w) => w.visible);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-workspace"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-5"
      >
        {/* Floating / Top Toast Alert when reordered */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className="fixed top-20 right-6 z-50 pointer-events-none"
            >
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-2xl border border-amber-300 flex items-center gap-2 text-xs font-mono">
                <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Workspace Toolbar */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500 border border-amber-500/30 shadow-inner">
              <span className="text-xl">🏈</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-wide uppercase italic font-serif flex items-center gap-1.5">
                  Star<span className="text-amber-500 font-sans not-italic font-extrabold">Stadium</span> Workspace
                </h2>
                <span className="text-[10px] font-mono not-italic text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {visibleWidgets.length} / {widgets.length} Modules Active
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Drag &amp; Drop Reordering Enabled
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Prioritize the data feeds you care about most &bull; Grab any header to drag or use the Layout Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            {/* Quick Preset Selector Buttons */}
            <div className="hidden xl:flex items-center gap-1 bg-[#0a0a0d] p-1 rounded-xl border border-white/10">
              {LAYOUT_PRESETS.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                  title={p.description}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCustomizeMode(!isCustomizeMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isCustomizeMode
                  ? 'bg-amber-500 text-slate-950 font-black shadow-amber-500/25 ring-2 ring-amber-400'
                  : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isCustomizeMode ? 'Close Layout Studio' : 'Prioritize & Customize'}</span>
            </button>

            <button
              onClick={resetLayout}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
              title="Reset order to default 1-15 sequence"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Customization Drawer when active */}
        {isCustomizeMode && (
          <CustomizeLayoutDrawer
            widgets={widgets}
            onReorderWidgets={handleReorderWidgetsInDrawer}
            onMoveWidget={handleMoveWidgetByDirection}
            onToggleVisibility={toggleWidgetVisibility}
            onToggleAllVisibility={handleToggleAllVisibility}
            onToggleAllCollapse={handleToggleAllCollapse}
            onApplyPreset={handleApplyPreset}
            onResetDefault={resetLayout}
            onClose={() => setIsCustomizeMode(false)}
          />
        )}

        {/* Dynamic Reorderable Widget Grid */}
        <div className="space-y-4 sm:space-y-6">
          {visibleWidgets.length === 0 ? (
            <div className="bg-[#121214] border border-dashed border-white/20 rounded-2xl p-8 text-center space-y-3">
              <Layers className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
              <h3 className="text-sm font-bold text-white">All Dashboard Modules are Currently Hidden</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Use the layout controls above to enable or restore any of the 15 NFL analytics views.
              </p>
              <button
                onClick={() => handleToggleAllVisibility(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shadow-lg"
              >
                Restore All 15 Modules
              </button>
            </div>
          ) : (
            visibleWidgets.map((widget, visibleIdx) => {
              const priorityRank = visibleIdx + 1;
              const isCurrentDragged = draggedWidgetId === widget.id;
              const dropIndicatorPos =
                dropTargetId === widget.id && draggedWidgetId !== widget.id
                  ? dropPosition
                  : null;

              return (
                <motion.div
                  key={widget.id}
                  layout="position"
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                  className="w-full relative"
                >
                  <DashboardWidgetWrapper
                    widget={widget}
                    priorityIndex={priorityRank}
                    totalVisible={visibleWidgets.length}
                    isCustomizeMode={isCustomizeMode}
                    isDraggingCurrent={isCurrentDragged}
                    dropIndicatorPosition={dropIndicatorPos}
                    onDragStart={handleWidgetDragStart}
                    onDragOver={handleWidgetDragOver}
                    onDragLeave={handleWidgetDragLeave}
                    onDrop={handleWidgetDrop}
                    onDragEnd={handleWidgetDragEnd}
                    onMoveUp={(id) => handleMoveWidgetByDirection(id, 'up')}
                    onMoveDown={(id) => handleMoveWidgetByDirection(id, 'down')}
                    onToggleCollapse={handleToggleCollapse}
                    onToggleVisibility={toggleWidgetVisibility}
                    onOpenFullView={onViewChange}
                  >
                    {renderWidgetContent(widget.type)}
                  </DashboardWidgetWrapper>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

