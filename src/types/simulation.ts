export interface SimulationParams {
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  k5: number;
  k6: number;
}

export interface SimulationResult {
  time: number[];
  cyclin: number[];
  K?: number[];
  CK?: number[];
  A?: number[];
  [key: string]: number[] | undefined;
}

export interface SimulationRun {
  id: string;
  runNumber: number;
  params: SimulationParams;
  result: SimulationResult;
  timestamp: Date;
  color: string;
}

export interface ChartDataPoint {
  time: number;
  [key: string]: number;
}

export type SimulationMode = 'browser' | 'flask';

export type SpeciesKey = 'cyclin' | 'CK' | 'A';

export interface SpeciesConfig {
  key: SpeciesKey;
  label: string;
  shortLabel: string;
  color: string;
  meanColor: string;
}

export const SPECIES_CONFIGS: SpeciesConfig[] = [
  {
    key: 'cyclin',
    label: 'Cyclin (C)',
    shortLabel: 'C',
    color: '#00d4ff',
    meanColor: '#ffffff',
  },
  {
    key: 'CK',
    label: 'Complex (CK)',
    shortLabel: 'CK',
    color: '#51cf66',
    meanColor: '#a9e34b',
  },
  {
    key: 'A',
    label: 'APC/C (A)',
    shortLabel: 'A',
    color: '#ff6b6b',
    meanColor: '#ffa8a8',
  },
];

export const DEFAULT_PARAMS: SimulationParams = {
  k1: 1,
  k2: 0.1,
  k3: 0.01,
  k4: 0.1,
  k5: 0.05,
  k6: 0.01,
};

export const RUN_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#84cc16',
  '#14b8a6',
  '#f59e0b',
  '#06b6d4',
  '#6366f1',
  '#10b981',
];

export const PARAM_DESCRIPTIONS: Record<keyof SimulationParams, string> = {
  k1: 'Cyclin нийлэгжих хурд',
  k2: 'Cyclin задрах хурд',
  k3: 'CDK идэвхжих хурд',
  k4: 'CDK идэвхгүйжих хурд',
  k5: 'APC идэвхжих хурд',
  k6: 'APC идэвхгүйжих хурд',
};
