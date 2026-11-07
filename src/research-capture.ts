import { z } from 'zod'

/**
 * Research-only capture provenance. This is deliberately separate from the
 * product's SignalSession summary: research reproducibility requires device,
 * clock, consent and either raw or recomputable feature data.
 */
export const researchCaptureSessionSchema = z.object({
  version: z.literal('research-capture-v1'),
  participantCode: z.string().min(2).max(64).regex(/^[A-Za-z0-9_-]+$/),
  sessionId: z.string().min(1).max(128),
  collectedAt: z.string().datetime(),
  device: z.object({
    manufacturer: z.string().min(1),
    model: z.string().min(1),
    hardwareRevision: z.string().min(1).optional(),
    firmware: z.string().min(1),
    sdkVersion: z.string().min(1),
    serialHash: z.string().regex(/^[a-f0-9]{64}$/),
    channels: z.array(z.object({
      name: z.string().min(1),
      kind: z.enum(['heart_rate', 'eda', 'breath_phase', 'voice_energy', 'body_event', 'imagery_event', 'relationship_event']),
      unit: z.string().optional(),
    })).min(1),
  }),
  clock: z.object({
    source: z.enum(['device', 'host_arrival', 'both']),
    deviceEpochMs: z.number().int().nonnegative().optional(),
    hostEpochMs: z.number().int().nonnegative(),
    offsetMs: z.number().int(),
  }),
  consent: z.object({
    scope: z.enum(['raw_signal', 'features_only']),
    version: z.string().min(1),
    grantedAt: z.string().datetime(),
    withdrawalAt: z.string().datetime().optional(),
  }),
  capture: z.object({
    rawFormat: z.enum(['none', 'jsonl', 'edf', 'bdf', 'csv', 'other']),
    rawSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    rawBytes: z.number().int().nonnegative().optional(),
    sampleCount: z.number().int().nonnegative(),
    featureVersion: z.string().min(1),
    features: z.array(z.object({
      name: z.string().min(1),
      value: z.number().finite(),
      unit: z.string().optional(),
      quality: z.enum(['good', 'suspect', 'rejected']),
    })).default([]),
    quality: z.object({
      maxGapMs: z.number().finite().nullable(),
      gapsOverOneSecond: z.number().int().nonnegative(),
      droppedSamples: z.number().int().nonnegative(),
      reconnects: z.number().int().nonnegative(),
    }),
  }),
  retention: z.object({
    until: z.string().datetime(),
    access: z.enum(['local_encrypted', 'controlled_research_store']),
    policy: z.string().min(1),
  }),
  deletion: z.object({
    status: z.enum(['not_requested', 'requested', 'completed']),
    requestedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    method: z.string().optional(),
  }),
}).superRefine((value, ctx) => {
  if (value.consent.scope === 'raw_signal') {
    if (!value.capture.rawSha256 || !value.capture.rawBytes || value.capture.rawFormat === 'none') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['capture'], message: 'raw_signal consent requires raw format, bytes and sha256' })
    }
  } else if (value.capture.rawFormat !== 'none') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['capture', 'rawFormat'], message: 'features_only consent cannot store raw signal' })
  }
  if (value.deletion.status === 'completed' && !value.deletion.completedAt) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['deletion'], message: 'completed deletion requires completedAt' })
  }
})

export type ResearchCaptureSession = z.infer<typeof researchCaptureSessionSchema>
