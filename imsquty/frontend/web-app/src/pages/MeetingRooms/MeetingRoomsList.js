import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography, } from '@mui/material';
import { Add } from '@mui/icons-material';
const mockRooms = [
    { id: 1, name: 'Conference Room A', capacity: 10, floor: '2nd', status: 'available', features: ['Projector', 'Whiteboard', 'Video Conference'] },
    { id: 2, name: 'Meeting Room B', capacity: 6, floor: '3rd', status: 'booked', features: ['Whiteboard', 'TV Monitor'] },
    { id: 3, name: 'Board Room', capacity: 20, floor: '1st', status: 'available', features: ['Projector', 'Video Conference', 'Audio System'] },
    { id: 4, name: 'Training Room', capacity: 30, floor: '4th', status: 'available', features: ['Projector', 'Microphone', 'Whiteboard'] },
];
const MeetingRoomsList = () => {
    const [rooms, setRooms] = useState(mockRooms);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ name: '', capacity: '', floor: '', features: '' });
    const handleOpenDialog = () => {
        setFormData({ name: '', capacity: '', floor: '', features: '' });
        setOpenDialog(true);
    };
    const handleSave = () => {
        const newRoom = {
            id: Math.max(...rooms.map(r => r.id), 0) + 1,
            name: formData.name,
            capacity: parseInt(formData.capacity),
            floor: formData.floor,
            status: 'available',
            features: formData.features.split(',').map(f => f.trim()),
        };
        setRooms([...rooms, newRoom]);
        setOpenDialog(false);
    };
    return (_jsx(Box, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h4", children: "Meeting Rooms" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: handleOpenDialog, children: "Add Room" })] }), _jsx(Grid, { container: true, spacing: 3, children: rooms.map(room => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(Card, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: room.name }), _jsxs(Typography, { color: "textSecondary", gutterBottom: true, children: ["Floor: ", room.floor] }), _jsxs(Typography, { variant: "body2", sx: { mb: 1 }, children: ["Capacity: ", room.capacity, " people"] }), _jsx(Chip, { label: room.status.toUpperCase(), color: room.status === 'available' ? 'success' : 'warning', size: "small", sx: { mb: 2 } }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: _jsx("strong", { children: "Features:" }) }), _jsx(Stack, { direction: "row", spacing: 0.5, sx: { mt: 1, flexWrap: 'wrap', gap: 0.5 }, children: room.features.map((feature, idx) => (_jsx(Chip, { label: feature, size: "small", variant: "outlined" }, idx))) })] }) }) }, room.id))) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Add New Meeting Room" }), _jsx(DialogContent, { sx: { pt: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Room Name", fullWidth: true, value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) }), _jsx(TextField, { label: "Capacity", type: "number", fullWidth: true, value: formData.capacity, onChange: (e) => setFormData({ ...formData, capacity: e.target.value }) }), _jsx(TextField, { label: "Floor", fullWidth: true, value: formData.floor, onChange: (e) => setFormData({ ...formData, floor: e.target.value }) }), _jsx(TextField, { label: "Features (comma separated)", fullWidth: true, value: formData.features, onChange: (e) => setFormData({ ...formData, features: e.target.value }) })] }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSave, variant: "contained", children: "Create" })] })] })] }) }));
};
export default MeetingRoomsList;
