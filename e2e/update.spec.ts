import { expect, test } from '@playwright/test'

test('explicit update check shows a newer release without downloading it', async ({ page }) => {
  await page.route('https://api.github.com/repos/haeliotang/familiweave/releases/latest', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ tag_name: 'v0.2.0', name: 'Familiweave v0.2.0', html_url: 'https://example.test/release', published_at: '2026-11-04T00:00:00Z' }),
  }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Local & settings' }).click()
  await page.getByRole('button', { name: 'Check for updates' }).click()
  await expect(page.getByText('A new version is available')).toBeVisible()
  await expect(page.getByRole('link', { name: /v0\.2\.0/ })).toHaveAttribute('href', 'https://example.test/release')
})
