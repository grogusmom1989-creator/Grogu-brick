import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  Radio,
  Timer,
  WifiOff,
  Zap,
  Filter,
} from 'lucide-react';

export interface SyncHealthDayPoint {
  date: string;
  fullDate: string;
  dayIndex: number;
  totalSyncs: number;
  successRate: number;
  avgDurationMs: number;
  maxDurationMs: number;
  conflictsDetected: number;
  conflictsResolved: number;
  isLatencySpike: boolean;
  recurringIssueType?: 'github_ratelimit' | 'drive_token_refresh' | 'concurrent_edit_burst' | null;
  recurringIssueLabel?: string | null;
}

interface SyncHealthD3TimelineProps {
  data: SyncHealthDayPoint[];
}

export const SyncHealthD3Timeline: React.FC<SyncHealthD3TimelineProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'success' | 'latency' | 'conflicts'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<SyncHealthDayPoint | null>(null);
  const [selectedIssueFilter, setSelectedIssueFilter] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 860, height: 320 });

  // Observe container width for responsive D3 rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const w = Math.max(520, containerRef.current.clientWidth - 16);
        setDimensions({ width: w, height: 320 });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Summarize recurring connection issues detected across the 30-day window
  const recurringPatterns = useMemo(() => {
    const githubSpikes = data.filter((d) => d.recurringIssueType === 'github_ratelimit');
    const driveDelays = data.filter((d) => d.recurringIssueType === 'drive_token_refresh');
    const conflictBursts = data.filter((d) => d.recurringIssueType === 'concurrent_edit_burst');

    return [
      {
        id: 'github_ratelimit',
        title: 'GitHub API Rate-Limit & Latency Spikes',
        occurrences: githubSpikes.length,
        avgSpikeMs:
          githubSpikes.length > 0
            ? Math.round(githubSpikes.reduce((a, b) => a + b.maxDurationMs, 0) / githubSpikes.length)
            : 0,
        patternDesc: 'Occurs every ~7 days during batch repository tree & issue indexing',
        color: '#f43f5e',
        badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        dates: githubSpikes.map((d) => d.date),
      },
      {
        id: 'drive_token_refresh',
        title: 'Google Drive Token Handshake Delay',
        occurrences: driveDelays.length,
        avgSpikeMs:
          driveDelays.length > 0
            ? Math.round(driveDelays.reduce((a, b) => a + b.maxDurationMs, 0) / driveDelays.length)
            : 0,
        patternDesc: 'Periodic OAuth token renewal latency spikes with minor retry dips',
        color: '#f59e0b',
        badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dates: driveDelays.map((d) => d.date),
      },
      {
        id: 'concurrent_edit_burst',
        title: 'Multi-Device Conflict Occurrence Bursts',
        occurrences: conflictBursts.length,
        avgSpikeMs:
          conflictBursts.length > 0
            ? Math.round(conflictBursts.reduce((a, b) => a + b.maxDurationMs, 0) / conflictBursts.length)
            : 0,
        patternDesc: 'Mid-week simultaneous Local vs. Cloud task/note edits triggering auto-merge',
        color: '#a855f7',
        badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        dates: conflictBursts.map((d) => d.date),
      },
    ];
  }, [data]);

  const avgSuccessRate = useMemo(() => {
    if (!data.length) return 100;
    return (data.reduce((acc, d) => acc + d.successRate, 0) / data.length).toFixed(1);
  }, [data]);

  const spikeCount = useMemo(() => data.filter((d) => d.isLatencySpike).length, [data]);
  const conflictDaysCount = useMemo(() => data.filter((d) => d.conflictsDetected > 0).length, [data]);

  // Render D3 Timeline
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 26, right: 54, bottom: 38, left: 48 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const defs = svg.append('defs');

    // Emerald gradient for Success Rate Area
    const successGrad = defs
      .append('linearGradient')
      .attr('id', 'd3SuccessGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    successGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.28);
    successGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.02);

    // Rose gradient for Latency Spike Area
    const latencyGrad = defs
      .append('linearGradient')
      .attr('id', 'd3LatencyGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    latencyGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.25);
    latencyGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.0);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.date))
      .range([0, innerWidth])
      .padding(0.35);

    // Left Y Axis: Sync Success Rate (88% to 100%)
    const ySuccess = d3.scaleLinear().domain([88, 100.5]).range([innerHeight, 0]);

    // Right Y Axis: Latency Spikes (0ms to max latency)
    const maxLat = Math.max(420, d3.max(data, (d) => d.maxDurationMs) || 400);
    const yLatency = d3.scaleLinear().domain([0, maxLat * 1.08]).range([innerHeight, 0]);

    // Conflict bar height scale (mapped to lower 45% of canvas)
    const maxConflicts = Math.max(5, d3.max(data, (d) => d.conflictsDetected) || 5);
    const yConflicts = d3
      .scaleLinear()
      .domain([0, maxConflicts])
      .range([innerHeight, innerHeight * 0.55]);

    // Horizontal Gridlines
    const gridTicks = [90, 92, 94, 96, 98, 100];
    g.selectAll('.grid-line')
      .data(gridTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => ySuccess(d))
      .attr('y2', (d) => ySuccess(d))
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1);

    // SLA Threshold Line (97.5% Success Rate)
    if (activeLayer === 'all' || activeLayer === 'success') {
      const slaY = ySuccess(97.5);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', slaY)
        .attr('y2', slaY)
        .attr('stroke', '#10b981')
        .attr('stroke-opacity', 0.35)
        .attr('stroke-dasharray', '5,4')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', 6)
        .attr('y', slaY - 5)
        .attr('fill', '#34d399')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0.8)
        .text('SLA Target (97.5%)');
    }

    // Latency Spike Threshold Line (270ms)
    if (activeLayer === 'all' || activeLayer === 'latency') {
      const spikeY = yLatency(270);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', spikeY)
        .attr('y2', spikeY)
        .attr('stroke', '#f43f5e')
        .attr('stroke-opacity', 0.35)
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', innerWidth - 6)
        .attr('y', spikeY - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#fb7185')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0.8)
        .text('Latency Anomaly Threshold (270ms)');
    }

    // Highlight Recurring Issue Vertical Bands
    data.forEach((d) => {
      if (!d.recurringIssueType) return;
      if (selectedIssueFilter && d.recurringIssueType !== selectedIssueFilter) return;
      const cx = xScale(d.date) ?? 0;
      const bandColor =
        d.recurringIssueType === 'github_ratelimit'
          ? '#f43f5e'
          : d.recurringIssueType === 'drive_token_refresh'
          ? '#f59e0b'
          : '#a855f7';

      g.append('rect')
        .attr('x', cx - 10)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', innerHeight)
        .attr('fill', bandColor)
        .attr('opacity', selectedIssueFilter === d.recurringIssueType ? 0.16 : 0.07)
        .attr('rx', 4);
    });

    // 1. Conflict Occurrence Pattern Bars (Bottom Layer)
    if (activeLayer === 'all' || activeLayer === 'conflicts') {
      const barWidth = Math.max(8, Math.min(16, innerWidth / data.length - 6));

      g.selectAll('.conflict-bar')
        .data(data.filter((d) => d.conflictsDetected > 0))
        .enter()
        .append('rect')
        .attr('class', 'conflict-bar')
        .attr('x', (d) => (xScale(d.date) ?? 0) - barWidth / 2)
        .attr('y', (d) => yConflicts(d.conflictsDetected))
        .attr('width', barWidth)
        .attr('height', (d) => Math.max(4, innerHeight - yConflicts(d.conflictsDetected)))
        .attr('rx', 3)
        .attr('fill', (d) =>
          d.recurringIssueType === 'concurrent_edit_burst' ? '#a855f7' : '#f59e0b'
        )
        .attr('opacity', (d) => {
          if (selectedIssueFilter && d.recurringIssueType !== selectedIssueFilter) return 0.25;
          return 0.75;
        });

      // Conflict count badges above bars
      g.selectAll('.conflict-label')
        .data(data.filter((d) => d.conflictsDetected >= 2))
        .enter()
        .append('text')
        .attr('x', (d) => xScale(d.date) ?? 0)
        .attr('y', (d) => yConflicts(d.conflictsDetected) - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fbbf24')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text((d) => `${d.conflictsDetected}c`);
    }

    // 2. Sync Success Rate Area & Curve (Primary Health Metric)
    if (activeLayer === 'all' || activeLayer === 'success') {
      const successArea = d3
        .area<SyncHealthDayPoint>()
        .x((d) => xScale(d.date) ?? 0)
        .y0(innerHeight)
        .y1((d) => ySuccess(d.successRate))
        .curve(d3.curveMonotoneX);

      const successLine = d3
        .line<SyncHealthDayPoint>()
        .x((d) => xScale(d.date) ?? 0)
        .y((d) => ySuccess(d.successRate))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'url(#d3SuccessGrad)')
        .attr('d', successArea);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2.2)
        .attr('d', successLine);

      // Success rate nodes (emphasize dips < 97.5%)
      g.selectAll('.success-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.date) ?? 0)
        .attr('cy', (d) => ySuccess(d.successRate))
        .attr('r', (d) => (d.successRate < 97.5 ? 4.5 : 2.5))
        .attr('fill', (d) => (d.successRate < 97.5 ? '#f59e0b' : '#10b981'))
        .attr('stroke', '#020617')
        .attr('stroke-width', 1.5);
    }

    // 3. Peak & Avg Latency Spike Curve (Secondary Metric)
    if (activeLayer === 'all' || activeLayer === 'latency') {
      const peakLatencyLine = d3
        .line<SyncHealthDayPoint>()
        .x((d) => xScale(d.date) ?? 0)
        .y((d) => yLatency(d.maxDurationMs))
        .curve(d3.curveMonotoneX);

      const avgLatencyLine = d3
        .line<SyncHealthDayPoint>()
        .x((d) => xScale(d.date) ?? 0)
        .y((d) => yLatency(d.avgDurationMs))
        .curve(d3.curveMonotoneX);

      if (activeLayer === 'latency') {
        const latencyArea = d3
          .area<SyncHealthDayPoint>()
          .x((d) => xScale(d.date) ?? 0)
          .y0(innerHeight)
          .y1((d) => yLatency(d.maxDurationMs))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(data)
          .attr('fill', 'url(#d3LatencyGrad)')
          .attr('d', latencyArea);
      }

      // Peak Latency Curve
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#f43f5e')
        .attr('stroke-width', 1.75)
        .attr('stroke-dasharray', activeLayer === 'all' ? '4,3' : 'none')
        .attr('d', peakLatencyLine);

      // Avg Latency Curve
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85)
        .attr('d', avgLatencyLine);

      // Latency Spike Anomaly Nodes
      const spikePoints = data.filter((d) => d.isLatencySpike);
      g.selectAll('.spike-ring')
        .data(spikePoints)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.date) ?? 0)
        .attr('cy', (d) => yLatency(d.maxDurationMs))
        .attr('r', 7)
        .attr('fill', '#f43f5e')
        .attr('opacity', 0.22);

      g.selectAll('.spike-dot')
        .data(spikePoints)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.date) ?? 0)
        .attr('cy', (d) => yLatency(d.maxDurationMs))
        .attr('r', 4)
        .attr('fill', '#f43f5e')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.2);
    }

    // X Axis (Dates)
    const tickInterval = data.length > 20 ? 3 : data.length > 10 ? 2 : 1;
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(data.filter((_, i) => i % tickInterval === 0 || i === data.length - 1).map((d) => d.date))
      .tickSizeOuter(0);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain').attr('stroke', '#334155');
    xAxisGroup.selectAll('.tick line').attr('stroke', '#334155');
    xAxisGroup
      .selectAll('.tick text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Left Y Axis (Success Rate %)
    const yAxisLeft = d3
      .axisLeft(ySuccess)
      .ticks(5)
      .tickFormat((d) => `${d}%`);

    const yLeftGroup = g.append('g').call(yAxisLeft);
    yLeftGroup.select('.domain').remove();
    yLeftGroup.selectAll('.tick line').remove();
    yLeftGroup
      .selectAll('.tick text')
      .attr('fill', '#10b981')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Right Y Axis (Latency ms)
    const yAxisRight = d3
      .axisRight(yLatency)
      .ticks(5)
      .tickFormat((d) => `${d}ms`);

    const yRightGroup = g
      .append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(yAxisRight);
    yRightGroup.select('.domain').remove();
    yRightGroup.selectAll('.tick line').remove();
    yRightGroup
      .selectAll('.tick text')
      .attr('fill', '#fb7185')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Interactive Hover Crosshair + Columns
    const hoverGuide = g
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    const colWidth = innerWidth / Math.max(1, data.length);
    g.selectAll('.hover-Zone')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => (xScale(d.date) ?? 0) - colWidth / 2)
      .attr('y', 0)
      .attr('width', colWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseenter', (_, d) => {
        const cx = xScale(d.date) ?? 0;
        hoverGuide.attr('x1', cx).attr('x2', cx).style('opacity', 0.75);
        setHoveredPoint(d);
      })
      .on('mouseleave', () => {
        hoverGuide.style('opacity', 0);
        setHoveredPoint(null);
      });
  }, [data, activeLayer, dimensions, selectedIssueFilter]);

  const activeInspectionPoint = hoveredPoint || data[data.length - 1] || null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg">
      {/* Header & Layer Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Sync Health Visual Timeline (30-Day D3.js Diagnostics)</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                D3.js Multi-Layer Engine
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Maps 30-day historical sync success rates, latency spikes, and conflict occurrence patterns to pinpoint recurring connection issues.
          </p>
        </div>

        {/* Layer Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveLayer('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeLayer === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Health Layers
            </button>
            <button
              onClick={() => setActiveLayer('success')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeLayer === 'success'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Success Rate (%)
            </button>
            <button
              onClick={() => setActiveLayer('latency')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeLayer === 'latency'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Latency Spikes
            </button>
            <button
              onClick={() => setActiveLayer('conflicts')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeLayer === 'conflicts'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conflict Patterns
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostic KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>30-Day Mean Success Rate</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{avgSuccessRate}%</div>
            <div className="text-[10px] text-slate-500">SLA baseline target: 97.5%</div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Healthy
          </span>
        </div>

        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Latency Spike Anomalies (&gt;270ms)</span>
            </div>
            <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">{spikeCount} Spikes</div>
            <div className="text-[10px] text-slate-500">Correlated with API rate-limits &amp; token refresh</div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Periodic
          </span>
        </div>

        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5 text-amber-400" />
              <span>Conflict Pattern Days</span>
            </div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">{conflictDaysCount} Days</div>
            <div className="text-[10px] text-slate-500">Clustered around mid-week multi-device edits</div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Auto-Merged
          </span>
        </div>
      </div>

      {/* D3.js SVG Timeline Container */}
      <div
        ref={containerRef}
        className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 space-y-3 overflow-hidden"
      >
        {/* Legend & Live Hover Readout Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-2 pt-1 border-b border-slate-800/80 pb-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Success Rate (%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Peak Latency Spike (ms)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              Avg Latency (ms)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
              Conflict Occurrences
            </span>
          </div>

          {activeInspectionPoint && (
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-white font-semibold">
                {activeInspectionPoint.date} ({activeInspectionPoint.fullDate})
              </span>
              <span
                className={
                  activeInspectionPoint.successRate < 97.5 ? 'text-amber-400 font-bold' : 'text-emerald-400'
                }
              >
                Success: {activeInspectionPoint.successRate}%
              </span>
              <span
                className={
                  activeInspectionPoint.isLatencySpike ? 'text-rose-400 font-bold' : 'text-sky-300'
                }
              >
                Peak: {activeInspectionPoint.maxDurationMs}ms (Avg {activeInspectionPoint.avgDurationMs}ms)
              </span>
              <span className="text-amber-300">
                Conflicts: {activeInspectionPoint.conflictsDetected}
              </span>
              {activeInspectionPoint.recurringIssueLabel && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                  {activeInspectionPoint.recurringIssueLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* SVG Element */}
        <div className="w-full overflow-x-auto">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto select-none"
          />
        </div>
      </div>

      {/* Recurring Connection Issue Pattern Diagnostics */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Identified Recurring Connection Patterns (Click to Highlight on Timeline)</span>
          </h4>
          {selectedIssueFilter && (
            <button
              onClick={() => setSelectedIssueFilter(null)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Filter className="w-3 h-3" />
              <span>Clear Highlight Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recurringPatterns.map((pattern) => {
            const isSelected = selectedIssueFilter === pattern.id;
            return (
              <button
                key={pattern.id}
                onClick={() =>
                  setSelectedIssueFilter((prev) => (prev === pattern.id ? null : pattern.id))
                }
                className={`text-left p-3.5 rounded-xl border transition-all space-y-2 ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{pattern.title}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${pattern.badgeClass}`}
                  >
                    {pattern.occurrences}x in 30d
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{pattern.patternDesc}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Avg Peak: {pattern.avgSpikeMs}ms</span>
                  <span className="truncate max-w-[150px]" title={pattern.dates.join(', ')}>
                    Dates: {pattern.dates.slice(0, 3).join(', ')}
                    {pattern.dates.length > 3 ? '…' : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
