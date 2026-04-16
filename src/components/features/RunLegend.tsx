import { Eye, EyeOff, X, Trash2 } from 'lucide-react';
import { SimulationRun } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface RunLegendProps {
  runs: SimulationRun[];
  hiddenRuns: Set<string>;
  onToggleVisibility: (id: string) => void;
  onRemoveRun: (id: string) => void;
  onClearAll: () => void;
}

export default function RunLegend({
  runs,
  hiddenRuns,
  onToggleVisibility,
  onRemoveRun,
  onClearAll,
}: RunLegendProps) {
  if (runs.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground">
          {runs.length} симуляц бүртгэгдсэн
        </p>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-border hover:border-destructive/30 transition-all"
        >
          <Trash2 className="w-3 h-3" />
          Бүгдийг арилгах
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {runs.map((run) => {
          const hidden = hiddenRuns.has(run.id);
          return (
            <div
              key={run.id}
              className={cn(
                'flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full border text-xs font-mono transition-all',
                hidden ? 'opacity-40 border-border' : 'border-current'
              )}
              style={hidden ? {} : { borderColor: run.color + '50', backgroundColor: run.color + '0f' }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: hidden ? '#666' : run.color }}
              />
              <span style={hidden ? { color: '#666' } : { color: run.color }}>
                #{run.runNumber}
              </span>
              <button
                onClick={() => onToggleVisibility(run.id)}
                className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                title={hidden ? 'Харуулах' : 'Нуух'}
              >
                {hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
              <button
                onClick={() => onRemoveRun(run.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Устгах"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
