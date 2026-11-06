import { expect, test } from '@playwright/test'

function chineseTokens(text: string) {
  return [...new Set(text.match(/[\u4e00-\u9fff]+/g) ?? [])].filter(token => token !== '中文')
}

test('English UI has no untranslated shell/capture/lab strings', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tacitweave.lang', 'en'))
  await page.goto('/')

  await page.getByRole('button', { name: 'New inner fragment' }).click()
  await expect(page.locator('.somatic-entry h2').first()).toContainText('Where is it most noticeable right now?')
  expect(chineseTokens(await page.locator('.workspace-scroll').innerText())).toEqual([])

  await page.getByRole('tab', { name: 'Use words' }).click()
  await expect(page.getByRole('button', { name: 'Enter' })).toBeVisible()
  expect(chineseTokens(await page.locator('.workspace-scroll').innerText())).toEqual([])

  for (const [label, heading] of [
    ['Motif journal', 'Local motif journal'],
    ['Relationship triggers', 'Relationship triggers'],
    ['Signal lab', 'BCI-1 signal lab'],
    ['Local & settings', 'Local data'],
  ] as const) {
    await page.getByRole('button', { name: label }).click()
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    expect(chineseTokens(await page.locator('.workspace-scroll').innerText()), label).toEqual([])
  }
})

test('English scene toolbar has no untranslated fallback', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tacitweave.lang', 'en'))
  await page.goto('/')
  await page.getByRole('button', { name: 'Load demo field' }).click()
  await page.locator('.field-node').first().focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: /Enter 75s space/ }).click()
  expect(chineseTokens(await page.locator('.scene-toolbar').innerText())).toEqual([])
  expect(chineseTokens(await page.locator('.scene-footer').innerText())).toEqual([])
})
