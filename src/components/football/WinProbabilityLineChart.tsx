import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { WinProbabilityPoint } from '../../utils/winProbabilityEngine';
import {
  TrendingUp,
  Activity,
  Zap,
  Filter,
  Layers,
  Sparkles,
  Info,
  Clock,
  Target
} from 'lucide-react';

interface WinProbabilityLineChartProps {
  points: WinProbabilityPoint[];
  homeTeam: string;
  awayTeam: string;
  homeTeamColor?: string;
  awayTeamColor?: string;
  currentHomeScore?: number;
  currentAwayScore?: number;
  selectedPlayId?: number | null;
  onSelectPlay?: (play: WinProbabilityPoint) => void;
  showEpaOverlay?: boolean;
  onToggleEpaOverlay?: () => void;
  height?: number;
}

export const WinProbabilityLineChart: React.FC<WinProbabilityLineChartProps> = ({
  points = [],
  homeTeam = 'KC',
  awayTeam = 'BAL',
  homeTeamColor = '#e31837',
  awayTeamColor = '#241773',
  currentHomeScore = 0,
  currentAwayScore = 0,
  selectedPlayId = null,
  onSelectPlay,
  showEpaOverlay = false,
  onToggleEpaOverlay,
  height = 360
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<WinProbabilityPoint | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'BIG_SWINGS' | 'SCORING' | 'CLUTCH_4TH' | 'TURNOVERS'>('ALL');

  // Filtered nodes for chart pins
  const pinPoints = useMemo(() => {
    if (filterMode === 'BIG_SWINGS') return points.filter((p) => Math.abs(p.deltaHomeWp) >= 7.0 || p.isBigPlay);
    if (filterMode === 'SCORING') return points.filter((p) => p.isScoringPlay);
    if (filterMode === 'CLUTCH_4TH') return points.filter((p) => p.quarter >= 4);
    if (filterMode === 'TURNOVERS') return points.filter((p) => p.isTurnover);
    return points;
  }, [points, filterMode]);

  // Current active point for telemetry display
  const activePoint = hoveredPoint || (selectedPlayId ? points.find((p) => p.playId === selectedPlayId) : null) || points[points.length - 1];

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || points.length === 0) return;

    const containerWidth = containerRef.current.clientWidth || 800;
    const margin = { top: 28, right: showEpaOverlay ? 55 : 35, bottom: 38, left: 50 };
    const width = Math.max(300, containerWidth - margin.left - margin.right);
    const chartHeight = Math.max(180, height - margin.top - margin.bottom);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: 0 to 3600 (or max seconds if OT)
    const maxSec = Math.max(3600, d3.max(points, (d) => d.gameSecond) || 3600);
    const xScale = d3.scaleLinear().domain([0, maxSec]).range([0, width]);

    // Y Scale: Win Probability 0% to 100%
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    // Optional EPA Scale
    const minEpa = Math.min(-10, d3.min(points, (d) => d.cumulativeHomeEpa) || -10);
    const maxEpa = Math.max(10, d3.max(points, (d) => d.cumulativeHomeEpa) || 10);
    const yEpaScale = d3.scaleLinear().domain([minEpa, maxEpa]).range([chartHeight, 0]).nice();

    // Defs & Gradients
    const defs = svg.append('defs');

    // Home Team Gradient (above 50%)
    const homeGrad = defs
      .append('linearGradient')
      .attr('id', 'homeWinGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    homeGrad.append('stop').attr('offset', '0%').attr('stop-color', homeTeamColor).attr('stop-opacity', 0.6);
    homeGrad.append('stop').attr('offset', '100%').attr('stop-color', homeTeamColor).attr('stop-opacity', 0.03);

    // Away Team Gradient (below 50%)
    const awayGrad = defs
      .append('linearGradient')
      .attr('id', 'awayWinGrad')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');
    awayGrad.append('stop').attr('offset', '0%').attr('stop-color', awayTeamColor).attr('stop-opacity', 0.6);
    awayGrad.append('stop').attr('offset', '100%').attr('stop-color', awayTeamColor).attr('stop-opacity', 0.03);

    // Grid Lines (25%, 50%, 75%)
    const yTicks = [10, 25, 50, 75, 90];
    g.selectAll('.grid-line-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line-y')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', (d) => (d === 50 ? '#e2e8f0' : '#27272a'))
      .attr('stroke-width', (d) => (d === 50 ? 1.5 : 0.8))
      .attr('stroke-dasharray', (d) => (d === 50 ? '4 2' : '2 3'))
      .attr('stroke-opacity', (d) => (d === 50 ? 0.8 : 0.35));

    // Quarter Boundary Vertical Lines
    const quarterBoundaries = [
      { sec: 900, label: 'END Q1' },
      { sec: 1800, label: 'HALFTIME' },
      { sec: 2700, label: 'END Q3' },
      { sec: 3600, label: 'FINAL' }
    ];

    quarterBoundaries.forEach((qb) => {
      const qX = xScale(qb.sec);
      if (qX > 0 && qX <= width) {
        g.append('line')
          .attr('x1', qX)
          .attr('x2', qX)
          .attr('y1', 0)
          .attr('y2', chartHeight)
          .attr('stroke', '#3f3f46')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3 3')
          .attr('stroke-opacity', 0.6);

        g.append('text')
          .attr('x', qX - 4)
          .attr('y', 14)
          .attr('text-anchor', 'end')
          .attr('fill', '#71717a')
          .attr('font-size', '9px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'bold')
          .text(qb.label);
      }
    });

    // 50% Neutral Equilibrium Label
    g.append('text')
      .attr('x', 6)
      .attr('y', yScale(50) - 5)
      .attr('fill', '#fbbf24')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.05em')
      .text('⚖️ 50% NEUTRAL EQUILIBRIUM');

    // Home Win Territory Area (Above 50%)
    const homeArea = d3
      .area<WinProbabilityPoint>()
      .x((d) => xScale(d.gameSecond))
      .y0(yScale(50))
      .y1((d) => yScale(Math.max(50, d.homeWinPct)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(points)
      .attr('fill', 'url(#homeWinGrad)')
      .attr('d', homeArea);

    // Away Win Territory Area (Below 50%)
    const awayArea = d3
      .area<WinProbabilityPoint>()
      .x((d) => xScale(d.gameSecond))
      .y0(yScale(50))
      .y1((d) => yScale(Math.min(50, d.homeWinPct)))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(points)
      .attr('fill', 'url(#awayWinGrad)')
      .attr('d', awayArea);

    // Main Win Probability Line
    const winLine = d3
      .line<WinProbabilityPoint>()
      .x((d) => xScale(d.gameSecond))
      .y((d) => yScale(d.homeWinPct))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 2.8)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('filter', 'drop-shadow(0 2px 6px rgba(251, 191, 36, 0.35))')
      .attr('d', winLine);

    // Optional Cumulative EPA Line
    if (showEpaOverlay) {
      const epaLine = d3
        .line<WinProbabilityPoint>()
        .x((d) => xScale(d.gameSecond))
        .y((d) => yEpaScale(d.cumulativeHomeEpa))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', 2.0)
        .attr('stroke-dasharray', '4 3')
        .attr('stroke-linecap', 'round')
        .attr('d', epaLine);

      // Right Y Axis for EPA
      const rightAxis = d3
        .axisRight(yEpaScale)
        .ticks(5)
        .tickFormat((d) => `${Number(d) > 0 ? '+' : ''}${d} EPA`);

      g.append('g')
        .attr('transform', `translate(${width},0)`)
        .call(rightAxis)
        .attr('color', '#38bdf8')
        .selectAll('text')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('fill', '#38bdf8');
    }

    // X Axis with Quarter & Minutes
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([0, 450, 900, 1350, 1800, 2250, 2700, 3150, 3600])
      .tickFormat((d) => {
        const sec = Number(d);
        if (sec === 0) return 'Kickoff';
        if (sec === 900) return 'Q1 Final';
        if (sec === 1800) return 'Halftime';
        if (sec === 2700) return 'Q3 Final';
        if (sec === 3600) return 'Final';
        const qtr = Math.floor(sec / 900) + 1;
        const minsLeft = Math.floor((900 - (sec % 900)) / 60);
        return `Q${qtr} ${minsLeft}m`;
      });

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('color', '#3f3f46')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#94a3b8');

    // Left Y Axis (0% to 100%)
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues([0, 20, 40, 50, 60, 80, 100])
      .tickFormat((d) => `${d}%`);

    g.append('g')
      .call(yAxis)
      .attr('color', '#3f3f46')
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#94a3b8');

    // Interactive Key Play Pin Nodes
    const pins = g
      .selectAll('.play-pin')
      .data<WinProbabilityPoint>(pinPoints)
      .enter()
      .append('g')
      .attr('class', 'play-pin')
      .attr('transform', (d: WinProbabilityPoint) => `translate(${xScale(d.gameSecond)},${yScale(d.homeWinPct)})`)
      .style('cursor', 'pointer')
      .on('click', (_: any, d: WinProbabilityPoint) => {
        if (onSelectPlay) onSelectPlay(d);
      });

    pins
      .append('circle')
      .attr('r', (d: WinProbabilityPoint) => (d.playId === selectedPlayId ? 7.5 : d.isScoringPlay ? 6 : d.isTurnover ? 5.5 : 4))
      .attr('fill', (d: WinProbabilityPoint) => {
        if (d.playId === selectedPlayId) return '#ffffff';
        if (d.isTurnover) return '#ef4444';
        if (d.isScoringPlay) return '#fbbf24';
        if (Math.abs(d.deltaHomeWp) >= 8.0) return '#38bdf8';
        return '#e4e4e7';
      })
      .attr('stroke', '#09090b')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    // Hover Tracking Cursor Group
    const trackerGroup = g.append('g').attr('class', 'tracker-cursor').style('display', 'none');

    const trackerLine = trackerGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 3');

    const trackerDot = trackerGroup
      .append('circle')
      .attr('r', 7)
      .attr('fill', '#fbbf24')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5);

    // Bisector for timeline scrubbing
    const bisect = d3.bisector<WinProbabilityPoint, number>((d) => d.gameSecond).left;

    // Invisible Interactive Overlay
    g.append('rect')
      .attr('class', 'hover-overlay')
      .attr('width', width)
      .attr('height', chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', () => trackerGroup.style('display', null))
      .on('mouseleave', () => {
        trackerGroup.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', (event) => {
        const [xPos] = d3.pointer(event);
        const xSec = xScale.invert(xPos);
        const idx = bisect(points, xSec, 1);
        const d0 = points[idx - 1];
        const d1 = points[idx];
        const d = !d1 ? d0 : !d0 ? d1 : xSec - d0.gameSecond > d1.gameSecond - xSec ? d1 : d0;

        if (d) {
          const cx = xScale(d.gameSecond);
          const cy = yScale(d.homeWinPct);
          trackerLine.attr('x1', cx).attr('x2', cx);
          trackerDot.attr('cx', cx).attr('cy', cy);
          setHoveredPoint(d);
        }
      })
      .on('click', (event) => {
        const [xPos] = d3.pointer(event);
        const xSec = xScale.invert(xPos);
        const idx = bisect(points, xSec, 1);
        const d0 = points[idx - 1];
        const d1 = points[idx];
        const d = !d1 ? d0 : !d0 ? d1 : xSec - d0.gameSecond > d1.gameSecond - xSec ? d1 : d0;
        if (d && onSelectPlay) {
          onSelectPlay(d);
        }
      });
  }, [points, pinPoints, selectedPlayId, showEpaOverlay, height, homeTeamColor, awayTeamColor, onSelectPlay]);

  return (
    <div className="bg-[#101014] border border-white/10 rounded-xl p-3 sm:p-3.5 shadow-md space-y-2.5">
      {/* Top Header & Chart Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Win Probability Trend Line</span>
            </h3>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              LIVE INGESTION
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Continuous Bayesian win expectancy curve against game clock with play inflection points.
          </p>
        </div>

        {/* Action Controls & Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* EPA Toggle */}
          <button
            onClick={onToggleEpaOverlay}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 transition ${
              showEpaOverlay
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Cumulative Expected Points Added (EPA) overlay curve"
          >
            <Layers className="w-3 h-3 text-sky-400" />
            <span>{showEpaOverlay ? '✓ EPA ON' : '+ EPA Curve'}</span>
          </button>

          {/* Filter Pins */}
          <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/10">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'BIG_SWINGS', label: '⚡ Swings' },
              { id: 'SCORING', label: '🏈 Score' },
              { id: 'TURNOVERS', label: '🚨 Turnovers' },
              { id: 'CLUTCH_4TH', label: '4️⃣ 4th Qtr' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition ${
                  filterMode === f.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Territory Labels & Score Ribbon */}
      <div className="flex items-center justify-between text-[11px] font-mono px-2 py-0.5 bg-black/30 rounded-lg border border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: homeTeamColor }} />
          <span className="font-bold text-white uppercase text-[10px]">{homeTeam} Territory ({'>'} 50%)</span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-2">
          <span>Score: <strong className="text-white">{homeTeam} {currentHomeScore} - {awayTeam} {currentAwayScore}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Hover or scrub timeline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white uppercase text-[10px]">{awayTeam} Territory ({'>'} 50%)</span>
          <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: awayTeamColor }} />
        </div>
      </div>

      {/* SVG Container */}
      <div ref={containerRef} className="w-full relative overflow-hidden rounded-lg bg-[#09090c] border border-white/5 p-1">
        <svg ref={svgRef} className="w-full block" />
      </div>

      {/* Interactive Scrubber Detail Card */}
      {activePoint && (
        <div className="bg-[#15151c] border border-amber-500/30 rounded-lg p-2.5 grid grid-cols-1 lg:grid-cols-4 gap-2.5 text-[11px] font-mono shadow-md animate-in fade-in duration-150">
          {/* 1. Win Probability Telemetry */}
          <div className="space-y-1 border-b lg:border-b-0 lg:border-r border-white/10 pb-2 lg:pb-0 lg:pr-2.5">
            <div className="text-[9px] text-slate-400 uppercase tracking-wide flex items-center justify-between">
              <span>Timeline Point WP</span>
              <span className="text-amber-400 font-bold">{activePoint.displayTime}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: homeTeamColor }} />
                {homeTeam}: <strong className="text-amber-300">{activePoint.homeWinPct.toFixed(1)}%</strong>
              </span>
              <span className="text-white flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: awayTeamColor }} />
                {awayTeam}: <strong className="text-purple-300">{activePoint.awayWinPct.toFixed(1)}%</strong>
              </span>
            </div>
            {/* Split Bar */}
            <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden flex border border-white/10">
              <div
                className="h-full transition-all duration-150"
                style={{ width: `${activePoint.homeWinPct}%`, backgroundColor: homeTeamColor }}
              />
              <div
                className="h-full transition-all duration-150"
                style={{ width: `${activePoint.awayWinPct}%`, backgroundColor: awayTeamColor }}
              />
            </div>
          </div>

          {/* 2. Win Probability Shift & Leverage */}
          <div className="space-y-1 border-b lg:border-b-0 lg:border-r border-white/10 pb-2 lg:pb-0 lg:pr-2.5">
            <div className="text-[9px] text-slate-400 uppercase tracking-wide">Impact & Leverage</div>
            <div className="flex items-center gap-2">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 block">$\Delta$WP</span>
                <span
                  className={`text-xs font-bold font-mono px-1.5 py-0.2 rounded border ${
                    activePoint.deltaHomeWp > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : activePoint.deltaHomeWp < 0
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-white/5 text-slate-300 border-white/10'
                  }`}
                >
                  {activePoint.deltaHomeWp > 0 ? `+${activePoint.deltaHomeWp}%` : `${activePoint.deltaHomeWp}%`}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 block">Leverage</span>
                <span
                  className={`text-xs font-bold font-mono px-1.5 py-0.2 rounded border ${
                    activePoint.leverageIndex >= 3.0
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : activePoint.leverageIndex >= 1.8
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}
                >
                  {activePoint.leverageIndex}x LI
                </span>
              </div>
              {activePoint.epa !== undefined && (
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 block">EPA</span>
                  <span className="text-xs font-bold text-sky-300 font-mono">
                    {activePoint.epa > 0 ? `+${activePoint.epa.toFixed(2)}` : activePoint.epa.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Field Situation & Down/Distance */}
          <div className="space-y-1 border-b lg:border-b-0 lg:border-r border-white/10 pb-2 lg:pb-0 lg:pr-2.5">
            <div className="text-[9px] text-slate-400 uppercase tracking-wide">Situation</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                {activePoint.possession} Ball
              </span>
              <span className="text-white font-bold text-[11px]">
                {activePoint.down > 0 ? `${activePoint.down}${activePoint.down === 1 ? 'st' : activePoint.down === 2 ? 'nd' : activePoint.down === 3 ? 'rd' : 'th'} & ${activePoint.distance}` : 'Kickoff'}
              </span>
              <span className="text-slate-400 text-[10px]">
                @ {activePoint.yardLineSide} {activePoint.yardLine}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Score: <span className="text-white font-bold">{homeTeam} {activePoint.homeScore} - {awayTeam} {activePoint.awayScore}</span>
            </div>
          </div>

          {/* 4. Play Description */}
          <div className="space-y-0.5">
            <div className="text-[9px] text-slate-400 uppercase tracking-wide flex items-center justify-between">
              <span>Play</span>
              {activePoint.isScoringPlay && (
                <span className="text-[9px] font-black text-amber-400 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30">
                  SCORE
                </span>
              )}
              {activePoint.isTurnover && (
                <span className="text-[9px] font-black text-rose-400 bg-rose-500/20 px-1 py-0.2 rounded border border-rose-500/30">
                  TURNOVER
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-200 line-clamp-2 leading-snug font-sans">
              {activePoint.description}
            </p>
            {activePoint.playConceptName && (
              <span className="text-[9px] text-sky-400 font-mono block">
                {activePoint.playConceptName}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
