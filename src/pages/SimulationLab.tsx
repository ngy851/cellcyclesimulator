import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import ParameterPanel from '@/components/features/ParameterPanel';
import SimulationChart from '@/components/features/SimulationChart';
import RunLegend from '@/components/features/RunLegend';
import StatsPanel from '@/components/features/StatsPanel';
import ErrorBanner from '@/components/features/ErrorBanner';
import SpeciesToggle from '@/components/features/SpeciesToggle';
import {
  SimulationParams,
  SimulationRun,
  SimulationMode,
  SpeciesKey,
  DEFAULT_PARAMS,
  RUN_COLORS,
  SPECIES_CONFIGS,
} from '@/types/simulation';
import { runSimulation } from '@/lib/api';

let globalRunCounter = 0;

export default function SimulationLab() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [hiddenRuns, setHiddenRuns] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<SimulationMode>('browser');
  const [activeSpecies, setActiveSpecies] = useState<SpeciesKey[]>(['cyclin']);
  const [showMean, setShowMean] = useState(true);

  const addRun = useCallback(
    (result: ReturnType<typeof Object.assign>, currentParams: SimulationParams, colorIndex: number): SimulationRun => {
      globalRunCounter++;
      const id = `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newRun: SimulationRun = {
        id,
        runNumber: globalRunCounter,
        params: { ...currentParams },
        result,
        timestamp: new Date(),
        color: RUN_COLORS[colorIndex % RUN_COLORS.length],
      };
      return newRun;
    },
    []
  );

  const handleRun = useCallback(
    async (count: number) => {
      if (isRunning) return;
      setIsRunning(true);
      setError(null);

      const newRuns: SimulationRun[] = [];
      let successCount = 0;

      for (let i = 0; i < count; i++) {
        // Yield to UI between runs so spinner stays visible
        await new Promise<void>((r) => setTimeout(r, 10));

        let result = null;
        try {
          result = await runSimulation(params, mode);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`Run ${i + 1} failed:`, msg);
          setError(msg);
          break;
        }

        // Validate result before using
        if (
          !result ||
          !Array.isArray(result.time) ||
          !Array.isArray(result.cyclin) ||
          result.time.length < 2
        ) {
          setError('Симуляцийн үр дүн хоосон буюу буруу формат байна. Параметрүүдийг шалгана уу.');
          break;
        }

        const colorIdx = runs.length + newRuns.length;
        const run = addRun(result, params, colorIdx);
        newRuns.push(run);
        successCount++;
      }

      if (newRuns.length > 0) {
        setRuns((prev) => {
          const combined = [...prev, ...newRuns];
          // Keep max 50
          return combined.length > 50 ? combined.slice(combined.length - 50) : combined;
        });

        toast.success(
          count === 1
            ? `Симуляци #${newRuns[0].runNumber} амжилттай`
            : `${successCount}/${count} симуляци амжилттай`,
          { description: `${newRuns[0].result.time?.length ?? 0} цэг бүртгэгдлээ` }
        );
      }

      setIsRunning(false);
    },
    [isRunning, params, mode, runs.length, addRun]
  );

  const toggleVisibility = useCallback((id: string) => {
    setHiddenRuns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const removeRun = useCallback((id: string) => {
    setRuns((prev) => prev.filter((r) => r.id !== id));
    setHiddenRuns((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const clearAll = useCallback(() => {
    setRuns([]);
    setHiddenRuns(new Set());
    toast.info('Бүх симуляци арилгагдлаа');
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      <Header runCount={runs.length} mode={mode} />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <div className="flex flex-col lg:flex-row gap-6 flex-1">

          {/* LEFT: Parameter Panel */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24 p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm glow-cyan">
              <ParameterPanel
                params={params}
                onParamsChange={setParams}
                onRun={handleRun}
                isRunning={isRunning}
                runCount={runs.length}
                mode={mode}
                onModeChange={setMode}
              />
            </div>
          </div>

          {/* RIGHT: Chart Area */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">

            <StatsPanel runs={runs} hiddenRuns={hiddenRuns} activeSpecies={activeSpecies} />

            {/* Chart Container */}
            <div className="flex-1 min-h-[460px] lg:min-h-[540px] p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex flex-col gap-4">

              {/* Chart header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Стохастик Симуляцийн Траектори
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Gillespie SSA · {runs.length} бүртгэл
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isRunning && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
                      <span className="text-xs font-mono text-primary">Ажиллаж байна...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Species + Mean toggles */}
              <SpeciesToggle
                activeSpecies={activeSpecies}
                onChange={setActiveSpecies}
                showMean={showMean}
                onMeanToggle={setShowMean}
              />

              {/* Chart */}
              <div className="flex-1 min-h-0">
                <SimulationChart
                  runs={runs}
                  hiddenRuns={hiddenRuns}
                  activeSpecies={activeSpecies}
                  speciesConfigs={SPECIES_CONFIGS}
                  showMean={showMean}
                />
              </div>
            </div>

            {/* Run Legend */}
            {runs.length > 0 && (
              <div className="p-4 rounded-xl border border-border bg-card/40 backdrop-blur-sm">
                <RunLegend
                  runs={runs}
                  hiddenRuns={hiddenRuns}
                  onToggleVisibility={toggleVisibility}
                  onRemoveRun={removeRun}
                  onClearAll={clearAll}
                />
              </div>
            )}
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground/50 font-mono py-2">
          Эсийн Симуляцийн Лаборатори· Gillespie SSA · In-Browser &amp; Flask API
        </footer>
      </main>
    </div>
  );
}
