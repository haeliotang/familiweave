import { describe, expect, it } from 'vitest'
import { createAppLockRecord } from './app-lock'
import { decryptLocalSnapshot, deriveDataKey, encryptLocalSnapshot, isEncryptedLocalState } from './encrypted-store'

const snapshot = { motifs: [], relationships: [], field: { version: 'field-layout-v1' as const, positions: {}, links: [] }, signals: [] }

describe('encrypted local state', () => {
  it('encrypts and decrypts with the lock pin', async () => {
    const record = await createAppLockRecord('2468')
    const key = await deriveDataKey('2468', record.salt, record.iterations)
    const payload = await encryptLocalSnapshot(snapshot, record, key)
    expect(isEncryptedLocalState(payload)).toBe(true)
    expect(payload.ciphertext).not.toContain('motifs')
    const restored = await decryptLocalSnapshot(payload, '2468')
    expect(restored.snapshot).toEqual(snapshot)
  })

  it('rejects a wrong pin and tampered ciphertext', async () => {
    const record = await createAppLockRecord('2468')
    const key = await deriveDataKey('2468', record.salt, record.iterations)
    const payload = await encryptLocalSnapshot(snapshot, record, key)
    await expect(decryptLocalSnapshot(payload, '0000')).rejects.toThrow()
    await expect(decryptLocalSnapshot({ ...payload, ciphertext: payload.ciphertext.replace(/^./, 'A') }, '2468')).rejects.toThrow()
  })
})
