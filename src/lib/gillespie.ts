/**
 * Gillespie Stochastic Simulation Algorithm (SSA)
 * Cell Cycle Model: Cyclin / CDK / APC dynamics
 *
 * Species:
 *   C   — Free Cyclin
 *   K   — Free CDK (Cdc2)
 *   CK  — Cyclin-CDK complex
 *   A   — Active APC (Anaphase-Promoting Complex)
 *
 * Reactions:
 *   R1: ∅  → C          (Cyclin synthesis,            rate = k1)
 *   R2: C  → ∅          (Cyclin degradation,          rate = k2 · C)
 *   R3: C + K → CK      (Complex formation,           rate = k3 · C · K)
 *   R4: CK → C + K      (Complex dissociation,        rate = k4 · CK)
 *   R5: ∅  → A          (APC activation by CK,        rate = k5 · CK)
 *   R6: A  → ∅          (APC inactivation,            rate = k6 · A)
 */

export interface GillespieParams {
  k1: number;
  k2: number;
  k3: number;
  k4: number;
  k5: number;
  k6: number;
  Tmax?: number;
}

export interface GillespieResult {
  time: number[];
  cyclin: number[];
  K: number[];
  CK: number[];
  A: number[];
}

// Reduced step limit to prevent UI freeze on the main thread
const MAX_STEPS = 10_000;

export function runGillespie(params: GillespieParams): GillespieResult {
  const { k1, k2, k3, k4, k5, k6, Tmax = 50 } = params;

  // Guard: all rate constants must be finite non-negative numbers
  const rates = [k1, k2, k3, k4, k5, k6];
  for (const r of rates) {
    if (!isFinite(r) || r < 0) {
      throw new Error('Параметрийн утга хүчингүй байна. Бүх k утга ≥ 0 бөгөөд тоо байх ёстой.');
    }
  }
  if (!isFinite(Tmax) || Tmax <= 0) {
    throw new Error('Tmax 0-ээс их эерэг тоо байх ёстой.');
  }

  // Initial molecule counts
  let C = 0, K = 50, CK = 0, A = 0;
  let t = 0;

  const time: number[] = [0];
  const cyclin: number[] = [C];
  const Karr: number[] = [K];
  const CKarr: number[] = [CK];
  const Aarr: number[] = [A];

  for (let step = 0; step < MAX_STEPS; step++) {
    // ── Propensity functions ──────────────────────────────────────────────
    const a1 = k1;               // synthesis
    const a2 = k2 * C;           // free Cyclin degradation
    const a3 = k3 * C * K;       // complex formation
    const a4 = k4 * CK;          // complex dissociation
    const a5 = k5 * CK;          // APC activation
    const a6 = k6 * A;           // APC inactivation

    const aTotal = a1 + a2 + a3 + a4 + a5 + a6;

    // Stop if no reactions are possible
    if (aTotal <= 0 || !isFinite(aTotal)) break;

    // ── Time step (exponential waiting time) ─────────────────────────────
    const r1 = Math.random();
    if (r1 === 0) continue; // avoid log(0)
    const tau = -Math.log(r1) / aTotal;

    // Guard: tau must be a valid positive finite number
    if (!isFinite(tau) || tau <= 0 || isNaN(tau)) break;

    t += tau;
    if (t > Tmax) break;

    // ── Reaction selection ────────────────────────────────────────────────
    const mu = Math.random() * aTotal;
    let cum = a1;

    if (mu < cum) {
      C += 1;                                     // R1: synthesise Cyclin
    } else if (mu < (cum += a2)) {
      C = Math.max(0, C - 1);                     // R2: degrade free Cyclin
    } else if (mu < (cum += a3)) {
      C = Math.max(0, C - 1);
      K = Math.max(0, K - 1);
      CK += 1;                                    // R3: form complex
    } else if (mu < (cum += a4)) {
      CK = Math.max(0, CK - 1);
      C += 1;
      K += 1;                                     // R4: dissociate complex
    } else if (mu < (cum += a5)) {
      A += 1;                                     // R5: activate APC
    } else {
      A = Math.max(0, A - 1);                     // R6: inactivate APC
    }

    time.push(t);
    cyclin.push(C);
    Karr.push(K);
    CKarr.push(CK);
    Aarr.push(A);
  }

  // Ensure at least 2 data points exist to form a valid chart
  if (time.length < 2) {
    throw new Error(
      'Симуляци хангалттай өгөгдөл үүсгэсэнгүй. ' +
      'k1 утгыг нэмэгдүүлж эсвэл бусад параметрүүдийг шалгана уу.'
    );
  }

  return { time, cyclin, K: Karr, CK: CKarr, A: Aarr };
}
