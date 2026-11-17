import './playlists.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState, useContext, useEffect } from 'react';
import { PlaylistContext } from '../../contexts/playlistContext/PlaylistContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    getPlaylistsStart,
    getPlaylistsSuccess,
    deletePlaylistStart,
    deletePlaylistSuccess,
    deletePlaylistFailure,
} from '../../contexts/playlistContext/PlaylistActions';
import Navbar from '../../components/Navbar';
import contentService from '../../services/contentService';

const Playlists = () => {
    const { playlists, dispatch, isFetching } = useContext(PlaylistContext);
    const { user } = useContext(UserContext);
    const [paginationModel, setPaginationModel] = useState({
	page: 0,
	pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
	let cancelled = false;
	dispatch(getPlaylistsStart());
	contentService
	    .fetchPlaylists(paginationModel.page + 1, paginationModel.pageSize)
	    .then((data) => {
		if (cancelled) return;
		dispatch(getPlaylistsSuccess(data.playlists));
		setRowCount(data.totalCount);
	    });
	return () => {
	    cancelled = true;
	};
    }, [dispatch, paginationModel]);

    const handleDelete = async (id) => {
	setError('');
	dispatch(deletePlaylistStart());
	if (await contentService.deletePlaylist(id)) {
	    dispatch(deletePlaylistSuccess(id));
	    setRowCount((count) => Math.max(0, count - 1));
	} else {
	    dispatch(deletePlaylistFailure());
	    setError('Unable to delete this playlist.');
	}
    };

    const columns = [
	{ field: 'name', headerName: 'Playlist', flex: 1, minWidth: 195 },
	{ field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },
	{ field: 'is_public', headerName: 'Public', type: 'boolean', width: 100 },
	{
	    field: 'manage',
	    headerName: 'Manage',
	    width: 100,
	    sortable: false,
	    renderCell: ({ row }) =>
            row.owner === user?.id ? (
		<button
		    type='button'
		    aria-label={`Delete ${row.name}`}
		    onClick={() => handleDelete(row.id)}
		>
		    <DeleteOutlineIcon />
		</button>
            ) : null,
	},
    ];

    return (
	<>
	    <Navbar />
	    <main
		id='main-content'
		tabIndex={-1}
		className='playlists page-container'
	    >
		<div className='section-heading'>
		    <div>
			<p className='eyebrow'>YOUR COLLECTIONS</p>
			<h1>Playlists</h1>
		    </div>
		</div>
		{error && <p role='alert'>{error}</p>}
		<Paper className='playlistTable' sx={{ height: 560, width: '100%' }}>
		    <DataGrid
			rows={playlists}
			columns={columns}
			loading={isFetching}
			disableRowSelectionOnClick
			paginationMode='server'
			paginationModel={paginationModel}
			onPaginationModelChange={setPaginationModel}
			rowCount={rowCount}
			pageSizeOptions={[10, 15]}
			sx={{ border: 0 }}
			getRowId={(row) => row._id}
		    />
		</Paper>
	    </main>
	</>
    );
};

export default Playlists;
