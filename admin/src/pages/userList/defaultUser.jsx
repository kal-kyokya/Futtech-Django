import './userList.scss';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

const columns = [
  { field: 'id', headerName: 'ID', width: 91 },
  { field: 'firstName', headerName: 'First name', width: 130 },
  { field: 'lastName', headerName: 'Last name', width: 130 },
  {
    field: 'age', headerName: 'Age', width: 90,
    type: 'number',
  },
  {
    field: 'fullName', headerName: 'Full name', width: 160, sortable: false,
    description: 'This column has a value getter and is not sortable.',
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const paginationModel = { page: 0, pageSize: 5 };

const UserList = () => {
    return (
	<div className='userList'>
	    <Paper sx={{ height: 400, width: '100%' }}>
		<DataGrid
		    rows={rows}
		    columns={columns}
		    initialState={{ pagination: { paginationModel } }}
		    pageSizeOptions={[5, 10]}
		    checkboxSelection
		    sx={{ border: 0 }}
		/>
	    </Paper>
	</div>
    );
};

export default UserList;
