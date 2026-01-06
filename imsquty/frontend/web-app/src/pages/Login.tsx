import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { login } from '../store/slices/authSlice'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)

  const validateForm = () => {
    let isValid = true
    setEmailError('')
    setPasswordError('')

    if (!email) {
      setEmailError('Email is required')
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format')
      isValid = false
    }

    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await dispatch(login({ email, password })).unwrap()
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <Box
      sx={{
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
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            padding: { xs: '32px 24px', sm: '48px 40px' },
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo/Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                IQ
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                mb: 1,
              }}
            >
              IMSQuty
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
              }}
            >
              Asset & Ticket Management System
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '8px',
                backgroundColor: '#fee',
                borderLeft: '4px solid #f44',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 1,
                  display: 'block',
                }}
              >
                Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                error={!!emailError}
                helperText={emailError}
                disabled={loading}
                autoComplete="email"
                sx={{
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
                  '& .MuiOutlinedInput-input': {
                    color: '#1a1a1a',
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 1,
                  display: 'block',
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={!!passwordError}
                helperText={passwordError}
                disabled={loading}
                autoComplete="current-password"
                sx={{
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
                  '& .MuiOutlinedInput-input': {
                    color: '#1a1a1a',
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                }}
              />
            </Box>

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
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
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'inherit' }} />
                  <span>Signing in...</span>
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          {/* Demo Credentials */}
          <Box
            sx={{
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '13px',
              }}
            >
              Demo Credentials
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#1a1a1a',
                fontWeight: 500,
                fontSize: '14px',
                mt: 0.5,
              }}
            >
              Email: admin@example.com
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#1a1a1a',
                fontWeight: 500,
                fontSize: '14px',
              }}
            >
              Password: password
            </Typography>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              color: '#999',
              display: 'block',
              textAlign: 'center',
              mt: 3,
              fontSize: '12px',
            }}
          >
            © 2025 IMSQuty. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Login
