import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import React, { useState } from 'react'
import { useThemeContext } from '../context/ThemeContext'

const ThemeToggle: React.FC = () => {
  const { mode, setMode, actualTheme } = useThemeContext()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleModeChange = (newMode: 'light' | 'dark' | 'auto') => {
    setMode(newMode)
    handleClose()
  }

  const getIcon = () => {
    if (mode === 'auto') {
      return <SettingsBrightnessIcon />
    }
    return actualTheme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />
  }

  const getTooltip = () => {
    if (mode === 'auto') return 'Theme: Auto (System)'
    return actualTheme === 'dark' ? 'Theme: Dark' : 'Theme: Light'
  }

  return (
    <>
      <Tooltip title={getTooltip()}>
        <IconButton onClick={handleClick} color="inherit">
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => handleModeChange('light')}
          selected={mode === 'light'}
        >
          <LightModeIcon sx={{ mr: 1 }} /> Light
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange('dark')}
          selected={mode === 'dark'}
        >
          <DarkModeIcon sx={{ mr: 1 }} /> Dark
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange('auto')}
          selected={mode === 'auto'}
        >
          <SettingsBrightnessIcon sx={{ mr: 1 }} /> Auto
        </MenuItem>
      </Menu>
    </>
  )
}

export default ThemeToggle
