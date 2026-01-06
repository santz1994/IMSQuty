import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
const mockReports = [
    { id: 1, title: 'Asset Inventory Report', description: 'Complete asset inventory with status', generatedDate: '2026-01-05', format: 'PDF' },
    { id: 2, title: 'Open Tickets Summary', description: 'All open tickets by priority and assignee', generatedDate: '2026-01-04', format: 'Excel' },
    { id: 3, title: 'Financial Report', description: 'Monthly financial summary and analysis', generatedDate: '2026-01-03', format: 'PDF' },
    { id: 4, title: 'Meeting Rooms Utilization', description: 'Room booking statistics and trends', generatedDate: '2026-01-02', format: 'PDF' },
];
const ReportsList = () => {
    const [reports, setReports] = useState(mockReports);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ title: '', format: 'PDF', dateRange: '' });
    const handleGenerateReport = () => {
        const newReport = {
            id: Math.max(...reports.map(r => r.id), 0) + 1,
            title: formData.title,
            description: 'Custom generated report',
            generatedDate: new Date().toISOString().split('T')[0],
            format: formData.format,
        };
        setReports([newReport, ...reports]);
        setOpenDialog(false);
    };
    return (_jsx(Box, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h4", children: "Reports" }), _jsx(Button, { variant: "contained", onClick: () => setOpenDialog(true), children: "Generate Report" })] }), _jsx(Grid, { container: true, spacing: 2, children: reports.map(report => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(Card, { sx: { height: '100%' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: report.title }), _jsx(Typography, { variant: "body2", color: "textSecondary", sx: { mb: 2 }, children: report.description }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "caption", color: "textSecondary", children: report.generatedDate }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Typography, { variant: "caption", sx: { backgroundColor: '#e3f2fd', px: 1, py: 0.5, borderRadius: 1 }, children: report.format }), _jsx(Button, { size: "small", startIcon: _jsx(FileDownload, {}), children: "Download" })] })] })] }) }) }, report.id))) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Generate New Report" }), _jsx(DialogContent, { sx: { pt: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsxs(TextField, { select: true, label: "Report Type", fullWidth: true, value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), SelectProps: { native: true }, children: [_jsx("option", { value: "", children: "Select Report Type" }), _jsx("option", { value: "Asset Inventory Report", children: "Asset Inventory Report" }), _jsx("option", { value: "Ticket Summary", children: "Ticket Summary" }), _jsx("option", { value: "Financial Report", children: "Financial Report" }), _jsx("option", { value: "User Activity", children: "User Activity Report" })] }), _jsxs(TextField, { select: true, label: "Format", fullWidth: true, value: formData.format, onChange: (e) => setFormData({ ...formData, format: e.target.value }), SelectProps: { native: true }, children: [_jsx("option", { value: "PDF", children: "PDF" }), _jsx("option", { value: "Excel", children: "Excel" }), _jsx("option", { value: "CSV", children: "CSV" })] }), _jsx(TextField, { label: "Date Range", type: "date", fullWidth: true, InputLabelProps: { shrink: true }, value: formData.dateRange, onChange: (e) => setFormData({ ...formData, dateRange: e.target.value }) })] }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleGenerateReport, variant: "contained", children: "Generate" })] })] })] }) }));
};
export default ReportsList;
