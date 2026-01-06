import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AccountCircle, Assessment, ConfirmationNumber, Dashboard, Description, Inventory, Logout, MeetingRoom, Menu as MenuIcon, Notifications, Payment, People, Settings, ShoppingCart, } from '@mui/icons-material';
import { AppBar, Box, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };
    // Role-based menu items
    const allMenuItems = [
        { label: 'Dashboard', icon: _jsx(Dashboard, {}), path: '/', roles: ['user', 'admin', 'superadmin'] },
        { label: 'Assets', icon: _jsx(Inventory, {}), path: '/assets', roles: ['user', 'admin', 'superadmin'] },
        { label: 'Tickets', icon: _jsx(ConfirmationNumber, {}), path: '/tickets', roles: ['user', 'admin', 'superadmin'] },
        { label: 'Inventory', icon: _jsx(ShoppingCart, {}), path: '/inventory', roles: ['admin', 'superadmin'] },
        { label: 'Financial', icon: _jsx(Payment, {}), path: '/financial', roles: ['admin', 'superadmin'] },
        { label: 'Reports', icon: _jsx(Description, {}), path: '/reports', roles: ['admin', 'superadmin'] },
        { label: 'Meeting Rooms', icon: _jsx(MeetingRoom, {}), path: '/meeting-rooms', roles: ['admin', 'superadmin'] },
        { label: 'Notifications', icon: _jsx(Notifications, {}), path: '/notifications', roles: ['admin', 'superadmin'] },
        { label: 'Users', icon: _jsx(People, {}), path: '/users', roles: ['admin', 'superadmin'] },
        { label: 'Audit Logs', icon: _jsx(Assessment, {}), path: '/audit-logs', roles: ['admin', 'superadmin'] },
        { label: 'Settings', icon: _jsx(Settings, {}), path: '/settings', roles: ['admin', 'superadmin'] },
    ];
    // Filter menu items based on user role
    const userRole = user?.role || 'user';
    const menuItems = allMenuItems.filter((item) => item.roles.includes(userRole));
    return (_jsxs(Box, { sx: { display: 'flex' }, children: [_jsx(AppBar, { position: "fixed", children: _jsxs(Toolbar, { children: [_jsx(IconButton, { color: "inherit", onClick: () => setDrawerOpen(!drawerOpen), sx: { mr: 2 }, children: _jsx(MenuIcon, {}) }), _jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "IMSQuty" }), _jsxs(Typography, { sx: { mr: 2 }, children: [user?.first_name, " ", user?.last_name] }), _jsx(IconButton, { color: "inherit", onClick: handleMenuOpen, size: "small", children: _jsx(AccountCircle, {}) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuItem, { onClick: handleLogout, children: [_jsx(Logout, { sx: { mr: 1 } }), "Logout"] }) })] }) }), _jsx(Drawer, { variant: "temporary", open: drawerOpen, onClose: () => setDrawerOpen(false), sx: {
                    width: 240,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        pt: '64px',
                    },
                }, children: _jsx(List, { children: menuItems.map((item) => (_jsx(ListItem, { disablePadding: true, children: _jsxs(ListItemButton, { onClick: () => {
                                navigate(item.path);
                                setDrawerOpen(false);
                            }, children: [_jsx(ListItemIcon, { children: item.icon }), _jsx(ListItemText, { primary: item.label })] }) }, item.label))) }) }), _jsx(Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    width: '100%',
                }, children: children })] }));
};
export default DashboardLayout;
