import { test, expect } from '@playwright/test';
import { preparePage } from './fixtures';

const routes = [
    ['/register', false],
    ['/login', false],
    ['/showcase', false],
    ['/showcase/match-analysis', false],
    ['/about', false],
    ['/futtech-xi', false],
    ['/home', true],
    ['/videos', true],
    ['/drone-videos', true],
    ['/ai-analysis', true],
    ['/profile', true],
    ['/playlists', true],
    ['/new-playlist', true],
    ['/pricing-page', true],
    ['/watch/match-analysis', true],
];
for (const [path, member] of routes) {
    test(`${path} renders the restored design without exceptions`, async ({
	page,
    }, testInfo) => {
	const errors = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await preparePage(page, member);
	await page.goto(path);
	await expect(page.locator('#root')).not.toBeEmpty();
	await expect(page.locator('.auth-loading')).toHaveCount(0);
	await page.evaluate(() => document.fonts.ready);
	// The original design has different headings and responsive/accessibility
	// characteristics. Assert route content rather than redesign-only markup.
	await expect(page.locator('.routeError')).toHaveCount(0);
	if (
	    member &&
		['/home', '/videos', '/drone-videos', '/ai-analysis'].includes(path)
	) {
	    await expect(page.locator('.home > .featured')).toBeVisible();
	    await expect(page.locator('.playlistTitle').first()).toContainText(
		'Training review',
	    );
	    await expect(page.locator('.siteHeader, .homeMain')).toHaveCount(0);
	}
	expect(errors).toEqual([]);
	if (path === '/home' || path === '/register' || path === '/profile') {
	    await page.screenshot({
		path: testInfo.outputPath('screen.png'),
		fullPage: true,
	    });
	}
    });
}

test('original member mobile navigation opens and follows a video category', async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparePage(page, true);
    await page.goto('/home');
    await page.locator('.hamburger-menu').click();
    await expect(page.locator('.mobile-menu')).toHaveClass(/active/);
    await page
	.locator('.mobile-menu')
	.getByText('Drone Footages', { exact: true })
	.click();
    await expect(page).toHaveURL(/drone-videos$/);
    await expect(page.locator('.featured .category')).toContainText(
	'Drone views',
    );
    await expect(page.locator('.mobile-menu')).toHaveClass(/hidden/);
});

test('checkout handles the existing M-Pesa initiation and confirmation flow', async ({
    page,
}) => {
    await preparePage(page, true);
    await page.goto('/pricing-page');
    await page
	.getByLabel('M-Pesa phone number', { exact: false })
	.fill('0712345678');
    await page.getByRole('button', { name: 'Pay with M-Pesa' }).click();
    await expect(
	page.getByText('Payment confirmed. Your subscription is now active.', {
	    exact: true,
	}),
    ).toHaveText('Payment confirmed. Your subscription is now active.', {
	timeout: 10000,
    });
});

test('the existing analysis demo renders its result through the configured API', async ({
    page,
}) => {
    await preparePage(page);
    await page.goto('/futtech-xi');
    await page.getByRole('button', { name: 'Analyze with Futtech XI' }).click();
    await expect(
	page.getByRole('heading', {
	    name: 'FC Barcelona (curated demonstration profile)',
	}),
    ).toBeVisible();
    await expect(
	page.getByText('Structured possession creates space.'),
    ).toBeVisible();
});
