import { expect, test } from '@playwright/test'

async function resources(page: import('@playwright/test').Page) {
  return page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name))
}

test('lab chunks load only after entering the lab', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Load demo field' }).click()
  await page.waitForTimeout(500)
  const initial = await resources(page)
  expect(initial.some(name => name.includes('signal-simulator'))).toBe(false)
  expect(initial.some(name => name.includes('device-signal-panel'))).toBe(false)

  await page.getByRole('button', { name: 'Signal lab' }).click()
  await expect(page.getByRole('heading', { name: 'BCI-1 signal lab' })).toBeVisible()
  const lab = await resources(page)
  expect(lab.some(name => name.includes('signal-simulator'))).toBe(true)
  expect(lab.some(name => name.includes('device-signal-panel'))).toBe(true)
})
