import './videoList.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { rows } from '../../dummyData';
import { Link } from 'react-router-dom';
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

    const handleDelete = async (id) => {
	dispatch(deleteVideoStart());

	try {
	    await axios.delete('/videos/' + id, {
		headers: {
		    'auth-token': user.accessToken,
		}
	    });

	    dispatch(deleteVideoSuccess(id));
	} catch (err) {
	    console.log(err);
	}

	dispatch(deleteVideoFailure());
    };

    const columns = [
	{ field: '_id', headerName: 'ID', width: 221 },
	{ field: 'video', headerName: 'Video', width: 205, renderCell: (params) => {
	    return (
		<div className='videoListCell'>
		    <img className='profile' src={ params.row.thumbnailSmall } alt='Video Thumbnail'/>
		    { params.row.title }
		</div>
	    );}
	},
	{ field: 'category', headerName: 'Category', width: 91 },
	{ field: 'isDrone', headerName: 'Drone Footage', width: 130 },
	{ field: 'date', headerName: 'Created', width: 110 },
	{
	    field: 'desc', headerName: 'Description', width: 375, sortable: false,
	    description: 'This column has a lot of data and is not sortable.'
	},
	{
	    field: 'manage', headerName: 'Manage', width: 111, renderCell: (params) => {
		return (
		    <div className='manageVideo'>
			<Link to={ '/videos/get/' + params.row._id }
			      state={ { video: params.row } }
			      className='link'>
			    <button className='manageVideoButton'>Edit</button>
			</Link>
			<DeleteOutlineIcon className='deleteIcon'
					   onClick={ () => handleDelete(params.row._id) }/>
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
			rows={ videos }
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
