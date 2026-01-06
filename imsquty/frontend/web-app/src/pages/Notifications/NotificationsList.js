import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, Chip, IconButton, Tooltip, } from '@mui/material';
import { Delete, Mail, MailOutline } from '@mui/icons-material';
const mockNotifications = [
    { id: 1, type: 'assignment', message: 'You have been assigned to Asset #123', date: '2024-01-06 10:30', read: false },
    { id: 2, type: 'alert', message: 'Maintenance due for equipment at Office A', date: '2024-01-06 09:15', read: true },
    { id: 3, type: 'info', message: 'New ticket #456 created', date: '2024-01-05 14:45', read: true },
    { id: 4, type: 'warning', message: 'Low inventory alert: USB Cables (150 units)', date: '2024-01-05 11:20', read: false },
    { id: 5, type: 'success', message: 'Ticket #123 has been resolved', date: '2024-01-04 16:30', read: true },
];
const typeColor = (type) => {
    switch (type) {
        case 'alert': return 'error';
        case 'warning': return 'warning';
        case 'info': return 'info';
        case 'assignment': return 'primary';
        case 'success': return 'success';
        default: return 'default';
    }
};
export default function NotificationsList() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const paginatedNotifications = notifications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const handleToggleRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
    };
    const handleDelete = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };
    const unreadCount = notifications.filter(n => !n.read).length;
    return (_jsx(Box, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsx(Box, { children: _jsxs(Typography, { variant: "h5", children: ["Notifications", unreadCount > 0 && (_jsx(Chip, { label: unreadCount, color: "error", size: "small", sx: { ml: 2 } }))] }) }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: '#f5f5f5' }, children: [_jsx(TableCell, { width: "50", children: "Read" }), _jsx(TableCell, { children: "Type" }), _jsx(TableCell, { children: "Message" }), _jsx(TableCell, { children: "Date" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: paginatedNotifications.map((notification) => (_jsxs(TableRow, { hover: true, sx: {
                                        backgroundColor: notification.read ? 'transparent' : '#f9f9f9',
                                    }, children: [_jsx(TableCell, { children: _jsx(Tooltip, { title: notification.read ? 'Mark as unread' : 'Mark as read', children: _jsx(IconButton, { size: "small", onClick: () => handleToggleRead(notification.id), children: notification.read ? (_jsx(MailOutline, { fontSize: "small" })) : (_jsx(Mail, { fontSize: "small" })) }) }) }), _jsx(TableCell, { children: _jsx(Chip, { label: notification.type, color: typeColor(notification.type), size: "small" }) }), _jsx(TableCell, { children: notification.message }), _jsx(TableCell, { children: notification.date }), _jsx(TableCell, { align: "right", children: _jsx(IconButton, { size: "small", onClick: () => handleDelete(notification.id), children: _jsx(Delete, { fontSize: "small" }) }) })] }, notification.id))) })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25, 50], component: "div", count: notifications.length, rowsPerPage: rowsPerPage, page: page, onPageChange: (e, newPage) => setPage(newPage), onRowsPerPageChange: (e) => setRowsPerPage(parseInt(e.target.value, 10)) })] }) }));
}
