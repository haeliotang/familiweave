import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test('exports a v2 dataset and imports it back', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Load demo field' }).click()
  await page.getByRole('button', { name: 'Local & settings' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export all local data' }).click()
  const download = await downloadPromise
  const filePath = await download.path()
  expect(filePath).not.toBeNull()
  const dataset = JSON.parse(await readFile(filePath!, 'utf8')) as { version: string; motifs: unknown[]; relationships: unknown[]; field?: { positions: Record<string, unknown> }; signals?: unknown[] }
  expect(dataset.version).toBe('local-dataset-v2')
  expect(dataset.motifs.length).toBe(2)
  expect(dataset.relationships.length).toBe(1)
  expect(Object.keys(dataset.field?.positions ?? {}).length).toBeGreaterThan(0)
  expect(Array.isArray(dataset.signals)).toBe(true)

  await page.locator('input[type="file"]').setInputFiles({
    name: 'familiweave-local-dataset.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(dataset)),
  })
  await expect(page.getByText(/Imported/)).toBeVisible()

  await page.locator('input[type="file"]').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 'local-dataset-v2', motifs: 'nope', relationships: [] })),
  })
  await expect(page.getByText(/Import failed/)).toBeVisible()
})
