import { describe, expect, it } from 'vitest'
import { cueFromMemory } from './cue'
import { cueCases } from './cue-cases'

describe('synthetic cue corpus', () => {
  it.each(cueCases)('$text → $expected', ({ text, expected }) => {
    expect(cueFromMemory(text)).toBe(expected)
  })

  it('covers positive and negative cases for each supported cue', () => {
    for (const cue of ['wait', 'repair', 'general'] as const) {
      expect(cueCases.filter(item => item.expected === cue).length).toBeGreaterThanOrEqual(5)
    }
    expect(cueCases.some(item => item.note.includes('negated'))).toBe(true)
    expect(cueCases.some(item => item.note.includes('contradictory'))).toBe(true)
  })
})
