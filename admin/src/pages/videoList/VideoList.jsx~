import './userList.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { rows } from '../../dummyData';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const UserList = () => {
    const [userData, setUserData] = useState(rows);

    const handleDelete = (id) => {
	setUserData(userData.filter((user) => user.id !== id));
    };

    const columns = [
	{ field: 'id', headerName: 'ID', width: 91 },
	{ field: 'username', headerName: 'Username', width: 143, renderCell: (params) => {
	    return (
		<div className='userListCell'>
		    <img className='profile' src={ params.row.picture } alt='Profile Pic'/>
		    { params.row.username }
		</div>
	    );}
	},
	{ field: 'firstName', headerName: 'First name', width: 130 },
	{ field: 'lastName', headerName: 'Last name', width: 130 },
	{
	    field: 'age', headerName: 'Age', width: 90,
	    type: 'number',
	},
	{
	    field: 'fullName', headerName: 'Full name', width: 182, sortable: false,
	    description: 'This column has a value getter and is not sortable.',
	    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
	},
	{
	    field: 'manage', headerName: 'Manage', width: 91, renderCell: (params) => {
		return (
		    <div className='manageUser'>
			<Link to={ '/user/' + params.row.id }
			      className='link'>
			    <button className='manageUserButton'>Edit</button>
			</Link>
			<DeleteOutlineIcon className='deleteIcon'
					   onClick={ () => handleDelete(params.row.id) }/>
		    </div>
		);
	    }
	},
    ];

    const paginationModel = { page: 0, pageSize: 10 };


    return (
	<div className='userList'>
	    <Paper sx={{ height: '100%', width: '100%' }}>
		<DataGrid
		    rows={ userData }
		    columns={ columns }
		    disableRowSelectionOnClick
		    checkboxSelection		    
		    initialState={{ pagination: { paginationModel } }}
		    pageSizeOptions={[10, 15]}
		    sx={{ border: 0 }}
		/>
	    </Paper>
	</div>
    );
};

export default UserList;
