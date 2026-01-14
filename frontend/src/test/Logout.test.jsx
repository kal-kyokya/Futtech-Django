import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';
import Navbar from '../components/Navbar';
import { renderWithProviders, seedAuthState } from './utils';
import { server } from './msw/server';
import tokenService from '../services/tokenService';

// Routes to verify navigation to /login after logout.
const TestRoutes = () => (
    <Routes>
	<Route path='/profile' element={<Navbar />} />
	<Route path='/login' element={<Login />} />
    </Routes>
);
