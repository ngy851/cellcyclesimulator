import { useEffect, useRef, useMemo } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Activity } from 'lucide-react';
import { SimulationRun, SpeciesConfig, SpeciesKey } from '@/types/simulation';
import { computeMeanTrajectory } from '@/lib/mean';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

interface SimulationChartProps {
  runs: SimulationRun[];
  hiddenRuns: Set<string>;
  activeSpecies: SpeciesKey[];
  speciesConfigs: SpeciesConfig[];
  showMean: boolean;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
          <Activity className="w-8 h-8 text-primary/30" />
        </div>
        <div className="absolute inset-0 -m-2 rounded-full border border-primary/5 animate-pulse" />
        <div className="absolute inset-0 -m-5 rounded-full border border-primary/3" />
      </div>
      <div>
        <p className="text-muted-foreground font-medium">Симуляцийн үр дүн байхгүй</p>
        <p className="text-muted-foreground/60 text-xs mt-1 font-mono">
          Параметрүүдийг тохируулаад симуляци ажиллуулна уу
        </p>
      </div>
      <div className="flex items-end gap-0.5 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary/40 rounded-t"
            style={{ height: `${Math.sin(i * 0.5) * 20 + 25}px` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Step-interpolate a run's species values at uniform sample times */
function sampleRun(run: SimulationRun, species: SpeciesKey, times: number[]): (number | null)[] {
  const srcTimes = run.result.time;
  const srcVals = run.result[species];
  if (!srcVals || srcVals.length === 0) return times.map(() => null);

  return times.map((t) => {
    if (t < srcTimes[0]) return null;
    if (t >= srcTimes[srcTimes.length - 1]) return srcVals[srcVals.length - 1];
    let lo = 0, hi = srcTimes.length - 1;
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      if (srcTimes[mid] <= t) lo = mid; else hi = mid - 1;
    }
    return srcVals[lo] ?? null;
  });
}

const NUM_SAMPLES = 400;

export default function SimulationChart({
  runs,
  hiddenRuns,
  activeSpecies,
  speciesConfigs,
  showMean,
}: SimulationChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const visibleRuns = useMemo(
    () => runs.filter((r) => !hiddenRuns.has(r.id)),
    [runs, hiddenRuns]
  );

  const { sampleTimes, datasets } = useMemo(() => {
    if (visibleRuns.length === 0) return { sampleTimes: [], datasets: [] };

    // Global time range
    const tMax = Math.max(...visibleRuns.map((r) => r.result.time.at(-1) ?? 0));
    if (tMax <= 0) return { sampleTimes: [], datasets: [] };

    const step = tMax / (NUM_SAMPLES - 1);
    const times = Array.from({ length: NUM_SAMPLES }, (_, i) => i * step);

    const datasets: ChartData<'line'>['datasets'] = [];
    const isMultiRun = visibleRuns.length > 1;
    const hasMultiSpecies = activeSpecies.length > 1;

    for (const species of activeSpecies) {
      const cfg = speciesConfigs.find((s) => s.key === species);
      if (!cfg) continue;

      // Individual run lines
      for (const run of visibleRuns) {
        const values = sampleRun(run, species, times);
        const baseColor = hasMultiSpecies ? cfg.color : run.color;

        datasets.push({
          label: isMultiRun
            ? `${cfg.shortLabel} #${run.runNumber}`
            : `${cfg.label} #${run.runNumber}`,
          data: values as number[],
          borderColor: baseColor + (isMultiRun ? '55' : 'cc'),
          backgroundColor: 'transparent',
          borderWidth: isMultiRun ? 1 : 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.2,
          spanGaps: false,
        });
      }

      // Mean trajectory
      if (showMean && visibleRuns.length > 1) {
        const meanPts = computeMeanTrajectory(visibleRuns, species, NUM_SAMPLES);
        datasets.push({
          label: `Mean ${cfg.shortLabel}`,
          data: meanPts.map((p) => p.value),
          borderColor: cfg.meanColor,
          backgroundColor: cfg.meanColor + '18',
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
          spanGaps: true,
        });
      }
    }

    return { sampleTimes: times, datasets };
  }, [visibleRuns, activeSpecies, speciesConfigs, showMean]);

  // Build Chart.js options
  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: 'hsl(215, 20%, 60%)',
          font: { family: 'JetBrains Mono', size: 10 },
          boxWidth: 20,
          boxHeight: 2,
          padding: 12,
          filter: (item) => {
            // In multi-run mode, only show mean lines in legend
            if (visibleRuns.length > 1) {
              return (item.text ?? '').startsWith('Mean');
            }
            return true;
          },
        },
      },
      tooltip: {
        backgroundColor: 'hsl(220,30%,10%)',
        borderColor: 'hsl(220,20%,22%)',
        borderWidth: 1,
        titleColor: 'hsl(215,20%,60%)',
        bodyColor: 'hsl(215,20%,85%)',
        titleFont: { family: 'JetBrains Mono', size: 10 },
        bodyFont: { family: 'JetBrains Mono', size: 11 },
        padding: 10,
        callbacks: {
          title: (items) => `t = ${(items[0]?.parsed?.x ?? 0).toFixed(3)}`,
          label: (item) => {
            const val = item.parsed.y;
            return ` ${item.dataset.label}: ${Number.isFinite(val) ? val.toFixed(2) : '—'}`;
          },
          filter: (item) => {
            // In multi-run, only show mean in tooltip
            if (visibleRuns.length > 3) {
              return (item.dataset.label ?? '').startsWith('Mean');
            }
            return true;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Хугацаа (t)',
          color: 'hsl(215,20%,45%)',
          font: { family: 'JetBrains Mono', size: 11 },
        },
        ticks: {
          color: 'hsl(215,20%,50%)',
          font: { family: 'JetBrains Mono', size: 10 },
          maxTicksLimit: 10,
          callback: (v) => Number(v).toFixed(1),
        },
        grid: {
          color: 'rgba(255,255,255,0.04)',
        },
        border: { color: 'hsl(220,20%,16%)' },
      },
      y: {
        title: {
          display: true,
          text: activeSpecies.length === 1
            ? speciesConfigs.find((s) => s.key === activeSpecies[0])?.label ?? 'Value'
            : 'Молекул тоо',
          color: 'hsl(215,20%,45%)',
          font: { family: 'JetBrains Mono', size: 11 },
        },
        ticks: {
          color: 'hsl(215,20%,50%)',
          font: { family: 'JetBrains Mono', size: 10 },
          maxTicksLimit: 8,
          callback: (v) => Number(v).toFixed(1),
        },
        grid: {
          color: 'rgba(255,255,255,0.04)',
        },
        border: { color: 'hsl(220,20%,16%)' },
      },
    },
  }), [activeSpecies, speciesConfigs, visibleRuns.length]);

  // Create / destroy chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (sampleTimes.length === 0 || datasets.length === 0) return;

    chartRef.current = new Chart(canvas, {
      type: 'line',
      data: {
        labels: sampleTimes,
        datasets,
      },
      options,
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [sampleTimes, datasets, options]);

  const hasData = visibleRuns.length > 0 && sampleTimes.length > 0;

  return (
    <div className="w-full h-full relative">
      {!hasData ? (
        <EmptyState />
      ) : (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}
    </div>
  );
}
