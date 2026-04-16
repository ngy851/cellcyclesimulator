import { TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import { SimulationRun, SpeciesKey, SPECIES_CONFIGS } from '@/types/simulation';

interface StatsPanelProps {
  runs: SimulationRun[];
  hiddenRuns: Set<string>;
  activeSpecies: SpeciesKey[];
}

export default function StatsPanel({ runs, hiddenRuns, activeSpecies }: StatsPanelProps) {
  const visibleRuns = runs.filter((r) => !hiddenRuns.has(r.id));
  if (visibleRuns.length === 0) return null;

  const primarySpecies = activeSpecies[0] ?? 'cyclin';
  const cfg = SPECIES_CONFIGS.find((s) => s.key === primarySpecies);

  const allVals = visibleRuns.flatMap((r) => r.result[primarySpecies] ?? []);
  const allTimes = visibleRuns.flatMap((r) => r.result.time);
  const totalPoints = allVals.length;

  const maxVal = Math.max(...allVals);
  const minVal = Math.min(...allVals);
  const avgVal = allVals.reduce((a, b) => a + b, 0) / allVals.length;
  const maxTime = Math.max(...allTimes);

  const stats = [
    {
      label: `${cfg?.shortLabel ?? ''} Дээд`,
      value: maxVal.toFixed(2),
      unit: 'молекул',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      color: cfg?.color ?? '#00d4ff',
    },
    {
      label: `${cfg?.shortLabel ?? ''} Доод`,
      value: minVal.toFixed(2),
      unit: 'молекул',
      icon: <TrendingDown className="w-3.5 h-3.5" />,
      color: '#ff6b6b',
    },
    {
      label: 'Дундаж',
      value: avgVal.toFixed(2),
      unit: 'молекул',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      color: '#51cf66',
    },
    {
      label: 'Нийт хугацаа',
      value: maxTime.toFixed(1),
      unit: 'нэгж',
      icon: <Clock className="w-3.5 h-3.5" />,
      color: '#ffd43b',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-3 rounded-lg border border-border bg-card/50 flex flex-col gap-1.5"
          style={{ borderColor: `${stat.color}20` }}
        >
          <div className="flex items-center gap-1.5" style={{ color: stat.color }}>
            {stat.icon}
            <span className="text-xs text-muted-foreground font-mono">{stat.label}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono" style={{ color: stat.color }}>
              {stat.value}
            </span>
            <span className="text-xs text-muted-foreground">{stat.unit}</span>
          </div>
          <div className="text-xs text-muted-foreground/60 font-mono">
            {visibleRuns.length} симуляц · {totalPoints.toLocaleString()} цэг
          </div>
        </div>
      ))}
    </div>
  );
}
