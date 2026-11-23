import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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
    test(`${path} is responsive, accessible, and renders without exceptions`, async ({
	page,
    }, testInfo) => {

	const errors = [];
	page.on('pageerror', (error) => errors.push(error.message));

	await preparePage(page, member);
	await page.goto(path);
	await expect(page.locator('h1')).toBeVisible();
	await expect(page.locator('.auth-loading')).toHaveCount(0);
	await page.evaluate(() => document.fonts.ready);

	expect(
	    await page.evaluate(
		() => document.documentElement.scrollWidth <= innerWidth + 1,
	    ),
	).toBe(true);

	const accessibility = await new AxeBuilder({ page })
	      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
	      .analyze();

	expect(
	    accessibility.violations.map(({ id, nodes }) => ({
		id,
		elements: nodes.map(({ target }) => target),
	    })),
	).toEqual([]);
	expect(errors).toEqual([]);
	if (path === '/home' || path === '/register' || path === '/profile') {
	    await page.screenshot({
		path: testInfo.outputPath('screen.png'),
		fullPage: true,
	    });
	}
    });
}

test('mobile navigation closes with Escape and restores keyboard focus', async ({
    page,
}) => {

    await page.setViewportSize({ width: 390, height: 844 });
    await preparePage(page);
    await page.goto('/showcase');
    const toggle = page.getByRole('button', { name: /navigation menu/ });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
});

test('registration supports keyboard submission and a distinct password step', async ({
    page,
}) => {

    await preparePage(page);
    await page.goto('/register');
    await page
	.getByLabel('Email address', { exact: true })
	.fill('player@example.test');
    await page.getByLabel('Username', { exact: true }).fill('player');
    await page.getByLabel('Username', { exact: true }).press('Enter');
    await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
    await expect(
	page.getByLabel('Confirm password', { exact: true }),
    ).toHaveValue('');
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
    await expect(page.getByRole('status')).toHaveText(
	'Payment confirmed. Your subscription is now active.',
	{ timeout: 10000 },
    );
});

test('get started navigation scrolls to the account form', async ({ page }) => {

    await preparePage(page);
    await page.goto('/register');
    await expect(page.locator('h1')).toBeVisible();
    if (await page.getByRole('button', { name: /navigation menu/ }).isVisible())
	await page.getByRole('button', { name: /navigation menu/ }).click();
    await page.getByRole('link', { name: /Get started/ }).click();
    await expect(page).toHaveURL(/#registration-form$/);
    await expect(
	page.getByLabel('Email address', { exact: true }),
    ).toBeInViewport();
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
