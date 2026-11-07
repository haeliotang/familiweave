import { describe, expect, it } from 'vitest'
import { defaultPrecisionScenarios, estimatePopulationSpearman, formatPrecisionReport, simulatePrecision } from './lsm0-precision'

describe('LSM-0 precision simulation', () => {
  it('is deterministic and reports both interval methods', () => {
    const first = simulatePrecision({ replications: 10, bootstrapReplicates: 10, scenarios: defaultPrecisionScenarios.slice(0, 2) })
    const second = simulatePrecision({ replications: 10, bootstrapReplicates: 10, scenarios: defaultPrecisionScenarios.slice(0, 2) })
    expect(first).toEqual(second)
    expect(first.scenarios[0].ordinary.method).toBe('ordinary_bootstrap')
    expect(first.scenarios[0].movingBlock.method).toBe('moving_block_bootstrap')
    expect(formatPrecisionReport(first)).toContain('Descriptive simulation only')
  })

  it('uses a population Spearman target rather than the latent coupling coefficient', () => {
    const target = estimatePopulationSpearman(defaultPrecisionScenarios[0], 20_000)
    expect(target).not.toBeNull()
    expect(target).toBeGreaterThan(0.15)
    expect(target).toBeLessThan(0.35)
    expect(target).not.toBe(defaultPrecisionScenarios[0].latentCoupling)
  })

  it('flags the temporal-dependence limitation and never emits p-values', () => {
    const report = simulatePrecision({ replications: 5, bootstrapReplicates: 5, scenarios: [defaultPrecisionScenarios[0]] })
    expect(report.limitations.join(' ')).toContain('temporal dependence')
    expect(JSON.stringify(report)).not.toMatch(/"pValue"|"p_value"/)
  })
})
