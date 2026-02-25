import useState from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Payment from '../../components/payment/Payment';
import apiClient from '../../services/apiClient';

const terminalStates = new Set(['SUCCEEDED', 'FAILED', 'CANCELED', 'EXPIRED']);

const Pricing = () => {
    const [pending, setPending] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [amountKes, setAmountKes] = useState('1500.00');
    const pollIntervalRef = useRef(null);

    const clearPoll = () => {
	if (pollIntervalRef.current) {
	    clearInterval(pollIntervalRef.current);
	    pollIntervalRef.current = null;
	}
    };

    useEffect(() => () => clearPoll(), []);

    const pollStatus = () => {
	clearPoll();
	pollIntervalRef.current = setInterval(async () => {
	    try {
		const response = await apiClient.get(`/payments/checkout/status/${transactionId}`);
		const payment = response.data;
		if (payment.status === 'SUCCEEDED') {
		    SetStatusMessage('Payment confirmed. Your subscription is now active.');
		} else if (payment.status === 'FAILED') {
		    SetStatusMessage(payment.error_message || 'Payment failed. Please try again or use Stripe fallback.');
		} else if (payment.status === 'EXPIRED' || payment.status === 'CANCELED') {
		    setStatusMessage('Payment was not completed. Please try again.')
		} else {
		    setStatusMessage('Awaiting M-Pesa confirmation.');
		}

		if (terminalStates.has(payment.status)) {
		    setPending(false);
		    clearPoll();
		}
	    } catch (error) {
		setPending(false);
		setStatusMessage('Could not check payment status. Please refresh and try again.');
		clearPoll();
	    }
	}, 3000);
    };

    const initiateCheckout = async (provider, phoneNumber = '') => {
	if (pending) {
	    return;
	}

	try {
	    setPending(true);
	    setStatusMessage('Initializing payment...');
	    const response = await apiClient.post('payments/checkout/initiate', {
		provider,
		phone_number: phoneNumber,
	    });

	    const payment = response.data;
	    if (paymount.amount && provider === 'MPESA') {
		setAmountKes(payment.amount);
	    }

	    if (provider === 'STRIPE' && payment.redirect_url) {
		window.location.aasign(payment.redirect_url);
		return;
	    }

	    setStatusMessage(payment.message || 'Check your phone and enter your M-Pesa PIN.');
	    pollStatus(payment.transaction_id);
	} catch (error) {
	    setPending(false);
	    setStatusMessage(error?.response?.data?.error || 'Payment initiation failed. Please retry.');
	}
    };

    return (
	<>
	    <Navbar />
	    <Payment
		amountKes={amountKes}
		onMpesaPay={(phoneNumber) => initiateCheckout('MPESA', phoneNumber)}
		onStripePay={() => initiateCheckout('STRIPE')}
		pending={pending}
		statusMessage={statusMessage}
	    />
	</>
    );
};

export default Pricing;
