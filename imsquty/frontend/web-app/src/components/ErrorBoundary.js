import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';
/**
 * ErrorBoundary Component
 * Catches React component errors and displays graceful error UI
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "handleReset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({ hasError: false, error: null, errorInfo: null });
            }
        });
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error, errorInfo: null };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
        // Send to error tracking service
        // trackError(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx(Box, { sx: { p: 4, textAlign: 'center' }, children: _jsxs(Paper, { sx: { p: 3, bgcolor: '#ffebee', borderRadius: 2 }, children: [_jsx(ErrorOutlineIcon, { sx: { fontSize: 64, color: 'error.main', mb: 2 } }), _jsx(Typography, { variant: "h5", sx: { mb: 1, fontWeight: 600 }, children: "Oops! Something went wrong" }), _jsx(Typography, { variant: "body2", color: "textSecondary", sx: { mb: 3 }, children: process.env.NODE_ENV === 'development'
                                ? this.state.error?.message
                                : 'Please refresh the page or contact support' }), process.env.NODE_ENV === 'development' && (_jsx(Typography, { variant: "caption", component: "pre", sx: {
                                p: 2,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: '200px',
                                textAlign: 'left'
                            }, children: this.state.errorInfo?.componentStack })), _jsxs(Box, { sx: { mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }, children: [_jsx(Button, { variant: "contained", color: "primary", onClick: this.handleReset, children: "Try Again" }), _jsx(Button, { variant: "outlined", onClick: () => window.location.href = '/', children: "Go Home" })] })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
