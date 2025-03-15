import './listItem.scss';
import { useState } from 'react';

const ListItem = ({ index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const trailer = "https://vimeo.com/1064612829/1b2ea37094";

    return (
	<div className='listItem'
	     style={{ transform: isHovered ? "scale(1.2)" : "scale(1)", zIndex: isHovered ? 10 : 1 }}
	     onMouseEnter={ () => setIsHovered(true) }
	     onMouseLeave={ () => setIsHovered(false) }
	>
	    {!isHovered && <img src='../../../public/congo.JPEG'
		 alt='Website Owner proudly holding the Congolese flag'
	    />}
	    {isHovered && <video src='../../../public/JP-CP.MOV' autoPlay={true} loop />}
	</div>
    );
}

export default ListItem;
