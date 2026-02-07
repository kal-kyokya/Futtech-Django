import './playlists.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Link } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { PlaylistContext } from '../../contexts/playlistContext/PlaylistContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    getPlaylistsStart, getPlaylistsSuccess, getPlaylistsFailure
} from '../../contexts/playlistContext/PlaylistActions';
import Navbar from '../../components/Navbar';
import axios from 'axios';

const Playlists = () => {
    const { playlists, dispatch } = useContext(PlaylistContext);
    const { user } = useContext(UserContext);
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const handleDelete = async (id) => {
	dispatch(deletePlaylistStart());

	try {
	    await axios.delete(`${baseURL}/playlists/` + id, {
		headers: {
		    'auth-token': user.accessToken
		}
	    });

	    dispatch(deletePlaylistSuccess(id));
	} catch (err) {
	    console.log(err);
	    dispatch(deletePlaylistFailure());
	}
    };

    const columns = [
	{ field: '_id', headerName: 'ID', width: 119 },
	{ field: 'playlist', headerName: 'Playlist', width: 195, renderCell: (params) => {
	    return (
		<div className='playlistsCell'>
		    <img className='profile' src={ params.row.thumbnail }
			 alt='Playlist Thumbnail'
		    />
		    { params.row.title }
		</div>
	    );}
	},
	{ field: 'category', headerName: 'Category', width: 121 },
	{ field: 'subCategory', headerName: 'Sub-category', width: 140 },
	{ field: 'createdAt', headerName: 'Created', width: 105 },
	{
	    field: 'manage', headerName: 'Manage', width: 91, renderCell: (params) => {
		return (
		    <div className='managePlaylist'>
			<Link to={ '/playlists/get' + params.row._id }
			      className='link'>
			    <button className='managePlaylistButton'>Edit</button>
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

	    <div className='playlists'>
		<Paper sx={{ height: '100%', width: '100%' }}>
		    <DataGrid
			rows={ playlists }
			columns={ columns }
			disableRowSelectionOnClick
			checkboxSelection		    
			initialState={{ pagination: { paginationModel } }}
			pageSizeOptions={[10, 15]}
			sx={{ border: 0 }}
			getRowId={(row) => row._id}
		    />
		</Paper>
	    </div>
	</>
    );
};

export default Playlists;
