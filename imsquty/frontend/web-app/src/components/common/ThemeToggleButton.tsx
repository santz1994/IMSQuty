import { Brightness4, Brightness7, BrightnessAuto } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import React from 'react'
import { useThemeContext } from '../../context/ThemeContext'

/**
 * ThemeToggleButton - Compact theme toggle for navbar
 * Cycles through: Light → Dark → Auto
 */
const ThemeToggleButton: React.FC = () => {
  const { mode, setMode, actualTheme } = useThemeContext()

  const handleToggle = () => {
    // Cycle through modes: light → dark → auto → light
    const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
    console.log('[ThemeToggle] 🎨 Cycling theme:', mode, '→', nextMode)
    setMode(nextMode)
  }

  const getIcon = () => {
    if (mode === 'auto') {
      return <BrightnessAuto />
    }
    return actualTheme === 'dark' ? <Brightness4 /> : <Brightness7 />
  }

  const getTooltip = () => {
    if (mode === 'auto') {
      return `Auto Mode (System: ${actualTheme})`
    }
    return `${mode === 'light' ? 'Light' : 'Dark'} Mode`
  }

  return (
    <Tooltip title={getTooltip()}>
      <IconButton
        color="inherit"
        onClick={handleToggle}
        sx={{ ml: 1 }}
        size="small"
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  )
}

export default ThemeToggleButton
