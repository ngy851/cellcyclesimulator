import { SimulationRun, SpeciesKey } from '@/types/simulation';

export interface MeanPoint {
  time: number;
  value: number;
}

/**
 * Compute the mean trajectory for a given species across multiple runs.
 * Uses step-function interpolation (last-value-carried-forward).
 * Returns an array of {time, value} sampled at `numSamples` evenly spaced points.
 */
export function computeMeanTrajectory(
  runs: SimulationRun[],
  species: SpeciesKey,
  numSamples = 300
): MeanPoint[] {
  if (runs.length === 0) return [];

  // Find global time range
  let tMax = 0;
  for (const run of runs) {
    const last = run.result.time.at(-1) ?? 0;
    if (last > tMax) tMax = last;
  }
  if (tMax <= 0) return [];

  const step = tMax / (numSamples - 1);

  const result: MeanPoint[] = [];

  for (let i = 0; i < numSamples; i++) {
    const t = i * step;
    let sum = 0;
    let count = 0;

    for (const run of runs) {
      const times = run.result.time;
      const values = run.result[species];
      if (!values || values.length === 0) continue;

      // Binary search for last index where time[idx] <= t
      let lo = 0;
      let hi = times.length - 1;
      if (t < times[0]) {
        sum += values[0];
        count++;
        continue;
      }
      if (t >= times[hi]) {
        sum += values[hi];
        count++;
        continue;
      }
      while (lo < hi) {
        const mid = Math.floor((lo + hi + 1) / 2);
        if (times[mid] <= t) lo = mid;
        else hi = mid - 1;
      }
      sum += values[lo];
      count++;
    }

    if (count > 0) {
      result.push({ time: t, value: sum / count });
    }
  }

  return result;
}
