import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'
import { useThemeContext } from '../../context/ThemeContext'

const ThemeSelector: React.FC = () => {
  const { mode, setMode } = useThemeContext()

  console.log('[ThemeSelector] 🔄 Component rendered, current mode:', mode)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.value as 'light' | 'dark' | 'auto'
    console.log('[ThemeSelector] 🖱️ User clicked:', newTheme, 'Event:', event)
    setMode(newTheme)
  }

  const handleDirectClick = (theme: 'light' | 'dark' | 'auto') => {
    console.log('[ThemeSelector] 🎯 DIRECT CLICK:', theme)
    setMode(theme)
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Theme Settings
      </Typography>
      <FormControl component="fieldset">
        <FormLabel component="legend" sx={{ mb: 2 }}>
          Select Theme
        </FormLabel>
        <RadioGroup
          row
          value={mode}
          onChange={handleChange}
          name="theme-selector"
        >
          <FormControlLabel
            value="light"
            control={<Radio onClick={() => handleDirectClick('light')} />}
            label="☀️ Light Mode"
          />
          <FormControlLabel
            value="dark"
            control={<Radio onClick={() => handleDirectClick('dark')} />}
            label="🌙 Dark Mode"
          />
          <FormControlLabel
            value="auto"
            control={<Radio onClick={() => handleDirectClick('auto')} />}
            label="🔄 Auto"
          />
        </RadioGroup>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Auto mode follows your system preferences. Current: <strong>{mode}</strong>
        </Typography>
      </Box>

      {/* DEBUG: Test buttons */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
          🔧 DEBUG: Click these buttons to test if setMode works:
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              console.log('[ThemeSelector] 🔘 TEST BUTTON: light')
              setMode('light')
            }}
          >
            Test Light
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              console.log('[ThemeSelector] 🔘 TEST BUTTON: dark')
              setMode('dark')
            }}
          >
            Test Dark
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              console.log('[ThemeSelector] 🔘 TEST BUTTON: auto')
              setMode('auto')
            }}
          >
            Test Auto
          </Button>
        </Stack>
      </Box>
    </Paper>
  )
}

export default ThemeSelector
