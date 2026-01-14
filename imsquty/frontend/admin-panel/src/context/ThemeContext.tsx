import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

const createAppTheme = (themeMode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: themeMode === 'dark' ? '#90caf9' : '#1976d2',
        light: themeMode === 'dark' ? '#bbdefb' : '#42a5f5',
        dark: themeMode === 'dark' ? '#1e88e5' : '#1565c0',
      },
      secondary: {
        main: themeMode === 'dark' ? '#f48fb1' : '#dc004e',
        light: themeMode === 'dark' ? '#f8bbd0' : '#e33371',
        dark: themeMode === 'dark' ? '#c2185b' : '#ad1457',
      },
      success: {
        main: themeMode === 'dark' ? '#66bb6a' : '#4caf50',
      },
      warning: {
        main: themeMode === 'dark' ? '#ffa726' : '#ff9800',
      },
      error: {
        main: themeMode === 'dark' ? '#ef5350' : '#f44336',
      },
      info: {
        main: themeMode === 'dark' ? '#29b6f6' : '#2196f3',
      },
      background: {
        default: themeMode === 'dark' ? '#0a1929' : '#fafafa',
        paper: themeMode === 'dark' ? '#132f4c' : '#ffffff',
      },
      text: {
        primary: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.87)',
        secondary: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
      divider: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
        fontSize: '2.125rem',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.5rem',
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: themeMode === 'dark'
              ? '#6b6b6b #2b2b2b'
              : '#959595 #f5f5f5',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: themeMode === 'dark' ? '#6b6b6b' : '#959595',
              minHeight: 24,
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: themeMode === 'dark' ? '#959595' : '#6b6b6b',
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: themeMode === 'dark' ? '#2b2b2b' : '#f5f5f5',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow:
              themeMode === 'dark'
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: themeMode === 'dark' ? '#1a2332' : '#ffffff',
            borderRight: themeMode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  })
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
}) => {
  // Initialize with system preference immediately to prevent flashing
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('admin-theme-mode') as ThemeMode | null
    if (stored && stored !== 'auto') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin-theme-mode') as ThemeMode | null
      return stored || 'auto'
    }
    return 'auto'
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(getInitialTheme)

  // Set mode with logging
  const setMode = useCallback((newMode: ThemeMode) => {
    console.log('[ADMIN-THEME] 🎨 Setting theme mode:', newMode)
    setModeState(newMode)
  }, [])

  // Detect system preference for auto mode
  useEffect(() => {
    const updateActualTheme = () => {
      try {
        let newTheme: 'light' | 'dark'

        if (mode === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          newTheme = prefersDark ? 'dark' : 'light'
          console.log('[ADMIN-THEME] 🌓 Auto mode - system prefers:', newTheme)
        } else {
          newTheme = mode
          console.log('[ADMIN-THEME] 👤 Manual mode:', newTheme)
        }

        setActualTheme(newTheme)
        console.log('[ADMIN-THEME] ✅ Applied theme:', newTheme)
      } catch (error) {
        console.error('[ADMIN-THEME] ❌ Error updating theme:', error)
        setActualTheme('light')
      }
    }

    updateActualTheme()

    if (mode === 'auto') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', updateActualTheme)
        return () => mediaQuery.removeEventListener('change', updateActualTheme)
      } catch (error) {
        console.error('[ADMIN-THEME] ❌ Error setting up media query listener:', error)
      }
    }
  }, [mode])

  // Save to localStorage whenever mode changes
  useEffect(() => {
    try {
      localStorage.setItem('admin-theme-mode', mode)
      console.log('[ADMIN-THEME] 💾 Saved preference:', mode)
    } catch (error) {
      console.error('[ADMIN-THEME] ❌ Failed to save preference:', error)
    }
  }, [mode])

  const theme = useMemo(() => {
    return createAppTheme(actualTheme)
  }, [actualTheme])

  const contextValue = useMemo(() => ({ mode, setMode, actualTheme }), [mode, setMode, actualTheme])

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
