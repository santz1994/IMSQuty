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
        default: themeMode === 'dark' ? '#121212' : '#fafafa',
        paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: themeMode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
        secondary: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
        fontSize: '2.125rem',
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
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
    },
  })
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme-mode') as ThemeMode | null
      return stored || 'auto'
    }
    return 'auto'
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Set mode with logging - NO dependency on mode to avoid stale closure
  const setMode = useCallback((newMode: ThemeMode) => {
    console.log('[THEME] 🎨 Setting theme mode:', newMode)
    setModeState(newMode)
  }, [])  // Empty dependency array - this is intentional!

  // Detect system preference for auto mode
  useEffect(() => {
    const updateActualTheme = () => {
      let newTheme: 'light' | 'dark'

      if (mode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        newTheme = prefersDark ? 'dark' : 'light'
        console.log('[THEME] 🌓 Auto mode - system prefers:', newTheme)
      } else {
        newTheme = mode
        console.log('[THEME] 👤 Manual mode:', newTheme)
      }

      setActualTheme(newTheme)
      console.log('[THEME] ✅ Applied theme:', newTheme)
    }

    updateActualTheme()

    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateActualTheme)
      return () => mediaQuery.removeEventListener('change', updateActualTheme)
    }
  }, [mode])

  // Save to localStorage whenever mode changes
  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
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
