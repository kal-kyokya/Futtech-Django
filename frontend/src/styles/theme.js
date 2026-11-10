import { createTheme } from '@mui/material/styles';

export default createTheme({
    palette: { mode: 'dark' },
    typography: { fontFamily: 'inherit' },
    components: {
	MuiPaper: {
	    styleOverrides: {
		root: {
		    background: 'var(--color-surface)',
		    color: 'var(--color-text)',
		    backgroundImage: 'none',
		    borderRadius: 'var(--radius)',
		},
	    },
	},
	MuiDataGrid: {
	    styleOverrides: {
		root: {
		    borderColor: 'var(--color-border)',
		    color: 'var(--color-text)',
		},
		columnHeaders: { background: 'var(--color-elevated)' },
		cell: { borderColor: 'var(--color-border)' },
		footerContainer: { borderColor: 'var(--color-border)' },
	    },
	},
    },
});
