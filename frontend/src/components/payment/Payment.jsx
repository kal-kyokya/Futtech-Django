import { useState } from 'react';
import './payment.scss';

export default function Payment({
    amountKes,
    onMpesaPay,
    onStripePay,
    pending,
    statusMessage,
}) {
    const [provider, setProvider] = useState('MPESA');
    const [phoneNumber, setPhoneNumber] = useState('');
    const isMpesa = provider === 'MPESA';
    return (
	<section className='paymentCard card' aria-labelledby='checkout-heading'>
	    <p className='eyebrow'>INVEST IN YOUR GAME</p>
	    <h1 id='checkout-heading'>Checkout</h1>
	    <p>Choose how you pay. M-Pesa is recommended for Kenyan users.</p>
	    <div
		className='paymentProviders'
		role='group'
		aria-label='Payment provider'
	    >
		<button
		    type='button'
		    aria-pressed={isMpesa}
		    onClick={() => setProvider('MPESA')}
		    disabled={pending}
		>
		    M-Pesa (Recommended)
		</button>
		<button
		    type='button'
		    aria-pressed={!isMpesa}
		    onClick={() => setProvider('STRIPE')}
		    disabled={pending}
		>
		    Stripe (Fallback)
		</button>
	    </div>
	    {isMpesa && (
		<p className='paymentPrice'>
		    Plan price <strong>KES {amountKes}</strong>
		</p>
	    )}
	    <form
		onSubmit={(event) => {
		    event.preventDefault();
		    if (isMpesa) onMpesaPay(phoneNumber);
		    else onStripePay();
		}}
		aria-busy={pending}
	    >
		{isMpesa && (
		    <>
			<label htmlFor='mpesa-phone'>
			    M-Pesa phone number (e.g. 07XXXXXXXX)
			</label>
			<input
			    id='mpesa-phone'
			    type='tel'
			    autoComplete='tel'
			    inputMode='tel'
			    value={phoneNumber}
			    onChange={(event) => setPhoneNumber(event.target.value)}
			    placeholder='07XXXXXXXX'
			    disabled={pending}
			    required
			/>
		    </>
		)}
		<button type='submit' disabled={pending}>
		    {pending
		     ? 'Processing...'
		     : isMpesa
		     ? 'Pay with M-Pesa'
		     : 'Continue with Stripe'}
		</button>
	    </form>
	    {statusMessage && (
		<p className='status-message' role='status'>
		    {statusMessage}
		</p>
	    )}
	</section>
    );
}
