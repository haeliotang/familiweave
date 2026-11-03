import { describe, expect, it } from 'vitest'
import { createAppLockRecord, isAppLockRecord, verifyAppLock } from './app-lock'

describe('app lock', () => {
  it('derives a salted verifier and verifies the pin', async () => {
    const record = await createAppLockRecord('2468')
    expect(isAppLockRecord(record)).toBe(true)
    expect(record.hash).not.toContain('2468')
    expect(await verifyAppLock('2468', record)).toBe(true)
    expect(await verifyAppLock('1357', record)).toBe(false)
  })

  it('rejects short pins and malformed records', async () => {
    await expect(createAppLockRecord('12')).rejects.toThrow()
    expect(isAppLockRecord({ version: 'app-lock-v1' })).toBe(false)
  })
})
