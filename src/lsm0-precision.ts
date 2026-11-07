/**
 * Deterministic precision simulation for the LSM-0 pilot design.
 *
 * This is not a power calculator or a result; it is an audit aid for choosing
 * sample size, session count and interval estimation before protocol freeze.
 * It reports estimation precision and interval coverage under explicit
 * simulation assumptions, including temporal autocorrelation.
 */
import { spearmanRho } from './lsm0-eval'

export interface PrecisionScenario {
  participants: number
  sessions: number
  /** Target within-person association used by the data generator. */
  targetRho: number
  /** AR(1) persistence of the latent session state. */
  autocorrelation: number
  signalNoise: number
  reportNoise: number
  missingRate: number
}

export interface PrecisionInterval {
  method: 'ordinary_bootstrap' | 'moving_block_bootstrap'
  meanWidth: number | null
  coverage: number | null
}

export interface PrecisionScenarioResult extends PrecisionScenario {
  replications: number
  evaluableParticipantRate: number
  meanObservedRho: number | null
  betweenParticipantSd: number | null
  ordinary: PrecisionInterval
  movingBlock: PrecisionInterval
}

export interface PrecisionReport {
  version: 'lsm0-precision-v1'
  generatedAt: string
  seed: number
  bootstrapReplicates: number
  blockLength: number
  scenarios: PrecisionScenarioResult[]
  limitations: string[]
}

export interface PrecisionOptions {
  seed?: number
  replications?: number
  bootstrapReplicates?: number
  blockLength?: number
  scenarios?: PrecisionScenario[]
}

function lcg(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function normal(random: () => number) {
  const u = Math.max(random(), Number.EPSILON)
  const v = random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return Number.NaN
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  return lower === upper ? sorted[lower] : sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

function interval(bounds: Array<{ low: number; high: number }>, target: number): { meanWidth: number | null; coverage: number | null } {
  const usable = bounds.filter(bound => Number.isFinite(bound.low) && Number.isFinite(bound.high))
  if (!usable.length) return { meanWidth: null, coverage: null }
  return {
    meanWidth: usable.reduce((sum, bound) => sum + Math.max(0, bound.high - bound.low), 0) / usable.length,
    coverage: usable.filter(bound => bound.low <= target && target <= bound.high).length / usable.length,
  }
}

function bootstrapRho(xs: number[], ys: number[], random: () => number, replicates: number, blockLength: number, block: boolean): number[] {
  const n = xs.length
  const out: number[] = []
  for (let replicate = 0; replicate < replicates; replicate += 1) {
    const bx: number[] = []
    const by: number[] = []
    if (!block) {
      for (let index = 0; index < n; index += 1) {
        const pick = Math.floor(random() * n)
        bx.push(xs[pick]); by.push(ys[pick])
      }
    } else {
      const blocks = Math.ceil(n / blockLength)
      for (let b = 0; b < blocks; b += 1) {
        const start = Math.floor(random() * n)
        for (let offset = 0; offset < blockLength; offset += 1) {
          const index = (start + offset) % n
          bx.push(xs[index]); by.push(ys[index])
        }
      }
    }
    const rho = spearmanRho(bx, by)
    if (rho !== null) out.push(rho)
  }
  return out
}

function simulateScenario(scenario: PrecisionScenario, options: Required<Pick<PrecisionOptions, 'seed' | 'replications' | 'bootstrapReplicates' | 'blockLength'>>): PrecisionScenarioResult {
  const random = lcg(options.seed + scenario.participants * 1009 + scenario.sessions * 9176)
  const observed: number[] = []
  const ordinaryCis: Array<{ low: number; high: number }> = []
  const blockCis: Array<{ low: number; high: number }> = []
  let evaluable = 0
  let attempted = 0
  for (let replication = 0; replication < options.replications; replication += 1) {
    for (let participant = 0; participant < scenario.participants; participant += 1) {
      attempted += 1
      let latent = normal(random)
      const xs: number[] = []
      const ys: number[] = []
      for (let session = 0; session < scenario.sessions; session += 1) {
        if (session > 0) latent = scenario.autocorrelation * latent + Math.sqrt(Math.max(0, 1 - scenario.autocorrelation ** 2)) * normal(random)
        const x = latent + scenario.signalNoise * normal(random)
        const y = scenario.targetRho * latent + Math.sqrt(Math.max(0, 1 - scenario.targetRho ** 2)) * normal(random) + scenario.reportNoise * normal(random)
        if (random() >= scenario.missingRate) { xs.push(x); ys.push(y) }
      }
      const rho = xs.length >= 4 ? spearmanRho(xs, ys) : null
      if (rho === null) continue
      evaluable += 1
      observed.push(rho)
      const ordinary = bootstrapRho(xs, ys, random, options.bootstrapReplicates, options.blockLength, false).sort((a, b) => a - b)
      const block = bootstrapRho(xs, ys, random, options.bootstrapReplicates, options.blockLength, true).sort((a, b) => a - b)
      if (ordinary.length) ordinaryCis.push({ low: percentile(ordinary, 0.025), high: percentile(ordinary, 0.975) })
      if (block.length) blockCis.push({ low: percentile(block, 0.025), high: percentile(block, 0.975) })
    }
  }
  const mean = observed.length ? observed.reduce((a, b) => a + b, 0) / observed.length : null
  const variance = observed.length > 1 ? observed.reduce((sum, value) => sum + (value - (mean ?? 0)) ** 2, 0) / (observed.length - 1) : null
  return {
    ...scenario,
    replications: options.replications,
    evaluableParticipantRate: attempted ? evaluable / attempted : 0,
    meanObservedRho: mean,
    betweenParticipantSd: variance === null ? null : Math.sqrt(variance),
    ordinary: { method: 'ordinary_bootstrap', ...interval(ordinaryCis, scenario.targetRho) },
    movingBlock: { method: 'moving_block_bootstrap', ...interval(blockCis, scenario.targetRho) },
  }
}

export const defaultPrecisionScenarios: PrecisionScenario[] = [
  { participants: 12, sessions: 8, targetRho: 0.4, autocorrelation: 0.3, signalNoise: 0.7, reportNoise: 0.7, missingRate: 0.1 },
  { participants: 16, sessions: 8, targetRho: 0.4, autocorrelation: 0.3, signalNoise: 0.7, reportNoise: 0.7, missingRate: 0.1 },
  { participants: 12, sessions: 12, targetRho: 0.4, autocorrelation: 0.3, signalNoise: 0.7, reportNoise: 0.7, missingRate: 0.1 },
  { participants: 16, sessions: 12, targetRho: 0.4, autocorrelation: 0.3, signalNoise: 0.7, reportNoise: 0.7, missingRate: 0.1 },
  { participants: 20, sessions: 12, targetRho: 0.4, autocorrelation: 0.3, signalNoise: 0.7, reportNoise: 0.7, missingRate: 0.1 },
]

export function simulatePrecision(options: PrecisionOptions = {}): PrecisionReport {
  const resolved = {
    seed: options.seed ?? 20261107,
    replications: options.replications ?? 100,
    bootstrapReplicates: options.bootstrapReplicates ?? 100,
    blockLength: options.blockLength ?? 3,
  }
  const scenarios = options.scenarios ?? defaultPrecisionScenarios
  return {
    version: 'lsm0-precision-v1',
    generatedAt: '2026-11-07T00:00:00.000Z',
    seed: resolved.seed,
    bootstrapReplicates: resolved.bootstrapReplicates,
    blockLength: resolved.blockLength,
    scenarios: scenarios.map(scenario => simulateScenario(scenario, resolved)),
    limitations: [
      'Simulation assumptions are not empirical estimates; run sensitivity analyses before protocol freeze.',
      'Coverage/width are descriptive; no p-values, clinical claims or model selection are made.',
      'Ordinary bootstrap ignores temporal dependence by construction; moving-block bootstrap is reported as a sensitivity comparator.',
      'The latent AR(1) generator is a simplification, not evidence about real physiology or self-report.',
    ],
  }
}

export function formatPrecisionReport(report: PrecisionReport): string {
  const lines = [
    `LSM-0 precision simulation (${report.version})`,
    `seed ${report.seed}; replications ${report.scenarios[0]?.replications ?? 0}; bootstrap ${report.bootstrapReplicates}; block ${report.blockLength}`,
    'N x S | mean rho | between-participant SD | ordinary width (coverage) | block width (coverage) | evaluable',
  ]
  for (const scenario of report.scenarios) {
    const metric = (value: number | null) => value === null ? 'n/a' : value.toFixed(3)
    lines.push(`${scenario.participants} x ${scenario.sessions} | ${metric(scenario.meanObservedRho)} | ${metric(scenario.betweenParticipantSd)} | ${metric(scenario.ordinary.meanWidth)} (${metric(scenario.ordinary.coverage)}) | ${metric(scenario.movingBlock.meanWidth)} (${metric(scenario.movingBlock.coverage)}) | ${scenario.evaluableParticipantRate.toFixed(2)}`)
  }
  lines.push('Descriptive simulation only; no p-values or clinical claims.')
  return lines.join('\n')
}
