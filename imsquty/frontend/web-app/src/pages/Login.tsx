import {
  ArrowForward,
  CheckCircle,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { login } from '../store/slices/authSlice'

const Login: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)

  const validateForm = () => {
    let isValid = true
    setUsernameError('')
    setPasswordError('')

    if (!username) {
      setUsernameError('Username or email is required')
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
      await dispatch(login({ username, password })).unwrap()
      setLoginSuccess(true)

      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const demoCredentials = [
    { role: 'Admin', email: 'admin@quty.co.id' },
    { role: 'Manager', email: 'manager@quty.co.id' },
    { role: 'User', email: 'user@quty.co.id' },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1e3a8a 0%, #7c2d91 100%)'
          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease-in-out',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-200px',
          left: '-200px',
          animation: 'float 20s infinite ease-in-out',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          bottom: '-150px',
          right: '-150px',
          animation: 'float 25s infinite ease-in-out reverse',
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0px); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes checkmark {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .fade-in { animation: slideIn 0.6s ease-out; }
        .checkmark-animation { animation: checkmark 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      `}</style>

      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Branding (hidden on mobile) */}
          {!isMobile && (
            <Grid item xs={12} sm={6} className="fade-in">
              <Box sx={{
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.95)' : 'white',
                textAlign: 'center',
                transition: 'color 0.3s ease-in-out'
              }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  IMSQuty
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 300,
                  }}
                >
                  Inventory Management & Support Quality System
                </Typography>

                {/* Features list */}
                <Box sx={{ mt: 6, textAlign: 'left' }}>
                  {[
                    'Real-time Asset Tracking',
                    'Intelligent Ticket Management',
                    'Advanced Analytics & Reporting',
                  ].map((feature, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        opacity: 0.95,
                      }}
                    >
                      <CheckCircle
                        sx={{
                          mr: 2,
                          fontSize: 24,
                          color: theme.palette.success.light,
                        }}
                      />
                      <Typography variant="body1">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Right side - Login form */}
          <Grid item xs={12} sm={6} className="fade-in">
            <Card
              elevation={24}
              sx={{
                p: { xs: 3, sm: 4 },
                backdropFilter: 'blur(10px)',
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(18, 18, 18, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                borderRadius: 3,
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {/* Success state */}
              {loginSuccess && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  <CheckCircle
                    className="checkmark-animation"
                    sx={{
                      fontSize: 80,
                      color: theme.palette.success.main,
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.success.main,
                      fontWeight: 600,
                    }}
                  >
                    Login Successful!
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                    Redirecting to dashboard...
                  </Typography>
                </Box>
              )}

              {/* Login form */}
              {!loginSuccess && (
                <>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 3,
                    }}
                  >
                    Sign in to your account to continue
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Username/Email field */}
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Username or Email"
                        type="text"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        error={!!usernameError}
                        helperText={usernameError}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email
                                sx={{
                                  color: theme.palette.primary.main,
                                  mr: 1,
                                }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${theme.palette.primary.light}40`,
                            },
                          },
                        }}
                      />
                    </Box>

                    {/* Password field */}
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        error={!!passwordError}
                        helperText={passwordError}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock
                                sx={{
                                  color: theme.palette.primary.main,
                                  mr: 1,
                                }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                                disabled={loading}
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${theme.palette.primary.light}40`,
                            },
                          },
                        }}
                      />
                    </Box>

                    {/* Remember me */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 3,
                        fontSize: '0.875rem',
                      }}
                    >
                      <Typography
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ marginRight: 8 }}
                          disabled={loading}
                        />
                        Remember me
                      </Typography>
                      <Typography
                        component="a"
                        href="#"
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Forgot password?
                      </Typography>
                    </Box>

                    {/* Login button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        borderRadius: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: `0 6px 20px ${theme.palette.primary.main}60`,
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: 'gray',
                        },
                      }}
                      endIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <ArrowForward />
                        )
                      }
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>

                  {/* Divider */}
                  <Divider sx={{ my: 2 }} />

                  {/* Demo credentials */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'gray',
                      mb: 1.5,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Demo Credentials
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {demoCredentials.map((cred, idx) => (
                      <Paper
                        key={idx}
                        sx={{
                          p: 1.5,
                          backgroundColor: theme.palette.action.hover,
                          borderRadius: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: theme.palette.action.selected,
                            transform: 'translateX(4px)',
                          },
                        }}
                        onClick={() => setUsername(cred.email)}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          }}
                        >
                          {cred.role}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'gray' }}>
                          {cred.email}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>

                  {/* Footer */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      mt: 3,
                      color: 'gray',
                    }}
                  >
                    All demo passwords are: <strong>password</strong>
                  </Typography>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Login
