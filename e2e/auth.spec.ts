import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
        await page.goto('http://localhost:3000')

        // Should redirect to Auth0 login
        await expect(page).toHaveURL(/auth0\.com|auth\/login/)
    })

    test('should show dashboard after login', async ({ page }) => {
        // Note: This requires setting up an auth state
        // For now, we'll skip actual login
        test.skip()
    })
})