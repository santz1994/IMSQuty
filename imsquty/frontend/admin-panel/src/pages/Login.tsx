import { Login as LoginIcon } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { canAccessAdminPanel } from '../hooks/useAdminAccess'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { login } from '../store/slices/authSlice'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessError, setAccessError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccessError(null)

    const result = await dispatch(login({ email, password }))

    if (result.type === login.fulfilled.type) {
      const user = (result.payload as any)?.user

      // Check if user has admin panel access
      if (!canAccessAdminPanel(user)) {
        const userName = user?.name || user?.username || email
        setAccessError(
          `Access Denied: ${userName}, only Developers and Superadmins can access the Admin Panel.`
        )
        // Don't navigate, show error
        return
      }

      // Success - navigate to admin
      navigate('/admin')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Typography variant="h4" align="center" sx={{ mb: 3 }}>
            IMSQuty Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            🔒 Restricted Access: Developers & Superadmins Only
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {accessError && <Alert severity="error" sx={{ mb: 2 }}>{accessError}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              placeholder="daniel@quty.co.id"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              startIcon={<LoginIcon />}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
