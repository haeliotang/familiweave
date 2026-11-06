import { expect, test } from '@playwright/test'

test('fragment, relationship, research and settings views lazy-load', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Fragment$/ }).click()
  await expect(page.getByRole('heading', { name: 'Local fragment journal' })).toBeVisible()
  await page.getByRole('button', { name: /Relationship$/ }).click()
  await expect(page.getByRole('heading', { name: 'Relationship moments' })).toBeVisible()
  await page.getByRole('button', { name: /Settings$/ }).click()
  await expect(page.getByRole('heading', { name: 'Local data' })).toBeVisible()
  await page.getByRole('button', { name: 'Open research tools' }).click()
  await expect(page.getByRole('heading', { name: 'Optional signals (simulation & device)' })).toBeVisible()
})
