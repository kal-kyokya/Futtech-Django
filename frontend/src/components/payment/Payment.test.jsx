import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Payment from './Payment';

describe('Payment component', () => {
    it('', () => {
	const user = userEvent.setup();
	render(
	    <Payment
		amountKes="1500.00"
		onMpesaPay={vi.fn()}
		onStripePay={vi.fn()}
		pending={false}
		statusMessage=""
	    />,
	);

	expect(screen.getByText('M-Pesa (Recommended)')).toBeTruthy();
	expect(screen.getByText('Stripe (Fallback)')).toBeTruthy();
	expect(screen.getByRole('button', { name: 'Pay with M-Pesa' })).toBeTruthy();

	await user.click(screen.getByText('Stripe (Fallback)'));
	expect(screen.getByRole('button', { name: 'Continue with Stripe' })).toBeTruthy();
    });
});
