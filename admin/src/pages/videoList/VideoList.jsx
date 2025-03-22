import './videoList.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { rows } from '../../dummyData';
import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { getVideos, deleteVideo } from '../../contexts/videoContext/apiCalls';
import { VideoContext } from '../../contexts/';

const VideoList = () => {
    const { videos, dispatch } = useContext(VideoContext);

    useEffect((dispatch) => {
	getVideos(dispatch);
    }, [videos]);

    const handleDelete = (id) => {
	deleteVideo(id, dispatch);
    };

    const columns = [
	{ field: '_id', headerName: 'ID', width: 91 },
	{ field: 'video', headerName: 'Video', width: 143, renderCell: (params) => {
	    return (
		<div className='videoListCell'>
		    <img className='profile' src={ params.row.thumbnailSmall } alt='Video Thumbnail'/>
		    { params.row.title }
		</div>
	    );}
	},
	{ field: 'category', headerName: 'Category', width: 130 },
	{ field: 'isDrone', headerName: 'Drone Footage', width: 130 },
	{ field: 'date', headerName: 'Created', width: 90 },
	{
	    field: 'desc', headerName: 'Description', width: 182, sortable: false,
	    description: 'This column has a lot of data and is not sortable.'
	},
	{
	    field: 'manage', headerName: 'Manage', width: 91, renderCell: (params) => {
		return (
		    <div className='manageVideo'>
			<Link to={ '/videos/get' + params.row._id }
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
	<div className='videoList'>
	    <Paper sx={{ height: '100%', width: '100%' }}>
		<DataGrid
		    rows={ videos }
		    columns={ columns }
		    disableRowSelectionOnClick
		    checkboxSelection		    
		    initialState={{ pagination: { paginationModel } }}
		    pageSizeOptions={[10, 15]}
		    sx={{ border: 0 }}
		    getRowId={(r) => r._id}
		/>
	    </Paper>
	</div>
    );
};

export default VideoList;
