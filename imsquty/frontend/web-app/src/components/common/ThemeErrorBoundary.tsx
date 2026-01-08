import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ThemeErrorBoundary - Catches errors related to theme switching
 * Prevents entire app crash when theme-related issues occur
 */
class ThemeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('[ThemeErrorBoundary] ❌ Theme error caught:', error)
    console.error('[ThemeErrorBoundary] Error info:', errorInfo)

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    // Reset theme to default light mode
    try {
      localStorage.setItem('theme-mode', 'light')
      window.location.reload()
    } catch (e) {
      console.error('[ThemeErrorBoundary] Failed to reset:', e)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="error" gutterBottom>
                ⚠️ Theme Error
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                An error occurred while switching themes. This is usually a temporary issue.
              </Typography>
            </Box>

            {this.state.error && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left' }}>
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              size="large"
            >
              Reset Theme & Reload
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                This will reset your theme preference to Light mode
              </Typography>
            </Box>
          </Paper>
        </Container>
      )
    }

    return this.props.children
  }
}

export default ThemeErrorBoundary
