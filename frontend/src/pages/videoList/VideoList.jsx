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
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const handleDelete = async (id, owner) => {
	dispatch(deleteVideoStart());

	try {
	    await axios.delete(`${baseURL}/videos/${id}`,
			       {
				   headers: {
				       'auth-token': user.accessToken,
				       owner
				   }
			       }).then(dispatch(deleteVideoSuccess(id)));
	} catch (err) {
	    console.error(err);
	    dispatch(deleteVideoFailure());
	}
    };

    const columns = [
	{ field: '_id', headerName: 'ID', width: 251 },
	{ field: 'video', headerName: 'Video', width: 505, renderCell: (params) => {
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
	{ field: 'category', headerName: 'Category', width: 101 },
	{ field: 'location', headerName: 'Location', width: 140 },
	{ field: 'date', headerName: 'Recorded', width: 120 },
	{
	    field: 'manage', headerName: 'Manage', width: 131, renderCell: (params) => {
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
			rows={ videos }
			columns={ columns }
			disableRowSelectionOnClick
			checkboxSelection		    
			initialState={{ pagination: { paginationModel } }}
			pageSizeOptions={[10, 15]}
			sx={{ border: 5 }}
			getRowId={(row) => row._id}
		    />
		</Paper>
	    </div>
	</>
    );
};

export default VideoList;
