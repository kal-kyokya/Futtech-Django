import './lists.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { rows } from '../../dummyData';
import { Link } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { ListContext } from '../../contexts/listContext/ListContext';
import { UserContext } from '../../contexts/userContext/UserContext';
import {
    getListsStart, getListsSuccess, getListsFailure
} from '../../contexts/listContext/ListActions';
import Navbar from '../../components/Navbar';

const Lists = () => {
    const { lists, dispatch } = useContext(ListContext);
    const { user } = useContext(UserContext);

    const handleDelete = async (id) => {
	dispatch(deleteListStart());

	try {
	    await axios.delete('/lists/' + id, {
		headers: {
		    'auth-token': user.accessToken
		}
	    });

	    dispatch(deleteListSuccess(id));
	} catch (err) {
	    console.log(err);
	    dispatch(deleteListFailure());
	}
    };

    const columns = [
	{ field: '_id', headerName: 'ID', width: 119 },
	{ field: 'list', headerName: 'List', width: 195, renderCell: (params) => {
	    return (
		<div className='listsCell'>
		    <img className='profile' src={ params.row.thumbnail }
			 alt='List Thumbnail'
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
	<>
	    <Navbar />

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
			getRowId={(row) => row._id}
		    />
		</Paper>
	    </div>
	</>
    );
};

export default Lists;
