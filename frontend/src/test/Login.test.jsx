import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import { Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import Login from '../pages/login/Login';
import { renderWithProviders } from './utils';
import { server } from './msw/server';
import { UserContext } from '../contexts/userContext/UserContext';
import tokenService from '../services/tokenService';

