import { SimulationParams, SimulationResult, SimulationMode } from '@/types/simulation';
import { runGillespie } from '@/lib/gillespie';

const FLASK_URL = 'http://127.0.0.1:5000/simulate';

/**
 * Run simulation in-browser using Gillespie SSA.
 * Uses setTimeout to yield the main thread before running so the UI
 * can render the loading state before the synchronous work begins.
 */
async function runBrowser(params: SimulationParams): Promise<SimulationResult> {
  console.log('[Gillespie] In-browser simulation:', params);

  // Yield to the browser so the loading spinner can paint
  await new Promise<void>((r) => setTimeout(r, 20));

  let result: SimulationResult;
  try {
    result = runGillespie({ ...params, Tmax: 50 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Gillespie] Error:', msg);
    throw new Error(`Симуляцийн алдаа: ${msg}`);
  }

  // Validate result structure
  if (
    !Array.isArray(result.time) ||
    !Array.isArray(result.cyclin) ||
    result.time.length < 2
  ) {
    throw new Error(
      'Симуляци хүчинтэй өгөгдөл буцааж чадсангүй. ' +
      'Параметрүүдийг шалгана уу.'
    );
  }

  console.log(`[Gillespie] Done — ${result.time.length} events, tMax=${result.time.at(-1)?.toFixed(2)}`);
  return result;
}

/**
 * Run simulation by calling the Flask backend.
 */
async function runFlask(params: SimulationParams): Promise<SimulationResult> {
  console.log('[Flask] POST', FLASK_URL, params);
  const res = await fetch(FLASK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error('[Flask] Non-JSON response:', text.slice(0, 200));
    throw new Error(
      `Flask сервер JSON биш хариу буцааж байна (${res.status}). ` +
      'CORS болон сервер ажиллаж байгаа эсэхийг шалгана уу.'
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(`Flask алдаа ${res.status}: ${err.detail ?? JSON.stringify(err)}`);
  }

  const data = await res.json();
  if (!Array.isArray(data.time) || !Array.isArray(data.cyclin)) {
    throw new Error('Flask буруу формат буцааж байна. time[] болон cyclin[] талбар шаардлагатай.');
  }

  return data as SimulationResult;
}

/**
 * Public simulation runner — dispatches to browser or Flask based on mode.
 */
export async function runSimulation(
  params: SimulationParams,
  mode: SimulationMode = 'browser'
): Promise<SimulationResult> {
  if (mode === 'flask') {
    return runFlask(params);
  }
  return runBrowser(params);
}
