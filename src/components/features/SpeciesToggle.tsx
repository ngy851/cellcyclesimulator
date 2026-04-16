import { SpeciesKey, SPECIES_CONFIGS } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface SpeciesToggleProps {
  activeSpecies: SpeciesKey[];
  onChange: (species: SpeciesKey[]) => void;
  showMean: boolean;
  onMeanToggle: (val: boolean) => void;
}

export default function SpeciesToggle({
  activeSpecies,
  onChange,
  showMean,
  onMeanToggle,
}: SpeciesToggleProps) {
  const toggle = (key: SpeciesKey) => {
    if (activeSpecies.includes(key)) {
      // Don't allow deselecting all
      if (activeSpecies.length === 1) return;
      onChange(activeSpecies.filter((s) => s !== key));
    } else {
      onChange([...activeSpecies, key]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-mono text-muted-foreground mr-1">Харах:</span>

      {SPECIES_CONFIGS.map((cfg) => {
        const active = activeSpecies.includes(cfg.key);
        return (
          <button
            key={cfg.key}
            onClick={() => toggle(cfg.key)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all',
              active
                ? 'border-current text-current font-semibold'
                : 'border-border text-muted-foreground hover:border-primary/30 opacity-50 hover:opacity-80'
            )}
            style={active ? { color: cfg.color, borderColor: cfg.color + '60', backgroundColor: cfg.color + '12' } : {}}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: active ? cfg.color : undefined }}
            />
            {cfg.label}
          </button>
        );
      })}

      {/* Mean toggle */}
      <div className="w-px h-4 bg-border mx-1" />
      <button
        onClick={() => onMeanToggle(!showMean)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all',
          showMean
            ? 'border-white/40 text-white bg-white/10 font-semibold'
            : 'border-border text-muted-foreground hover:border-white/20 opacity-50 hover:opacity-80'
        )}
      >
        <span className={cn('w-3 h-0.5 rounded', showMean ? 'bg-white' : 'bg-muted-foreground')} />
        Дундаж шугам
      </button>
    </div>
  );
}
