import { useState } from 'react';

const Payment = ({ amountKes, onMpesaPay, onStripe, pending, statusMessage }) => {
    const [provider, setProvider] = useState('MPESA');
    const [phoneNumber, setPhoneNumber] = useState('');

    const isMpesa = provider === 'MPESA';

    return (
	<div style={{ maxWidth: '520px', margin: '1.5rem auto', padding: '1rem', background: '#111', color: '#fff', borderRadius: '12px' }}>
	    <h2>Checkout</h2>
	    <p>M-Pesa is recommended for Kenyan users. Stripe is available as fallback option.</p>

	    <div>
		<button
		    type="button"
		    onClick={() => setProvider('MPESA')}
		    disabled={pending}
		    style={{ background: isMpesa ? '#2E7D32' : '#333', color: '#FFF', border: 0, padding: '0.5rem 0.75rem', borderRadius: '8px' }}
		>
		    M-Pesa (Recommended)
		</button>
		<button
		    type="button"
		    onClick={() => setProvider('STRIPE')}
		    disabled={pending}
		    style={{ background: !isMpesa ? '#1565C0' : '#333', color: '#FFF', border: 0, padding: '0.5rem 0.75rem', borderRadius: '8px' }}
		>
		    Stripe (Fallback)
		</button>
	    </div>

	    <div style={{ marginBottom: '1rem' }}>
		<strong>Plan price:</strong> KES {amountKes}
	    </div>

	    {isMpesa ? (
		<>
		    <label htmlFor="mpesa-phone">M-Pesa phone number (e.g. 07XXXXXXXX)</label>
		    <input
			id="mpesa-phone"
			type="tel"
			value={phoneNumber}
			onChange={(event) => setPhoneNumber(event.target.value)}
			placeholder="07XXXXXXXX"
			disabled={pending}
			style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem', borderRadius: '8px', border: '1px solid #555', background: '#1F1F1F', color: '#FFF' }}
		    />
		    <button
			type="button"
			onClick={() => onMpesaPay(phoneNumber)}
			disabled={pending}
			style={{ marginTop: '1rem', width: '100%', background: '#2E7D32', color: '#FFF', border: 0, padding: '0.7rem', borderRadius: '8px' }}
		    >
			{pending ? 'Processing...': 'Pay with M-Pesa'}
		    </button>
		</>
	    ) : (
		<button
		    type="button"
		    onClick={onStripePay}
		    disabled={pending}
		    style={{ width: '100%', background: '#1565C0', color: '#FFF', border: 0, padding: '0.7rem', borderRadius: '8px' }}
		    >
			{pending ? 'Processing...': 'Continue with Stripe'}
		</button>
	    )}

	    {statusMessage ? <p style={{ marginTop: '1rem' }}>{statusMessage}</p> : null}
	</div>
    );
};

export default Payment;
