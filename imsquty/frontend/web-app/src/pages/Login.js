import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Box, Button, CircularProgress, Container, TextField, Typography, } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/slices/authSlice';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);
    const validateForm = () => {
        let isValid = true;
        setEmailError('');
        setPasswordError('');
        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Invalid email format');
            isValid = false;
        }
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        }
        else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        try {
            await dispatch(login({ email, password })).unwrap();
            navigate('/');
        }
        catch (err) {
            console.error('Login failed:', err);
        }
    };
    return (_jsx(Box, { sx: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                width: '400px',
                height: '400px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                top: '-100px',
                right: '-100px',
            },
            '&::after': {
                content: '""',
                position: 'absolute',
                width: '300px',
                height: '300px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                bottom: '-50px',
                left: '-50px',
            },
        }, children: _jsx(Container, { maxWidth: "sm", children: _jsxs(Box, { sx: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    padding: { xs: '32px 24px', sm: '48px 40px' },
                    position: 'relative',
                    zIndex: 1,
                }, children: [_jsxs(Box, { sx: { textAlign: 'center', mb: 4 }, children: [_jsx(Box, { sx: {
                                    width: '60px',
                                    height: '60px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                }, children: _jsx(Typography, { variant: "h5", sx: {
                                        color: 'white',
                                        fontWeight: 'bold',
                                    }, children: "IQ" }) }), _jsx(Typography, { variant: "h4", sx: {
                                    fontWeight: 700,
                                    color: '#1a1a1a',
                                    mb: 1,
                                }, children: "IMSQuty" }), _jsx(Typography, { variant: "body2", sx: {
                                    color: '#666',
                                }, children: "Asset & Ticket Management System" })] }), error && (_jsx(Alert, { severity: "error", sx: {
                            mb: 3,
                            borderRadius: '8px',
                            backgroundColor: '#fee',
                            borderLeft: '4px solid #f44',
                        }, children: error })), _jsxs(Box, { component: "form", onSubmit: handleSubmit, children: [_jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "body2", sx: {
                                            fontWeight: 600,
                                            color: '#1a1a1a',
                                            mb: 1,
                                            display: 'block',
                                        }, children: "Email Address" }), _jsx(TextField, { fullWidth: true, type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "admin@example.com", error: !!emailError, helperText: emailError, disabled: loading, autoComplete: "email", sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                '&:hover fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                            },
                                            '& .MuiOutlinedInput-input::placeholder': {
                                                color: '#999',
                                                opacity: 1,
                                            },
                                        } })] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Typography, { variant: "body2", sx: {
                                            fontWeight: 600,
                                            color: '#1a1a1a',
                                            mb: 1,
                                            display: 'block',
                                        }, children: "Password" }), _jsx(TextField, { fullWidth: true, type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", error: !!passwordError, helperText: passwordError, disabled: loading, autoComplete: "current-password", sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                '&:hover fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                            },
                                            '& .MuiOutlinedInput-input::placeholder': {
                                                color: '#999',
                                                opacity: 1,
                                            },
                                        } })] }), _jsx(Button, { fullWidth: true, variant: "contained", type: "submit", disabled: loading, sx: {
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    mb: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:disabled': {
                                        background: '#ccc',
                                        color: '#999',
                                    },
                                }, children: loading ? (_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(CircularProgress, { size: 20, sx: { color: 'inherit' } }), _jsx("span", { children: "Signing in..." })] })) : ('Sign In') })] }), _jsxs(Box, { sx: {
                            background: '#f5f5f5',
                            padding: '16px',
                            borderRadius: '8px',
                            textAlign: 'center',
                        }, children: [_jsx(Typography, { variant: "caption", sx: {
                                    color: '#666',
                                    fontSize: '13px',
                                }, children: "Demo Credentials" }), _jsx(Typography, { variant: "body2", sx: {
                                    color: '#1a1a1a',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    mt: 0.5,
                                }, children: "Email: admin@example.com" }), _jsx(Typography, { variant: "body2", sx: {
                                    color: '#1a1a1a',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                }, children: "Password: password" })] }), _jsx(Typography, { variant: "caption", sx: {
                            color: '#999',
                            display: 'block',
                            textAlign: 'center',
                            mt: 3,
                            fontSize: '12px',
                        }, children: "\u00A9 2025 IMSQuty. All rights reserved." })] }) }) }));
};
export default Login;
