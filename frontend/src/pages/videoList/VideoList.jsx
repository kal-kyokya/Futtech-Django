import './videoList.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { rows } from '../../dummyData';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { VideoContext } from '../../contexts/videoContext/VideoContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    getVideosStart, getVideosSuccess, getVideosFailure,
    deleteVideoStart, deleteVideoSuccess, deleteVideoFailure,
} from '../../contexts/videoContext/VideoActions';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const VideoList = () => {
    const { videos, dispatch } = useContext(VideoContext);
    const { user } = useContext(UserContext);
    const [data, setData] = useState(videos);
    const navigate = useNavigate();

    useEffect(() => {
	setData(videos);
    }, [videos]);

    useEffect(() => {
	const getVideos = async () => {
	    dispatch(getVideosStart());

	    try {
		const res = await axios.get('/videos/all', {
		    headers: {
			'auth-token': user.accessToken,
		    }
		});

		dispatch(getVideosSuccess(res.data));
	    } catch (err) {
		console.log(err);
		dispatch(getVideosFailure());
	    }
	};

	getVideos();
    }, []);

    const handleDelete = async (id, owner) => {
	dispatch(deleteVideoStart());
	console.log(user);

	try {
	    await axios.delete(`/videos/${id}`,
			       {
				   headers: {
				       'auth-token': user.accessToken,
				       owner
				   }
			       });

	    dispatch(deleteVideoSuccess(id));
	    setData(videos.filter((video) => video._id !== i));
	    navigate('/videoList');
	} catch (err) {
	    console.error(err);
	}

	dispatch(deleteVideoFailure());
    };

    const columns = [
	{ field: '_id', headerName: 'ID', width: 221 },
	{ field: 'video', headerName: 'Video', width: 205, renderCell: (params) => {
	    return (
		<div className='videoListCell'>
		    <Link to='/watch'
			  state={ { video: params.row } }
			  className='link'
			  style={{ 'display': 'flex' }}
		    >
			<img className='profile'
			     src={ params.row.thumbnail }
			     alt='Video Thumbnail'
			/>
			<span> { params.row.title } </span>
		    </Link>
		</div>
	    );}
	},
	{ field: 'category', headerName: 'Category', width: 91 },
	{ field: 'location', headerName: 'Location', width: 130 },
	{ field: 'date', headerName: 'Created', width: 110 },
	{
	    field: 'desc', headerName: 'Description', width: 375, sortable: false,
	    description: 'This column has a lot of data and is not sortable.'
	},
	{
	    field: 'manage', headerName: 'Manage', width: 111, renderCell: (params) => {
		return (
		    <div className='manageVideo'>
			<Link to={ '/video/' + params.row._id }
			      state={ { input: params.row } }
			      className='link'>
			    <button className='manageVideoButton'>Edit</button>
			</Link>
			<DeleteOutlineIcon className='deleteIcon'
					   onClick={ () => handleDelete(params.row._id, params.row.owner) }/>
		    </div>
		);
	    }
	},
    ];

    const paginationModel = { page: 0, pageSize: 10 };


    return (
	<>
	    <Navbar />

	    <div className='videoList'>
		<Paper sx={{ height: '100%', width: '100%' }}>
		    <DataGrid
			rows={ data }
			columns={ columns }
			disableRowSelectionOnClick
			checkboxSelection		    
			initialState={{ pagination: { paginationModel } }}
			pageSizeOptions={[10, 15]}
			sx={{ border: 5 }}
			getRowId={(r) => r._id}
		    />
		</Paper>
	    </div>
	</>
    );
};

export default VideoList;
