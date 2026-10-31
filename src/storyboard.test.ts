import { describe, expect, it } from 'vitest'
import { directorPlan } from './director'
import { storyboard, storyboardFromMemory, storyboardMarkdown } from './storyboard'

describe('storyboard', () => {
  it('projects a director plan without adding memory text', () => {
    const plan = directorPlan({ memory: '张三走路时总会回头等我' })
    const board = storyboard(plan)
    expect(board.version).toBe('storyboard-v1')
    expect(board.cue).toBe('wait')
    expect(board.beats[0].startSec).toBe(0)
    expect(board.beats.at(-1)!.endSec).toBe(75)
    expect(board.line.text).toBe('不用急，我走慢一点。')
    expect(board.prompts.character).toContain('not a likeness of any real person')
    expect(JSON.stringify(board)).not.toContain('张三')
  })

  it('renders markdown for manual Genie experiments', () => {
    const markdown = storyboardMarkdown(directorPlan({ memory: '她喜欢修东西' }))
    expect(markdown).toContain('# Storyboard · repair')
    expect(markdown).toContain('## 节拍')
    expect(markdown).toContain('再试试，这下应该好了。')
    expect(markdown).toContain('### Negative')
    expect(markdown).not.toContain('她喜欢修东西')
  })

  it('keeps the no-upload default in the storyboard', () => {
    const board = storyboardFromMemory('他喜欢蓝色')
    expect(board.safety.cloudUpload).toBe('disabled')
    expect(board.prompts.reference).toContain('No reference image')
  })

  it('carries explicit consent into the reference prompt', () => {
    const board = storyboard(directorPlan({ memory: '他总会回头等我', cloudUploadConsent: true, referenceFrame: 'user_photo' }))
    expect(board.safety.referenceFrame).toBe('user_photo_with_consent')
    expect(board.prompts.reference).toContain('explicit consent')
  })
})
