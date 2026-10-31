import { describe, expect, it } from 'vitest'
import { directorPlan } from './director'

describe('director plan', () => {
  it('derives the cue and template line without copying raw memory into the cloud prompt', () => {
    const plan = directorPlan({ memory: '张三走路时总会回头等我' })
    expect(plan.cue).toBe('wait')
    expect(plan.line).toEqual({ cue: 'wait', text: '不用急，我走慢一点。', source: 'template', mustNotInventMemory: true })
    expect(plan.worldPrompt).not.toContain('张三')
    expect(plan.worldPrompt).toContain('not a likeness of any real person')
    expect(plan.worldPrompt).toContain('looks back')
  })

  it('covers 0–75 seconds without gaps', () => {
    for (const memory of ['他总会回头等我', '她喜欢修东西', '今天的风很好']) {
      const { beats } = directorPlan({ memory })
      expect(beats[0].startSec).toBe(0)
      expect(beats.at(-1)!.endSec).toBe(75)
      for (let index = 1; index < beats.length; index++) expect(beats[index].startSec).toBe(beats[index - 1].endSec)
    }
  })

  it('uses cue-specific beats', () => {
    expect(directorPlan({ memory: '他总会回头等我' }).beats.map(beat => beat.action)).toContain('turn_back')
    expect(directorPlan({ memory: '她喜欢修东西' }).beats.map(beat => beat.action)).toContain('repair')
    expect(directorPlan({ memory: '他喜欢蓝色' }).beats.map(beat => beat.action)).toContain('pickup')
  })

  it('defaults to privacy-preserving safety policies', () => {
    const plan = directorPlan({ memory: '他喜欢蓝色' })
    expect(plan.safety).toEqual({ noRealPersonLikeness: true, fictionalLabel: true, cloudUpload: 'disabled', referenceFrame: 'none' })
    expect(plan.worldPrompt).toContain('No reference image')
    expect(plan.rendererKind).toBe('procedural')
  })

  it('rejects a real photo without explicit consent', () => {
    expect(() => directorPlan({ memory: '他总会回头等我', referenceFrame: 'user_photo' })).toThrow('user_photo_requires_explicit_consent')
  })

  it('allows a consented reference only for environment and layout', () => {
    const plan = directorPlan({ memory: '他总会回头等我', cloudUploadConsent: true, referenceFrame: 'user_photo' })
    expect(plan.safety.referenceFrame).toBe('user_photo_with_consent')
    expect(plan.safety.cloudUpload).toBe('explicit_consent')
    expect(plan.worldPrompt).toContain('Do not reproduce the real person')
    expect(plan.worldPrompt).toContain('not a likeness of any real person')
  })

  it('accepts a synthetic reference when cloud upload is consented', () => {
    const plan = directorPlan({ memory: '她喜欢修东西', cloudUploadConsent: true, referenceFrame: 'synthetic' })
    expect(plan.safety.referenceFrame).toBe('synthetic')
    expect(plan.worldPrompt).toContain('synthetic, non-identifying reference frame')
  })

  it('keeps a requested renderer kind for later dispatch', () => {
    expect(directorPlan({ memory: '他喜欢蓝色', rendererKind: 'genie4' }).rendererKind).toBe('genie4')
  })
})
