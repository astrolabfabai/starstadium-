import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Search,
  Layers,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { WidgetConfig, ViewMode } from '../../types';
import { LAYOUT_PRESETS, LayoutPreset } from '../../utils/widgetLayoutUtils';

interface CustomizeLayoutDrawerProps {
  widgets: WidgetConfig[];
  onReorderWidgets: (sourceIndex: number, targetIndex: number) => void;
  onMoveWidget: (widgetId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onToggleVisibility: (widgetId: string) => void;
  onToggleAllVisibility: (visible: boolean) => void;
  onToggleAllCollapse: (collapsed: boolean) => void;
  onApplyPreset: (preset: LayoutPreset) => void;
  onResetDefault: () => void;
  onClose: () => void;
}

export const CustomizeLayoutDrawer: React.FC<CustomizeLayoutDrawerProps> = ({
  widgets,
  onReorderWidgets,
  onMoveWidget,
  onToggleVisibility,
  onToggleAllVisibility,
  onToggleAllCollapse,
  onApplyPreset,
  onResetDefault,
  onClose
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(widgets.map((w) => w.category)))];

  const visibleCount = widgets.filter((w) => w.visible).length;
  const areAllCollapsed = widgets.every((w) => w.collapsed);

  // Filtered widgets for list view
  const filteredWidgets = widgets.filter((w) => {
    const matchesSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Avoid clearing prematurely
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorderWidgets(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#0e0e12] border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-5"
    >
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black text-white uppercase tracking-wider font-mono">
              Dashboard Layout &amp; Priority Studio
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {visibleCount} of {widgets.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Drag and drop the cards below to prioritize which views appear first on your master workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onToggleAllCollapse(!areAllCollapsed)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors"
            title="Toggle compact view for all modules"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            {areAllCollapsed ? 'Expand All Modules' : 'Collapse All'}
          </button>

          <button
            onClick={() => onToggleAllVisibility(true)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            Show All
          </button>

          <button
            onClick={onResetDefault}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
            title="Reset to original 1-15 default order"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            Done Customizing
          </button>
        </div>
      </div>

      {/* Preset Strategy Cards */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick Strategy Presets (1-Click Reorder):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="p-3 rounded-xl border border-white/10 hover:border-amber-500/40 bg-white/5 hover:bg-amber-500/10 text-left transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  {preset.name}
                </span>
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 pt-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules to reorder..."
            className="w-full bg-[#121216] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium capitalize whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
              }`}
            >
              {cat === 'all' ? 'All Views' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Draggable Prioritization Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span>DRAG HANDLE / PRIORITY RANK</span>
          <span>QUICK ACTIONS &amp; VISIBILITY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredWidgets.map((widget) => {
            // Find global index in widgets array
            const globalIndex = widgets.findIndex((w) => w.id === widget.id);
            const isDragging = draggedIndex === globalIndex;
            const isOver = dragOverIndex === globalIndex;
            const priorityNumber = globalIndex + 1;

            return (
              <div
                key={widget.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, globalIndex)}
                onDragOver={(e) => handleDragOver(e, globalIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, globalIndex)}
                onDragEnd={handleDragEnd}
                className={`p-2.5 rounded-xl border transition-all select-none cursor-grab active:cursor-grabbing flex items-center justify-between gap-2 ${
                  isDragging
                    ? 'opacity-40 border-dashed border-amber-500 bg-amber-500/10 scale-[0.98]'
                    : isOver
                    ? 'border-amber-400 bg-amber-500/20 shadow-lg ring-2 ring-amber-500/40'
                    : widget.visible
                    ? 'bg-[#141418] hover:bg-[#1a1a22] border-white/10 hover:border-amber-500/30'
                    : 'bg-white/5 border-white/5 opacity-50'
                }`}
              >
                {/* Left: Grip, Priority #, Title */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="p-1 rounded bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-3.5 h-3.5 shrink-0" />
                  </div>

                  <span
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 border ${
                      priorityNumber === 1
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : priorityNumber <= 3
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    #{priorityNumber}
                  </span>

                  <span className="text-sm shrink-0">{widget.icon || '🏈'}</span>

                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {widget.title}
                    </p>
                    <span className="text-[9px] font-mono text-slate-400 block truncate">
                      {widget.category}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Move Buttons & Visibility Toggle */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveWidget(widget.id, 'top');
                    }}
                    disabled={globalIndex === 0}
                    className={`p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors ${
                      globalIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''
                    }`}
                    title="Move to Very Top"
                  >
                    <ChevronsUp className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveWidget(widget.id, 'up');
                    }}
                    disabled={globalIndex === 0}
                    className={`p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors ${
                      globalIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''
                    }`}
                    title="Move Up 1 Rank"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveWidget(widget.id, 'down');
                    }}
                    disabled={globalIndex === widgets.length - 1}
                    className={`p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors ${
                      globalIndex === widgets.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                    }`}
                    title="Move Down 1 Rank"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveWidget(widget.id, 'bottom');
                    }}
                    disabled={globalIndex === widgets.length - 1}
                    className={`p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors ${
                      globalIndex === widgets.length - 1 ? 'opacity-20 cursor-not-allowed' : ''
                    }`}
                    title="Move to Bottom"
                  >
                    <ChevronsDown className="w-3 h-3" />
                  </button>

                  <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(widget.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      widget.visible
                        ? 'text-amber-400 hover:bg-amber-500/20'
                        : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
                    }`}
                    title={widget.visible ? 'Hide from Dashboard' : 'Show on Dashboard'}
                  >
                    {widget.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
