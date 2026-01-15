import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Paper, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Catches React component errors and displays graceful error UI
 * 
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });

        // Send to error tracking service
        // trackError(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Paper sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 2 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                            Oops! Something went wrong
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            {import.meta.env.DEV
                                ? this.state.error?.message
                                : 'Please refresh the page or contact support'}
                        </Typography>
                        {import.meta.env.DEV && (
                            <Typography
                                variant="caption"
                                component="pre"
                                sx={{
                                    p: 2,
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 1,
                                    overflow: 'auto',
                                    maxHeight: '200px',
                                    textAlign: 'left'
                                }}
                            >
                                {this.state.errorInfo?.componentStack}
                            </Typography>
                        )}
                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleReset}
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => window.location.href = '/'}
                            >
                                Go Home
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
