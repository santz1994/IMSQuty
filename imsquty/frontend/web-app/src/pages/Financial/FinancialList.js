import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, } from '@mui/material';
import { Delete, Edit, Add, Search } from '@mui/icons-material';
const mockTransactions = [
    { id: 1, date: '2026-01-05', description: 'Equipment Purchase', amount: 5000, type: 'expense', category: 'Assets', status: 'completed' },
    { id: 2, date: '2026-01-04', description: 'Software License', amount: 1200, type: 'expense', category: 'Software', status: 'completed' },
    { id: 3, date: '2026-01-03', description: 'Maintenance Service', amount: 800, type: 'expense', category: 'Maintenance', status: 'pending' },
    { id: 4, date: '2026-01-02', description: 'Asset Depreciation', amount: 2000, type: 'adjustment', category: 'Depreciation', status: 'completed' },
];
const FinancialList = () => {
    const [transactions, setTransactions] = useState(mockTransactions);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ date: '', description: '', amount: '', type: 'expense', category: '', status: 'completed' });
    const filtered = transactions.filter(tx => tx.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const handleSave = () => {
        const newTx = {
            id: Math.max(...transactions.map(t => t.id), 0) + 1,
            date: formData.date,
            description: formData.description,
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category,
            status: formData.status,
        };
        setTransactions([...transactions, newTx]);
        setOpenDialog(false);
    };
    return (_jsx(Box, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h4", children: "Financial Management" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => setOpenDialog(true), children: "New Transaction" })] }), _jsx(TextField, { placeholder: "Search transactions...", fullWidth: true, variant: "outlined", size: "small", InputProps: { startAdornment: _jsx(Search, { sx: { mr: 1, color: 'gray' } }) }, value: searchQuery, onChange: (e) => { setSearchQuery(e.target.value); setPage(0); } }), _jsxs(TableContainer, { component: Paper, children: [_jsxs(Table, { children: [_jsx(TableHead, { sx: { backgroundColor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx("strong", { children: "Date" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Description" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Category" }) }), _jsx(TableCell, { align: "right", children: _jsx("strong", { children: "Amount" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Type" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Status" }) }), _jsx(TableCell, { align: "center", children: _jsx("strong", { children: "Actions" }) })] }) }), _jsx(TableBody, { children: paginated.length > 0 ? paginated.map(tx => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: tx.date }), _jsx(TableCell, { children: tx.description }), _jsx(TableCell, { children: tx.category }), _jsxs(TableCell, { align: "right", sx: { color: tx.type === 'expense' ? 'red' : 'green', fontWeight: 'bold' }, children: [tx.type === 'expense' ? '-' : '+', " $", tx.amount] }), _jsx(TableCell, { children: _jsx(Chip, { label: tx.type.toUpperCase(), size: "small" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: tx.status.toUpperCase(), color: tx.status === 'completed' ? 'success' : 'warning', size: "small" }) }), _jsxs(TableCell, { align: "center", children: [_jsx(IconButton, { size: "small", color: "info", children: _jsx(Edit, {}) }), _jsx(IconButton, { size: "small", color: "error", onClick: () => setTransactions(transactions.filter(t => t.id !== tx.id)), children: _jsx(Delete, {}) })] })] }, tx.id))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, align: "center", sx: { py: 4 }, children: _jsx(Typography, { color: "textSecondary", children: "No transactions found" }) }) })) })] }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: filtered.length, rowsPerPage: rowsPerPage, page: page, onPageChange: (_, p) => setPage(p), onRowsPerPageChange: (e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); } })] }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "New Transaction" }), _jsx(DialogContent, { sx: { pt: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Date", type: "date", fullWidth: true, InputLabelProps: { shrink: true }, value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }) }), _jsx(TextField, { label: "Description", fullWidth: true, value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }) }), _jsx(TextField, { label: "Amount", type: "number", fullWidth: true, value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }) }), _jsx(TextField, { label: "Category", fullWidth: true, value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }) })] }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSave, variant: "contained", children: "Save" })] })] })] }) }));
};
export default FinancialList;
