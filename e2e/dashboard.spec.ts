import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // TODO: Set up authenticated state
        // For now we'll test public pages
    })

    test('has correct page title', async ({ page }) => {
        await page.goto('http://localhost:3000')
        await expect(page).toHaveTitle("Log in | SaaS Starter")
    })
})