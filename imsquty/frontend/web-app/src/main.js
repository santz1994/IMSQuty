import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { store } from './store';
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(Provider, { store: store, children: _jsx(BrowserRouter, { children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(App, {})] }) }) }) }));
