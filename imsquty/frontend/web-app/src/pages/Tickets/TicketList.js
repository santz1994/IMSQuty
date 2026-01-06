import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const mockTickets = [
    { id: 1, ticket_number: 'TKT001', title: 'Login Issue', description: 'User cannot login', priority: 'high', status: 'open', created_by: 'admin', assigned_to: 'user1', created_date: '2024-01-10', due_date: '2024-01-12' },
    { id: 2, ticket_number: 'TKT002', title: 'Report Generation', description: 'PDF export not working', priority: 'medium', status: 'in_progress', created_by: 'user1', assigned_to: 'developer1', created_date: '2024-01-09', due_date: '2024-01-15' },
    { id: 3, ticket_number: 'TKT003', title: 'Database Optimization', description: 'Slow queries', priority: 'low', status: 'resolved', created_by: 'admin', assigned_to: 'developer2', created_date: '2024-01-08', due_date: '2024-01-20' },
    { id: 4, ticket_number: 'TKT004', title: 'UI Enhancement', description: 'Improve dashboard layout', priority: 'low', status: 'open', created_by: 'user2', assigned_to: '', created_date: '2024-01-07', due_date: '2024-01-25' },
];
const priorityColor = (priority) => {
    switch (priority) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'default';
    }
};
const statusColor = (status) => {
    switch (status) {
        case 'open': return 'error';
        case 'in_progress': return 'info';
        case 'resolved': return 'success';
        case 'closed': return 'default';
        default: return 'default';
    }
};
export default function TicketList() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState(mockTickets);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [formData, setFormData] = useState({
        ticket_number: '',
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        created_by: '',
        assigned_to: '',
        due_date: '',
    });
    const filteredTickets = tickets.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const paginatedTickets = filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const handleAddTicket = () => {
        setEditingTicket(null);
        setFormData({
            ticket_number: '',
            title: '',
            description: '',
            priority: 'medium',
            status: 'open',
            created_by: '',
            assigned_to: '',
            due_date: '',
        });
        setOpenDialog(true);
    };
    const handleEditTicket = (ticket) => {
        setEditingTicket(ticket);
        setFormData({
            ticket_number: ticket.ticket_number,
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            created_by: ticket.created_by,
            assigned_to: ticket.assigned_to || '',
            due_date: ticket.due_date,
        });
        setOpenDialog(true);
    };
    const handleSaveTicket = () => {
        if (editingTicket) {
            setTickets(tickets.map(t => t.id === editingTicket.id
                ? { ...t, ...formData }
                : t));
        }
        else {
            setTickets([...tickets, {
                    id: Math.max(...tickets.map(t => t.id), 0) + 1,
                    ...formData,
                    created_date: new Date().toISOString().split('T')[0],
                }]);
        }
        setOpenDialog(false);
    };
    const handleDeleteTicket = (id) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            setTickets(tickets.filter(t => t.id !== id));
        }
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h5", children: "Tickets" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleAddTicket, children: "New Ticket" })] }), _jsx(TextField, { placeholder: "Search tickets...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), fullWidth: true, size: "small" }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: '#f5f5f5' }, children: [_jsx(TableCell, { children: "Ticket #" }), _jsx(TableCell, { children: "Title" }), _jsx(TableCell, { children: "Priority" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Created By" }), _jsx(TableCell, { children: "Assigned To" }), _jsx(TableCell, { children: "Due Date" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: paginatedTickets.map((ticket) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: ticket.ticket_number }), _jsx(TableCell, { children: ticket.title }), _jsx(TableCell, { children: _jsx(Chip, { label: ticket.priority.toUpperCase(), color: priorityColor(ticket.priority), size: "small" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: ticket.status.toUpperCase().replace('_', ' '), color: statusColor(ticket.status), size: "small" }) }), _jsx(TableCell, { children: ticket.created_by }), _jsx(TableCell, { children: ticket.assigned_to || '-' }), _jsx(TableCell, { children: ticket.due_date }), _jsxs(TableCell, { align: "right", children: [_jsx(IconButton, { size: "small", onClick: () => handleEditTicket(ticket), children: _jsx(Edit, { fontSize: "small" }) }), _jsx(IconButton, { size: "small", onClick: () => handleDeleteTicket(ticket.id), children: _jsx(Delete, { fontSize: "small" }) })] })] }, ticket.id))) })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25, 50], component: "div", count: filteredTickets.length, rowsPerPage: rowsPerPage, page: page, onPageChange: (e, newPage) => setPage(newPage), onRowsPerPageChange: (e) => setRowsPerPage(parseInt(e.target.value, 10)) })] }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingTicket ? 'Edit Ticket' : 'Create New Ticket' }), _jsx(DialogContent, { sx: { pt: 3 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Ticket Number", value: formData.ticket_number, onChange: (e) => setFormData({ ...formData, ticket_number: e.target.value }), fullWidth: true, size: "small" }), _jsx(TextField, { label: "Title", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), fullWidth: true, size: "small" }), _jsx(TextField, { label: "Description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), fullWidth: true, size: "small", multiline: true, rows: 3 }), _jsxs(TextField, { label: "Priority", select: true, value: formData.priority, onChange: (e) => setFormData({ ...formData, priority: e.target.value }), fullWidth: true, size: "small", SelectProps: { native: true }, children: [_jsx("option", { value: "low", children: "Low" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "high", children: "High" })] }), _jsxs(TextField, { label: "Status", select: true, value: formData.status, onChange: (e) => setFormData({ ...formData, status: e.target.value }), fullWidth: true, size: "small", SelectProps: { native: true }, children: [_jsx("option", { value: "open", children: "Open" }), _jsx("option", { value: "in_progress", children: "In Progress" }), _jsx("option", { value: "resolved", children: "Resolved" }), _jsx("option", { value: "closed", children: "Closed" })] }), _jsx(TextField, { label: "Created By", value: formData.created_by, onChange: (e) => setFormData({ ...formData, created_by: e.target.value }), fullWidth: true, size: "small" }), _jsx(TextField, { label: "Assigned To", value: formData.assigned_to, onChange: (e) => setFormData({ ...formData, assigned_to: e.target.value }), fullWidth: true, size: "small" }), _jsx(TextField, { label: "Due Date", type: "date", value: formData.due_date, onChange: (e) => setFormData({ ...formData, due_date: e.target.value }), fullWidth: true, size: "small", InputLabelProps: { shrink: true } })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSaveTicket, variant: "contained", children: editingTicket ? 'Update' : 'Create' })] })] })] }));
}
