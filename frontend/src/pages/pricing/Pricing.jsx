import axios from 'axios';
import Navbar from '../../components/Navbar';
import Payment from '../../components/payment/Payment';


// Re-using the same conceptual API service as in '../watch/Watch'
const apiService = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    interceptors: {
	request: (config) => {
	    const user = JSON.parse(localStorage.getItem('user'));
	    if (user && user.accessToken) {
		config.headers.Authorization = `Bearer ${user.accessToken}`;
	    }
	    return config;
	},
    },
});

const Pricing = () => {
    

    return (
	<>
	    <Navbar />
	    <Payment pricingTableId=''
		     publishableKey=''
		     clientReferenceId=''
	    />
	</>
    );
};

export default Pricing;
