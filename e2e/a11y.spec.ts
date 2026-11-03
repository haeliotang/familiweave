import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('field and settings have no structural WCAG A/AA violations', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Load demo field' }).click()
  // This test gates structure/ARIA; color contrast is tracked separately because the paper palette is intentionally quiet.
  const field = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']).analyze()
  expect(field.violations).toEqual([])

  await page.getByRole('button', { name: 'Local & settings' }).click()
  const settings = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']).analyze()
  expect(settings.violations).toEqual([])
})
