import {
  AccountCircle,
  Assessment,
  Dashboard,
  Lock,
  MeetingRoom,
  Menu as MenuIcon,
  People,
  Security,
  Settings,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import ThemeToggle from '../ThemeToggle'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  // Debug user role
  useEffect(() => {
    console.log('[AdminLayout] 👤 User:', user)
    console.log('[AdminLayout] 🔑 Roles array:', user?.roles)
    console.log('[AdminLayout] 🏢 Email:', user?.email)
  }, [user])

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Role-based navigation items - Admin panel is ONLY for superadmin and developer
  const allNavigationItems = [
    { label: 'Dashboard', path: '/admin', icon: Dashboard, roles: ['superadmin', 'developer'] },
    { label: 'Users', path: '/admin/users', icon: People, roles: ['superadmin', 'developer'] },
    { label: 'Meeting Rooms', path: '/admin/meeting-rooms', icon: MeetingRoom, roles: ['superadmin', 'developer'] },
    { label: 'System Settings', path: '/admin/settings', icon: Settings, roles: ['superadmin', 'developer'] },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: Assessment, roles: ['superadmin', 'developer'] },
    { label: 'Roles & Permissions', path: '/admin/roles', icon: Security, roles: ['superadmin', 'developer'] },
    { label: 'Page Permissions', path: '/admin/page-permissions', icon: Lock, roles: ['superadmin', 'developer'] },
  ]

  // Extract user role - can be from role string or roles array
  const userRole = user?.role || user?.roles?.[0]?.name || 'user'
  let navigationItems = allNavigationItems.filter((item) =>
    item.roles.includes(userRole)
  )

  // Fallback: if user is admin or higher, show all items
  if (navigationItems.length === 0 && (userRole === 'superadmin' || userRole === 'developer')) {
    console.warn('[AdminLayout] ⚠️ Empty navigation items for role:', userRole, ' - Showing all items')
    navigationItems = allNavigationItems
  }

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Toolbar>
        <Typography variant="h6">IMSQuty Admin</Typography>
      </Toolbar>
      <List>
        {navigationItems.length > 0 ? (
          navigationItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  setDrawerOpen(false)
                }}
              >
                <ListItemIcon>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary="No items available"
              secondary={`Role: ${userRole}`}
              primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            IMSQuty - Admin Panel
          </Typography>
          {user && (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.first_name} {user.last_name}
              </Typography>
              <ThemeToggle />
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <AccountCircle />
              </IconButton>
            </>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Collapsible drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: 250,
          '& .MuiDrawer-paper': {
            width: 250,
            pt: '64px',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          pt: 8,
          backgroundColor: (theme) => theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  )
}

export default AdminLayout
