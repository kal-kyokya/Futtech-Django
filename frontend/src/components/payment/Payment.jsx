import { useState } from 'react';

const Payment = ({ amountKes, onMpesaPay, onStripe, pending, statusMessage }) => {
    const [provider, setProvider] = useState('MPESA');
    const [phoneNumber, setPhoneNumber] = useState('');

    const isMpesa = provider === 'MPESA';

    return (
	<div style={{ maxWidth: '520px', margin: '1.5rem auto', padding: '1rem', background: '#111', color: '#fff', borderRadius: '12px' }}>
	    <h2>Checkout</h2>
	    <p></p>

	    <div>
		<button></button>
		<button></button>
	    </div>

	    <div>
		<strong></strong>
	    </div>

	    {isMpesa ? (
		<>
		    <label></label>
		    <input/>
		    <button></button>
		</>
	    ) : (
		<button></button>
	    )}

	    {statusMessage ? <p></p> : null}
	</div>
    );
};

export default Payment;
