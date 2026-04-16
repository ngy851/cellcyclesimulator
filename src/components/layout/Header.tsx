import { Dna, FlaskConical, Activity, Cpu } from 'lucide-react';
import { SimulationMode } from '@/types/simulation';

interface HeaderProps {
  runCount: number;
  mode: SimulationMode;
}

export default function Header({ runCount, mode }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan">
              <FlaskConical className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary pulse-dot" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-primary glow-text">Cell</span>
              <span className="text-foreground"> Simulation Lab</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Эсийн Хуваагдлын Симулятор 2.0
            </p>
          </div>
        </div>

        {/* Center decoration */}
        <div className="hidden lg:flex items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Dna className="w-4 h-4 text-primary/50" />
            <span>Cyclin · CK · APC/C</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-xs font-mono">
            <Activity className="w-4 h-4 text-primary/50" />
            <span>Multi-Run · Mean Trajectory</span>
          </div>
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-3">
          {runCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-mono text-primary font-medium">
                {runCount} симуляци
              </span>
            </div>
          )}
          <div className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border ${
            mode === 'browser'
              ? 'border-border text-muted-foreground'
              : 'border-amber-400/40 text-amber-400 bg-amber-400/5'
          }`}>
            {mode === 'browser' ? (
              <><Cpu className="w-3.5 h-3.5" /> IN-BROWSER</>
            ) : (
              <><FlaskConical className="w-3.5 h-3.5" /> FLASK API</>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
