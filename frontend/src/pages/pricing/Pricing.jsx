import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/Navbar';
import Payment from '../../components/payment/Payment';
import apiClient from '../../services/apiClient';

const terminalStates = new Set(['SUCCEEDED', 'FAILED', 'CANCELED', 'EXPIRED']);
export default function Pricing() {
    const [pending, setPending] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [amountKes, setAmountKes] = useState('1500.00');
    const timeout = useRef(null);
    const active = useRef(true);
    useEffect(() => {
	active.current = true;
	return () => {
	    active.current = false;
	    clearTimeout(timeout.current);
	};
    }, []);
    const pollStatus = (transactionId) => {
	timeout.current = setTimeout(async () => {
	    try {
		const { data: payment } = await apiClient.get(
		    `/payments/checkout/status/${transactionId}/`,
		);
		if (!active.current) return;
		const messages = {
		    SUCCEEDED: 'Payment confirmed. Your subscription is now active.',
		    FAILED:
		    payment.error_message ||
			'Payment failed. Please try again or use Stripe fallback.',
		    EXPIRED: 'Payment was not completed. Please try again.',
		    CANCELED: 'Payment was not completed. Please try again.',
		};
		setStatusMessage(
		    messages[payment.status] || 'Awaiting M-Pesa confirmation.',
		);
		if (terminalStates.has(payment.status)) setPending(false);
		else pollStatus(transactionId);
	    } catch {
		if (!active.current) return;
		setPending(false);
		setStatusMessage(
		    'Could not check payment status. Please refresh and try again.',
		);
	    }
	}, 3000);
    };
    const initiateCheckout = async (provider, phoneNumber = '') => {
	if (pending) return;
	setPending(true);
	setStatusMessage('Initializing payment…');
	try {
	    const { data: payment } = await apiClient.post(
		'/payments/checkout/initiate/',
		{ provider, phone_number: phoneNumber },
	    );
	    if (!active.current) return;
	    if (payment.amount && provider === 'MPESA') setAmountKes(payment.amount);
	    if (provider === 'STRIPE' && payment.redirect_url) {
		window.location.assign(payment.redirect_url);
		return;
	    }
	    setStatusMessage(
		payment.message || 'Check your phone and enter your M-Pesa PIN.',
	    );
	    pollStatus(payment.transaction_id);
	} catch (error) {
	    if (!active.current) return;
	    setPending(false);
	    setStatusMessage(
		error?.response?.data?.error ||
		    'Payment initiation failed. Please retry.',
	    );
	}
    };
    return (
	<>
	    <Navbar />
	    <main
		id='main-content'
		tabIndex={-1}
		className='page-container checkoutPage'
	    >
		<Payment
		    amountKes={amountKes}
		    onMpesaPay={(phone) => initiateCheckout('MPESA', phone)}
		    onStripePay={() => initiateCheckout('STRIPE')}
		    pending={pending}
		    statusMessage={statusMessage}
		/>
	    </main>
	</>
    );
}
