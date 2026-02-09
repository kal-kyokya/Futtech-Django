import './listItem.scss';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import { useState } from 'react';

const ListItem = ({ index }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
	<div className='listItem'
	     style={{ transform: isHovered ? "scale(1.2)" : "scale(1)", zIndex: isHovered ? 10 : 1 }}
	     onMouseEnter={ () => setIsHovered(true) }
	     onMouseLeave={ () => setIsHovered(false) }
	>
	    <img src='../../../public/congo.JPEG'
		 alt='Website Owner proudly holding the Congolese flag'
	    />
	    <div className='itemInfo'>
		<div className='icons'>
		    <PlayArrowIcon/>
		    <AddIcon/>
		    <ThumbUpOutlinedIcon/>
		    <ThumbDownOutlinedIcon/>
		</div>
		<div className='properties'>
		    <span>Duration</span>
		    <span>Location</span>
		    <span>Date</span>
		</div>
		<div className='description'>
		    Culture Week games in USIU-Africa on 14th February 2025, representing Congo DRC and have the chance to play in the finals.
		</div>
		<div className='type'>
		    Game
		</div>
	    </div>
	</div>
    );
}

export default ListItem;
