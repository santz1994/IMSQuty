import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, Chip, } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const mockAssets = [
    { id: 1, asset_tag: 'AST001', name: 'Laptop Dell', serial_number: 'SN123456', asset_type_id: '1', status: 'active', purchase_date: '2023-01-15' },
    { id: 2, asset_tag: 'AST002', name: 'Monitor LG', serial_number: 'SN123457', asset_type_id: '2', status: 'active', purchase_date: '2023-02-20' },
    { id: 3, asset_tag: 'AST003', name: 'Keyboard Logitech', serial_number: 'SN123458', asset_type_id: '3', status: 'maintenance', purchase_date: '2023-03-10' },
    { id: 4, asset_tag: 'AST004', name: 'Mouse Razer', serial_number: 'SN123459', asset_type_id: '3', status: 'inactive', purchase_date: '2022-12-01' },
    { id: 5, asset_tag: 'AST005', name: 'Printer HP', serial_number: 'SN123460', asset_type_id: '4', status: 'active', purchase_date: '2023-04-05' },
];
const statusChipColor = (status) => {
    switch (status) {
        case 'active': return 'success';
        case 'maintenance': return 'warning';
        case 'inactive': return 'error';
        default: return 'default';
    }
};
export default function AssetList() {
    const navigate = useNavigate();
    const [assets, setAssets] = useState(mockAssets);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [formData, setFormData] = useState({
        asset_tag: '',
        name: '',
        serial_number: '',
        asset_type_id: '',
        status: 'active',
        purchase_date: '',
    });
    const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.asset_tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const paginatedAssets = filteredAssets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const handleAddAsset = () => {
        setEditingAsset(null);
        setFormData({
            asset_tag: '',
            name: '',
            serial_number: '',
            asset_type_id: '',
            status: 'active',
            purchase_date: '',
        });
        setOpenDialog(true);
    };
    const handleEditAsset = (asset) => {
        setEditingAsset(asset);
        setFormData({
            asset_tag: asset.asset_tag,
            name: asset.name,
            serial_number: asset.serial_number,
            asset_type_id: asset.asset_type_id,
            status: asset.status,
            purchase_date: asset.purchase_date,
        });
        setOpenDialog(true);
    };
    const handleSaveAsset = () => {
        if (editingAsset) {
            setAssets(assets.map(a => a.id === editingAsset.id
                ? { ...a, ...formData }
                : a));
        }
        else {
            setAssets([...assets, {
                    id: Math.max(...assets.map(a => a.id), 0) + 1,
                    ...formData,
                }]);
        }
        setOpenDialog(false);
    };
    const handleDeleteAsset = (id) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            setAssets(assets.filter(a => a.id !== id));
        }
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h5", children: "Assets" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleAddAsset, children: "Add Asset" })] }), _jsx(TextField, { placeholder: "Search assets...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), fullWidth: true, size: "small" }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: '#f5f5f5' }, children: [_jsx(TableCell, { children: "Asset Tag" }), _jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Serial Number" }), _jsx(TableCell, { children: "Type" }), _jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Purchase Date" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: paginatedAssets.map((asset) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: asset.asset_tag }), _jsx(TableCell, { children: asset.name }), _jsx(TableCell, { children: asset.serial_number }), _jsx(TableCell, { children: asset.asset_type_id }), _jsx(TableCell, { children: _jsx(Chip, { label: asset.status, color: statusChipColor(asset.status), size: "small" }) }), _jsx(TableCell, { children: asset.purchase_date }), _jsxs(TableCell, { align: "right", children: [_jsx(IconButton, { size: "small", onClick: () => handleEditAsset(asset), children: _jsx(Edit, { fontSize: "small" }) }), _jsx(IconButton, { size: "small", onClick: () => handleDeleteAsset(asset.id), children: _jsx(Delete, { fontSize: "small" }) })] })] }, asset.id))) })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25, 50], component: "div", count: filteredAssets.length, rowsPerPage: rowsPerPage, page: page, onPageChange: (e, newPage) => setPage(newPage), onRowsPerPageChange: (e) => setRowsPerPage(parseInt(e.target.value, 10)) })] }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingAsset ? 'Edit Asset' : 'Add New Asset' }), _jsx(DialogContent, { sx: { pt: 3 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Asset Tag", value: formData.asset_tag, onChange: (e) => setFormData({ ...formData, asset_tag: e.target.value }), fullWidth: true, size: "small" }), _jsx(TextField, { label: "Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), fullWidth: true, size: "small" }), _jsx(TextField, { label: "Serial Number", value: formData.serial_number, onChange: (e) => setFormData({ ...formData, serial_number: e.target.value }), fullWidth: true, size: "small" }), _jsx(TextField, { label: "Type", value: formData.asset_type_id, onChange: (e) => setFormData({ ...formData, asset_type_id: e.target.value }), fullWidth: true, size: "small" }), _jsxs(TextField, { label: "Status", select: true, value: formData.status, onChange: (e) => setFormData({ ...formData, status: e.target.value }), fullWidth: true, size: "small", SelectProps: {
                                        native: true,
                                    }, children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "maintenance", children: "Maintenance" }), _jsx("option", { value: "inactive", children: "Inactive" })] }), _jsx(TextField, { label: "Purchase Date", type: "date", value: formData.purchase_date, onChange: (e) => setFormData({ ...formData, purchase_date: e.target.value }), fullWidth: true, size: "small", InputLabelProps: { shrink: true } })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSaveAsset, variant: "contained", children: editingAsset ? 'Update' : 'Create' })] })] })] }));
}
