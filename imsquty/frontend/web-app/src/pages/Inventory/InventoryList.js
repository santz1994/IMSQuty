import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, } from '@mui/material';
import { Delete, Edit, Add, Search } from '@mui/icons-material';
const mockInventory = [
    { id: 1, name: 'USB Cables', quantity: 150, unit: 'pcs', location: 'Warehouse A', status: 'in_stock' },
    { id: 2, name: 'HDMI Cables', quantity: 85, unit: 'pcs', location: 'Warehouse B', status: 'low_stock' },
    { id: 3, name: 'Power Supplies', quantity: 0, unit: 'pcs', location: 'Warehouse A', status: 'out_of_stock' },
    { id: 4, name: 'Monitor Stands', quantity: 42, unit: 'pcs', location: 'Warehouse C', status: 'in_stock' },
];
const InventoryList = () => {
    const [inventory, setInventory] = useState(mockInventory);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ name: '', quantity: '', unit: '', location: '', status: 'in_stock' });
    const filtered = inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const handleSave = () => {
        const newItem = {
            id: Math.max(...inventory.map(i => i.id), 0) + 1,
            name: formData.name,
            quantity: parseInt(formData.quantity),
            unit: formData.unit,
            location: formData.location,
            status: formData.status,
        };
        setInventory([...inventory, newItem]);
        setOpenDialog(false);
    };
    return (_jsx(Box, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h4", children: "Inventory Management" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => setOpenDialog(true), children: "Add Item" })] }), _jsx(TextField, { placeholder: "Search inventory items...", fullWidth: true, variant: "outlined", size: "small", InputProps: { startAdornment: _jsx(Search, { sx: { mr: 1, color: 'gray' } }) }, value: searchQuery, onChange: (e) => { setSearchQuery(e.target.value); setPage(0); } }), _jsxs(TableContainer, { component: Paper, children: [_jsxs(Table, { children: [_jsx(TableHead, { sx: { backgroundColor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx("strong", { children: "Item Name" }) }), _jsx(TableCell, { align: "right", children: _jsx("strong", { children: "Quantity" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Unit" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Location" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Status" }) }), _jsx(TableCell, { align: "center", children: _jsx("strong", { children: "Actions" }) })] }) }), _jsx(TableBody, { children: paginated.length > 0 ? paginated.map(item => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: item.name }), _jsx(TableCell, { align: "right", children: item.quantity }), _jsx(TableCell, { children: item.unit }), _jsx(TableCell, { children: item.location }), _jsx(TableCell, { children: _jsx(Chip, { label: item.status.toUpperCase(), color: item.status === 'in_stock' ? 'success' : item.status === 'low_stock' ? 'warning' : 'error', size: "small" }) }), _jsxs(TableCell, { align: "center", children: [_jsx(IconButton, { size: "small", color: "info", children: _jsx(Edit, {}) }), _jsx(IconButton, { size: "small", color: "error", onClick: () => setInventory(inventory.filter(i => i.id !== item.id)), children: _jsx(Delete, {}) })] })] }, item.id))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, align: "center", sx: { py: 4 }, children: _jsx(Typography, { color: "textSecondary", children: "No items found" }) }) })) })] }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: filtered.length, rowsPerPage: rowsPerPage, page: page, onPageChange: (_, p) => setPage(p), onRowsPerPageChange: (e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); } })] }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Add New Item" }), _jsx(DialogContent, { sx: { pt: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Item Name", fullWidth: true, value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) }), _jsx(TextField, { label: "Quantity", type: "number", fullWidth: true, value: formData.quantity, onChange: (e) => setFormData({ ...formData, quantity: e.target.value }) }), _jsx(TextField, { label: "Unit", fullWidth: true, value: formData.unit, onChange: (e) => setFormData({ ...formData, unit: e.target.value }) }), _jsx(TextField, { label: "Location", fullWidth: true, value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }) })] }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSave, variant: "contained", children: "Save" })] })] })] }) }));
};
export default InventoryList;
