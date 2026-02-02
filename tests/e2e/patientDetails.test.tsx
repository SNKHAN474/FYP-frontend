import { expect, test } from '@playwright/test';
import { SCREEN_SIZES } from '../utils/constants';

test.beforeEach(async ({ page }) => {
	await page.goto('/patients/123');
});

test.describe('Should match snapshots at different breakpoints:', async () => {
	test('xs', async ({ page }) => {
		page.setViewportSize(SCREEN_SIZES.xs);
		await expect(page).toHaveScreenshot('xs.png');
	});
	test('sm', async ({ page }) => {
		page.setViewportSize(SCREEN_SIZES.sm);
		await expect(page).toHaveScreenshot('sm.png');
	});
	test('md', async ({ page }) => {
		page.setViewportSize(SCREEN_SIZES.md);
		await expect(page).toHaveScreenshot('md.png');
	});
	test('lg', async ({ page }) => {
		page.setViewportSize(SCREEN_SIZES.lg);
		await expect(page).toHaveScreenshot('lg.png');
	});
	test('xl', async ({ page }) => {
		page.setViewportSize(SCREEN_SIZES.xl);
		await expect(page).toHaveScreenshot('xl.png');
	});
});

test('Should let you access the scan history modal', async ({ page }) => {
	await page.getByRole('button', { name: 'Scan history' }).click();
	await expect(page).toHaveScreenshot('modal.png');
});
