import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ArrowBack, Delete, Save } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Grid, Paper, Typography, } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ControlledFormSelect, FormField, FormGroup } from '../../components/FormField';
import { useTicketForm, useTicketFormSubmit } from '../../hooks/useTicketForm';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteTicket, fetchTicket, updateTicket } from '../../store/slices/ticketSlice';
const TicketDetail = () => {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { currentTicket, loading, error: ticketError } = useAppSelector((state) => state.ticket);
    const [isEditing, setIsEditing] = useState(false);
    const { register, handleSubmit, errors, isSubmitting, control, setValue } = useTicketForm();
    const submitHandler = useTicketFormSubmit(async (data) => {
        try {
            if (!id)
                throw new Error('Ticket ID not found');
            const result = await dispatch(updateTicket({
                id: parseInt(id),
                data: {
                    ...data,
                    assigned_to: data.assigned_to ? Number(data.assigned_to) : undefined,
                    asset_id: data.asset_id ? Number(data.asset_id) : undefined,
                },
            }));
            if (result.payload) {
                setIsEditing(false);
            }
        }
        catch (err) {
            console.error('Failed to update ticket:', err);
        }
    });
    // Load ticket on mount
    useEffect(() => {
        if (id) {
            dispatch(fetchTicket(parseInt(id)));
        }
    }, [id, dispatch]);
    // Pre-populate form with current ticket data
    useEffect(() => {
        if (currentTicket && isEditing) {
            setValue('ticket_number', currentTicket.ticket_number);
            setValue('title', currentTicket.title);
            setValue('description', currentTicket.description);
            setValue('priority', currentTicket.priority);
            setValue('status', currentTicket.status);
            setValue('assigned_to', currentTicket.assigned_to);
            setValue('due_date', currentTicket.due_date);
            setValue('asset_id', currentTicket.asset_id);
            setValue('tags', currentTicket.tags);
        }
    }, [currentTicket, isEditing, setValue]);
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            if (id) {
                dispatch(deleteTicket(parseInt(id)));
                navigate('/tickets');
            }
        }
    };
    const onSubmit = async (data) => {
        await submitHandler(data);
    };
    if (loading)
        return _jsx(CircularProgress, {});
    if (ticketError)
        return _jsx(Alert, { severity: "error", children: ticketError });
    if (!currentTicket)
        return _jsx(Alert, { severity: "warning", children: "Ticket not found" });
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 3 }, children: [_jsx(Button, { startIcon: _jsx(ArrowBack, {}), onClick: () => navigate('/tickets'), sx: { mr: 2 }, children: "Back" }), _jsxs(Typography, { variant: "h4", sx: { flex: 1 }, children: ["Ticket: ", currentTicket?.ticket_number] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [!isEditing && (_jsx(Button, { variant: "outlined", onClick: () => setIsEditing(true), children: "Edit" })), isEditing && (_jsx(Button, { variant: "outlined", onClick: () => setIsEditing(false), children: "Cancel" })), _jsx(Button, { variant: "outlined", color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, disabled: isEditing, children: "Delete" })] })] }), ticketError && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: ticketError })), _jsx(Paper, { sx: { p: 3 }, children: _jsx("form", { onSubmit: handleSubmit(onSubmit), children: _jsx(FormGroup, { spacing: 2.5, children: !isEditing ? (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Basic Information" }), _jsx(FormField, { label: "Ticket Number", value: currentTicket?.ticket_number || '', disabled: true }), _jsx(FormField, { label: "Title", value: currentTicket?.title || '', disabled: true }), _jsx(FormField, { label: "Description", multiline: true, rows: 4, value: currentTicket?.description || '', disabled: true }), _jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Ticket Details" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Priority", value: currentTicket?.priority || '', disabled: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Status", value: currentTicket?.status || '', disabled: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Assigned To", value: currentTicket?.assigned_to || 'Unassigned', disabled: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Due Date", type: "date", value: currentTicket?.due_date || '', disabled: true, InputLabelProps: { shrink: true } }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Asset ID", value: currentTicket?.asset_id || '', disabled: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Tags", value: currentTicket?.tags || '', disabled: true }) })] })] })) : (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Edit Ticket" }), _jsx(FormField, { label: "Ticket Number", value: currentTicket?.ticket_number || '', disabled: true }), _jsx(FormField, { label: "Title", placeholder: "Ticket title", error: errors.title, required: true, ...register('title') }), _jsx(FormField, { label: "Description", multiline: true, rows: 4, placeholder: "Ticket description", error: errors.description, required: true, ...register('description') }), _jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Update Details" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(ControlledFormSelect, { control: control, name: "priority", label: "Priority", options: [
                                                    { label: 'Low', value: 'Low' },
                                                    { label: 'Medium', value: 'Medium' },
                                                    { label: 'High', value: 'High' },
                                                    { label: 'Critical', value: 'Critical' },
                                                ], error: errors.priority, required: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(ControlledFormSelect, { control: control, name: "status", label: "Status", options: [
                                                    { label: 'Open', value: 'Open' },
                                                    { label: 'In Progress', value: 'In Progress' },
                                                    { label: 'Pending Info', value: 'Pending Info' },
                                                    { label: 'Resolved', value: 'Resolved' },
                                                    { label: 'Closed', value: 'Closed' },
                                                ], error: errors.status, required: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Assigned To", type: "number", placeholder: "User ID", error: errors.assigned_to, ...register('assigned_to') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Due Date", type: "date", InputLabelProps: { shrink: true }, error: errors.due_date, required: true, ...register('due_date') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Asset ID", type: "number", placeholder: "Asset ID", error: errors.asset_id, ...register('asset_id') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Tags", placeholder: "Tags (comma-separated)", error: errors.tags, ...register('tags') }) })] }), _jsx(Box, { sx: { display: 'flex', gap: 2, mt: 3 }, children: _jsx(Button, { variant: "contained", color: "primary", type: "submit", startIcon: isSubmitting ? (_jsx(CircularProgress, { size: 20 })) : (_jsx(Save, {})), disabled: isSubmitting || loading, children: isSubmitting || loading ? 'Saving...' : 'Save Changes' }) })] })) }) }) })] }));
};
export default TicketDetail;
