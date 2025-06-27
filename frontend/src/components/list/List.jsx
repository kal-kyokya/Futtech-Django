// --- frontend/src/components/list/List.jsx ---

import './list.scss';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ListItem from '../listItem/ListItem';
import { useRef, useState } from 'react';

const List = ({ list }) => {
    const listRef = useRef();
    const [ slideNumber, setSlideNumber ] = useState(0);
    const [ isMoved, setIsMoved ] = useState(false);

    // Determine how many items are visible at once to adjust slide step
    const getVisibleItemsCount = () => {
	if (!listRef.current) return 1; // Default to 1 if ref not ready

	const containerWidth = listRef.current.offsetWidth;
	// More reliably, get the first item's actual computed width
	if (listRef.current.children.length > 0) {
	    const firstItem = listRef.current.children[0];
	    const itemWidth = firstItem.offsetWidth;
	    const computedStyle = window.getComputedStyle(firstItem);
	    const itemMarginRight = parseFloat(computed.marginRight);
	    const totalItemWidth = itemWidth + itemMarginRight;

	    // Calculate how many items fit in the current container width
	    // We will floor it since it can be a floating point number
	    return Math.floor(containerWidth / totalItemWidth);
	}
	return 1; // Fallback
    }

    const handleClick = (direction) => {
	let distance = listRef.current.getBoundingClientRect().x - 50;
	setIsMoved(true);

	if (direction === 'left' && slideNumber > 0) {
	    setSlideNumber(slideNumber - 1);
	    listRef.current.style.transform = `translateX(${299 + distance}px)`;
	}

	if (direction === 'right' && slideNumber < 6) {
	    setSlideNumber(slideNumber + 1);
	    listRef.current.style.transform = `translateX(${-299 + distance}px)`;
	}
    }

    return (
	<div className='list'>
	    <span className='listTitle'> { list.title } </span>

	    <div className='wrapper'>
		<ArrowBackIosNewIcon className='sliderArrow left'
				     onClick={ () => handleClick('left') }
				     style={ { display: !isMoved && "none" } }
		/>

		<div className='container' ref={listRef}>
		    {
			Array.isArray(list.content) && list.content.map((videoId, index) => {
			    return (
				<ListItem videoId={ videoId }
					  index={ index }
					  key={ index }
				/>
			    )
			})
		    }
		</div>

		<ArrowForwardIosIcon className='sliderArrow right'
				     onClick={ () => handleClick('right') }/>
	    </div>
	</div>
    );
}

export default List;
