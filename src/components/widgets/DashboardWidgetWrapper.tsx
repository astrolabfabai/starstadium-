import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Maximize2,
  Sparkles,
  Layers
} from 'lucide-react';
import { WidgetConfig, ViewMode } from '../../types';

interface DashboardWidgetWrapperProps {
  widget: WidgetConfig;
  priorityIndex: number; // 1-based index among visible items
  totalVisible: number;
  isCustomizeMode: boolean;
  isDraggingCurrent: boolean;
  dropIndicatorPosition: 'top' | 'bottom' | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, widgetId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, widgetId: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>, widgetId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, widgetId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onMoveUp: (widgetId: string) => void;
  onMoveDown: (widgetId: string) => void;
  onToggleCollapse: (widgetId: string) => void;
  onToggleVisibility: (widgetId: string) => void;
  onOpenFullView: (type: ViewMode) => void;
  children: React.ReactNode;
}

export const DashboardWidgetWrapper: React.FC<DashboardWidgetWrapperProps> = ({
  widget,
  priorityIndex,
  totalVisible,
  isCustomizeMode,
  isDraggingCurrent,
  dropIndicatorPosition,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onToggleCollapse,
  onToggleVisibility,
  onOpenFullView,
  children
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isTopPriority = priorityIndex === 1;
  const isSecondPriority = priorityIndex === 2;
  const isThirdPriority = priorityIndex === 3;

  return (
    <div
      id={`widget-container-${widget.id}`}
      onDragOver={(e) => onDragOver(e, widget.id)}
      onDragLeave={(e) => onDragLeave(e, widget.id)}
      onDrop={(e) => onDrop(e, widget.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl transition-all duration-200 ${
        isDraggingCurrent ? 'opacity-35 scale-[0.99] filter grayscale-[40%]' : 'opacity-100'
      }`}
    >
      {/* Top Drop Target Insertion Indicator */}
      {dropIndicatorPosition === 'top' && (
        <div className="relative py-1.5 z-40 animate-pulse">
          <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] flex items-center justify-between px-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-sm" />
            <span className="text-[10px] font-mono font-black uppercase text-amber-950 bg-amber-400 px-2 py-0.2 rounded-full -mt-4 shadow-md">
              Insert Priority #{priorityIndex} Here
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-sm" />
          </div>
        </div>
      )}

      {/* Module Card Frame */}
      <div
        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
          isCustomizeMode
            ? 'border-amber-500/40 bg-[#0d0d10] ring-1 ring-amber-500/20 shadow-lg'
            : isHovered
            ? 'border-white/20 bg-[#0c0c0e] shadow-xl'
            : 'border-white/10 bg-[#0a0a0c] shadow-md'
        }`}
      >
        {/* Module Header Bar with Drag Handle & Priority Rank */}
        <div
          draggable={true}
          onDragStart={(e) => onDragStart(e, widget.id)}
          onDragEnd={onDragEnd}
          className={`px-3.5 py-2.5 select-none flex flex-wrap items-center justify-between gap-2.5 border-b transition-colors cursor-grab active:cursor-grabbing ${
            isCustomizeMode
              ? 'bg-amber-950/20 border-amber-500/30'
              : 'bg-[#121216]/90 hover:bg-[#18181f] border-white/10'
          }`}
          title="Drag and drop this header to reorder widget priority"
        >
          {/* Left: Drag Handle, Priority Badge, Module Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Dedicated Grip Drag Handle */}
            <div
              className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                isCustomizeMode
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-white/5 hover:bg-amber-500/20 border-white/10 hover:border-amber-500/30 text-slate-400 hover:text-amber-300'
              }`}
              title="Click and drag to reorder priority"
            >
              <GripVertical className="w-4 h-4 shrink-0" />
            </div>

            {/* Dynamic Priority Rank Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-black uppercase tracking-wider border shadow-xs ${
                isTopPriority
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-amber-500/30 font-extrabold'
                  : isSecondPriority
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : isThirdPriority
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 text-slate-300 border-white/10'
              }`}
            >
              {isTopPriority && <Sparkles className="w-3 h-3 text-slate-950 shrink-0" />}
              <span>
                {isTopPriority ? 'PRIORITY #1' : `PRIORITY #${priorityIndex}`}
              </span>
            </div>

            {/* Title & Icon */}
            <div className="flex items-center gap-2 truncate">
              <span className="text-base shrink-0">{widget.icon || '🏈'}</span>
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">
                {widget.title}
              </h3>
            </div>

            {/* Category Tag */}
            <span className="hidden md:inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10 shrink-0">
              {widget.category}
            </span>
          </div>

          {/* Right: Quick Prioritization Controls & Views */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {/* Quick Move Up */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(widget.id);
              }}
              disabled={priorityIndex <= 1}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center justify-center ${
                priorityIndex <= 1
                  ? 'opacity-30 cursor-not-allowed border-transparent text-slate-600'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Move Priority Up (Shift+Up)"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Quick Move Down */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(widget.id);
              }}
              disabled={priorityIndex >= totalVisible}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center justify-center ${
                priorityIndex >= totalVisible
                  ? 'opacity-30 cursor-not-allowed border-transparent text-slate-600'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Move Priority Down (Shift+Down)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-white/10 mx-1" />

            {/* Open Standalone Tab */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenFullView(widget.type);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-colors flex items-center gap-1"
              title="Open as Standalone Full Screen View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(widget.id);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition-colors flex items-center justify-center"
              title={widget.collapsed ? 'Expand Module Content' : 'Collapse Module to Strip'}
            >
              {widget.collapsed ? (
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Hide From Canvas */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(widget.id);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 text-xs transition-colors flex items-center justify-center"
              title="Hide this module from dashboard"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Content or Collapsed Compact Strip */}
        <AnimatePresence initial={false}>
          {!widget.collapsed ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 sm:p-4"
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onToggleCollapse(widget.id)}
              className="px-4 py-3 bg-[#09090b] hover:bg-[#111115] cursor-pointer flex items-center justify-between text-xs text-slate-400 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-mono text-[11px] text-slate-300">
                  Module minimized (Priority #{priorityIndex}) &bull; Click anywhere on this strip to expand
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 hover:underline">
                Expand &rarr;
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Drop Target Insertion Indicator */}
      {dropIndicatorPosition === 'bottom' && (
        <div className="relative py-1.5 z-40 animate-pulse">
          <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] flex items-center justify-between px-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-sm" />
            <span className="text-[10px] font-mono font-black uppercase text-amber-950 bg-amber-400 px-2 py-0.2 rounded-full -mt-4 shadow-md">
              Insert Priority #{priorityIndex + 1} Here
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-sm" />
          </div>
        </div>
      )}
    </div>
  );
};
