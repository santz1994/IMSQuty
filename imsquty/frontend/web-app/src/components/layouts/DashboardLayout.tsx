import {
  AccountCircle,
  Assessment,
  Assignment,
  ConfirmationNumber,
  Dashboard,
  Description,
  Inventory,
  Logout,
  MeetingRoom,
  Menu as MenuIcon,
  Notifications,
  Payment,
  Settings,
  ShoppingCart,
  Timer,
  TrendingUp
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
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import ThemeToggleButton from '../common/ThemeToggleButton'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

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

  // Role-based menu items - All roles should see their permitted pages
  const allMenuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['user', 'admin', 'receptionist', 'hr', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Assets', icon: <Inventory />, path: '/assets', roles: ['user', 'admin', 'receptionist', 'hr', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Tickets', icon: <ConfirmationNumber />, path: '/tickets', roles: ['user', 'admin', 'receptionist', 'hr', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'SLA Dashboard', icon: <Timer />, path: '/tickets/sla/dashboard', roles: ['admin', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Daily Activities', icon: <Assignment />, path: '/daily-activities', roles: ['admin', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Inventory', icon: <ShoppingCart />, path: '/inventory', roles: ['admin', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Financial', icon: <Payment />, path: '/financial', roles: ['admin', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Reports', icon: <Description />, path: '/reports', roles: ['admin', 'hr', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Meeting Room Bookings', icon: <MeetingRoom />, path: '/meeting-room-bookings', roles: ['user', 'admin', 'receptionist', 'hr', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Booking Approvals', icon: <MeetingRoom />, path: '/meeting-room-bookings/approvals', roles: ['admin', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Receptionist View', icon: <MeetingRoom />, path: '/meeting-room-bookings/receptionist', roles: ['receptionist', 'admin', 'superadmin', 'developer'] },
    { label: 'KPI Dashboard', icon: <TrendingUp />, path: '/kpi', roles: ['manager', 'director', 'superadmin', 'developer'] },
    { label: 'Notifications', icon: <Notifications />, path: '/notifications', roles: ['user', 'admin', 'receptionist', 'hr', 'manager', 'director', 'superadmin', 'developer'] },
    { label: 'Audit Logs', icon: <Assessment />, path: '/audit-logs', roles: ['admin', 'superadmin', 'developer'] },
    { label: 'Settings', icon: <Settings />, path: '/settings', roles: ['user', 'admin', 'receptionist', 'hr', 'manager', 'director', 'superadmin', 'developer'] },
  ]

  // Filter menu items based on user role
  const userRole = user?.role || 'user'
  const menuItems = allMenuItems.filter((item) => item.roles.includes(userRole))

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            IMSQuty
          </Typography>
          <Typography sx={{ mr: 2 }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <ThemeToggleButton />
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            size="small"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          '& .MuiDrawer-paper': {
            width: 240,
            pt: '64px',
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  setDrawerOpen(false)
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default DashboardLayout
