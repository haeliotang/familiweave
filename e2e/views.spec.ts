import { expect, test } from '@playwright/test'

test('journal, relationship, lab and settings views lazy-load', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Motif journal' }).click()
  await expect(page.getByRole('heading', { name: 'Local motif journal' })).toBeVisible()
  await page.getByRole('button', { name: 'Relationship triggers' }).click()
  await expect(page.getByRole('heading', { name: 'Relationship triggers' })).toBeVisible()
  await page.getByRole('button', { name: 'Signal lab' }).click()
  await expect(page.getByRole('heading', { name: 'BCI-1 signal lab' })).toBeVisible()
  await page.getByRole('button', { name: 'Local & settings' }).click()
  await expect(page.getByRole('heading', { name: 'Local data' })).toBeVisible()
})
