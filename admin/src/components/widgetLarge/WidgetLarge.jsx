import './widgetLarge.scss';

const WidgetLarge = () => {
    const Button = ({ type }) => {
	return (
	    <button className={'widgetLargeButton ' + type}>
		{ type }
	    </button>
	);
    };

    return (
	<div className='widgetLarge'>
	    <h3 className='widgetLargeTitle'>Latest transactions</h3>
	    <table className='widgetLargeTable'>
		<thead className='widgetLargeThead'>
		    <tr className='widgetLargeTr'>
			<th className='widgetLargeTh'>User</th>
			<th className='widgetLargeTh'>Date</th>
			<th className='widgetLargeTh'>Amount</th>
			<th className='widgetLargeTh'>Status</th>
		    </tr>
		</thead>

		<tbody className='widgetLargeTbody'>
		    <tr className='widgetLargeTr'>
			<td className='widgetLargeUser'>
			    <img className='profile'
				 src='profile1.JPG'
				 alt='User Profile'
			    />
			    <span className='widgetLargeUsername'>Dem la boom</span>
			</td>
			<td className='widgetLargeDate'> 15th March 2025</td>
			<td className='widgetLargeAmount'>Ksh.65,000</td>
			<td className='widgetLargeStatus'>
			    <Button type='Approved' />
			</td>
		    </tr>			
		    <tr className='widgetLargeTr'>
			<td className='widgetLargeUser'>
			    <img className='profile'
				 src='profile1.JPG'
				 alt='User Profile'
			    />
			    <span className='widgetLargeUsername'>Dem la boom</span>
			</td>
			<td className='widgetLargeDate'> 15th March 2025</td>
			<td className='widgetLargeAmount'>Ksh.65,000</td>
			<td className='widgetLargeStatus'>
			    <Button type='Declined' />
			</td>
		    </tr>			
		    <tr className='widgetLargeTr'>
			<td className='widgetLargeUser'>
			    <img className='profile'
				 src='profile1.JPG'
				 alt='User Profile'
			    />
			    <span className='widgetLargeUsername'>Dem la boom</span>
			</td>
			<td className='widgetLargeDate'> 15th March 2025</td>
			<td className='widgetLargeAmount'>Ksh.65,000</td>
			<td className='widgetLargeStatus'>
			    <Button type='Pending' />
			</td>
		    </tr>			
		    <tr className='widgetLargeTr'>
			<td className='widgetLargeUser'>
			    <img className='profile'
				 src='profile1.JPG'
				 alt='User Profile'
			    />
			    <span className='widgetLargeUsername'>Dem la boom</span>
			</td>
			<td className='widgetLargeDate'> 15th March 2025</td>
			<td className='widgetLargeAmount'>Ksh.65,000</td>
			<td className='widgetLargeStatus'>
			    <Button type='Declined' />
			</td>
		    </tr>			
		    <tr className='widgetLargeTr'>
			<td className='widgetLargeUser'>
			    <img className='profile'
				 src='profile1.JPG'
				 alt='User Profile'
			    />
			    <span className='widgetLargeUsername'>Dem la boom</span>
			</td>
			<td className='widgetLargeDate'> 15th March 2025</td>
			<td className='widgetLargeAmount'>Ksh.65,000</td>
			<td className='widgetLargeStatus'>
			    <Button type='Approved' />
			</td>
		    </tr>			
		</tbody>
	    </table>
	</div>
    );
}

export default WidgetLarge;
