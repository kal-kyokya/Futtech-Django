import './lists.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { rows } from '../../dummyData';
import { Link } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { getLists, deleteList } from '../../contexts/listContext/apiCalls';
import { ListContext } from '../../contexts/listContext/ListContext';

const Lists = () => {
    const { lists, dispatch } = useContext(ListContext);

    useEffect((dispatch) => {
	getLists(dispatch);
    }, [lists]);

    const handleDelete = (id) => {
	deleteList(id, dispatch);
    };

    const columns = [
	{ field: '_id', headerName: 'ID', width: 119 },
	{ field: 'list', headerName: 'List', width: 195, renderCell: (params) => {
	    return (
		<div className='listsCell'>
		    <img className='profile' src={ params.row.thumbnailSmall } alt='List Thumbnail'/>
		    { params.row.title }
		</div>
	    );}
	},
	{ field: 'category', headerName: 'Category', width: 121 },
	{ field: 'isDrone', headerName: 'Drone Footage', width: 140 },
	{ field: 'date', headerName: 'Created', width: 105 },
	{
	    field: 'desc', headerName: 'Description', width: 223, sortable: false,
	    description: 'This column has a lot of data and is not sortable.'
	},
	{
	    field: 'manage', headerName: 'Manage', width: 91, renderCell: (params) => {
		return (
		    <div className='manageList'>
			<Link to={ '/lists/get' + params.row._id }
			      className='link'>
			    <button className='manageListButton'>Edit</button>
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
	<div className='lists'>
	    <Paper sx={{ height: '100%', width: '100%' }}>
		<DataGrid
		    rows={ lists }
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

export default Lists;
