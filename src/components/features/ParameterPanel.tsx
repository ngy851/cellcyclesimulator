import { useState } from 'react';
import { Play, RotateCcw, Loader2, FlaskConical, Cpu, Layers } from 'lucide-react';
import { SimulationParams, DEFAULT_PARAMS, PARAM_DESCRIPTIONS, SimulationMode } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface ParameterPanelProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onRun: (count: number) => void;
  isRunning: boolean;
  runCount: number;
  mode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
}

const PARAM_KEYS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'] as const;

export default function ParameterPanel({
  params,
  onParamsChange,
  onRun,
  isRunning,
  runCount,
  mode,
  onModeChange,
}: ParameterPanelProps) {
  const [simCount, setSimCount] = useState(1);

  const handleChange = (key: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onParamsChange({ ...params, [key]: numValue });
    }
  };

  const handleReset = () => {
    onParamsChange(DEFAULT_PARAMS);
  };

  const isMulti = simCount > 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
            Параметрүүд
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Кинетик тогтмолууд
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border disabled:opacity-40"
        >
          <RotateCcw className="w-3 h-3" />
          Дахилт
        </button>
      </div>

      {/* Parameter Inputs */}
      <div className="grid grid-cols-1 gap-2">
        {PARAM_KEYS.map((key, index) => (
          <div
            key={key}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-secondary/30 hover:border-primary/30 hover:bg-secondary/50 transition-all"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-mono font-bold text-primary">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <label
                htmlFor={key}
                className="text-xs text-muted-foreground font-mono block truncate cursor-pointer"
                title={PARAM_DESCRIPTIONS[key]}
              >
                {PARAM_DESCRIPTIONS[key]}
              </label>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs font-mono font-bold text-primary/80 w-7 text-right">{key}</span>
              <span className="text-muted-foreground text-xs">=</span>
              <input
                id={key}
                type="number"
                step="0.001"
                min="0"
                value={params[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={isRunning}
                className={cn(
                  'w-20 px-2 py-1 rounded-md text-sm font-mono text-right',
                  'bg-background border border-border',
                  'text-foreground',
                  'focus:outline-none focus:border-primary/50 input-glow',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all'
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Simulation Count */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary/60" />
            Симуляцийн тоо
          </label>
          <span className={cn(
            'text-xs font-mono font-bold px-2 py-0.5 rounded',
            isMulti
              ? 'text-primary bg-primary/10 border border-primary/20'
              : 'text-muted-foreground bg-secondary border border-border'
          )}>
            {isMulti ? `Олон × ${simCount}` : 'Нэг удаа'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={50}
            value={simCount}
            onChange={(e) => setSimCount(Number(e.target.value))}
            disabled={isRunning}
            className="flex-1 accent-primary h-1.5 cursor-pointer disabled:opacity-50"
          />
          <input
            type="number"
            min={1}
            max={50}
            value={simCount}
            onChange={(e) =>
              setSimCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))
            }
            disabled={isRunning}
            className={cn(
              'w-14 px-2 py-1 rounded-md text-sm font-mono text-center',
              'bg-background border border-border text-foreground',
              'focus:outline-none focus:border-primary/50 input-glow',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>

        {isMulti && (
          <p className="text-xs text-muted-foreground/70 font-mono">
            {simCount} стохастик зам нэгэн зэрэг харагдана
          </p>
        )}
      </div>

      {/* Run Button */}
      <button
        onClick={() => onRun(simCount)}
        disabled={isRunning}
        className={cn(
          'relative w-full py-3 rounded-lg font-semibold text-sm',
          'flex items-center justify-center gap-2',
          'transition-all duration-200',
          isRunning
            ? 'bg-primary/20 text-primary/60 cursor-not-allowed border border-primary/20'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan-strong border border-primary/50'
        )}
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Симуляци явагдаж байна...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            {isMulti ? `${simCount}× Ажиллуулах` : 'Симуляци ажиллуулах'}
          </>
        )}
      </button>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Mode Toggle */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-mono text-muted-foreground">Хөдөлгүүр</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onModeChange('browser')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono border transition-all',
              mode === 'browser'
                ? 'bg-primary/15 border-primary/40 text-primary'
                : 'bg-secondary/30 border-border text-muted-foreground hover:text-foreground hover:border-primary/20'
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            In-Browser
          </button>
          <button
            onClick={() => onModeChange('flask')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono border transition-all',
              mode === 'flask'
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                : 'bg-secondary/30 border-border text-muted-foreground hover:text-foreground hover:border-amber-400/20'
            )}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Flask API
          </button>
        </div>
        {mode === 'flask' && (
          <p className="text-xs font-mono text-amber-400/70 px-2">
            127.0.0.1:5000/simulate — CORS шаардлагатай
          </p>
        )}
      </div>

      {/* Run count warning */}
      {runCount >= 50 && (
        <div className="text-xs text-amber-400/80 font-mono px-3 py-2 rounded-md bg-amber-400/5 border border-amber-400/20">
          ⚠ Дээд хязгаарт (50) хүрлээ. Шинэ ажиллуулахын өмнө арилгана уу.
        </div>
      )}
    </div>
  );
}
