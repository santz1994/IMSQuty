import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Add, ArrowBack } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Grid, Paper, Typography, } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ControlledFormSelect, FormField, FormGroup } from '../../components/FormField';
import { useTicketForm, useTicketFormSubmit } from '../../hooks/useTicketForm';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTicket } from '../../store/slices/ticketSlice';
const TicketCreate = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error: ticketError } = useAppSelector((state) => state.ticket);
    const { register, handleSubmit, errors, isSubmitting, control } = useTicketForm();
    const submitHandler = useTicketFormSubmit(async (data) => {
        try {
            const result = await dispatch(createTicket({
                ...data,
                assigned_to: data.assigned_to ? Number(data.assigned_to) : undefined,
                asset_id: data.asset_id ? Number(data.asset_id) : undefined,
            }));
            if (result.payload) {
                navigate('/tickets');
            }
        }
        catch (err) {
            console.error('Failed to create ticket:', err);
        }
    });
    const onSubmit = async (data) => {
        await submitHandler(data);
    };
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 3 }, children: [_jsx(Button, { startIcon: _jsx(ArrowBack, {}), onClick: () => navigate('/tickets'), sx: { mr: 2 }, children: "Back" }), _jsx(Typography, { variant: "h4", children: "Create New Ticket" })] }), ticketError && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: ticketError })), _jsx(Paper, { sx: { p: 3 }, children: _jsx("form", { onSubmit: handleSubmit(onSubmit), children: _jsxs(FormGroup, { spacing: 2.5, children: [_jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Basic Information" }), _jsx(FormField, { label: "Ticket Number", placeholder: "e.g., TKT-001", error: errors.ticket_number, required: true, ...register('ticket_number') }), _jsx(FormField, { label: "Title", placeholder: "e.g., Hardware Issue", error: errors.title, required: true, ...register('title') }), _jsx(FormField, { label: "Description", multiline: true, rows: 4, placeholder: "Describe the issue in detail...", error: errors.description, required: true, ...register('description') }), _jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Ticket Details" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(ControlledFormSelect, { control: control, name: "priority", label: "Priority", options: [
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
                                            ], error: errors.status, required: true }) })] }), _jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Assignment & Due Date" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Assigned To", type: "number", placeholder: "User ID (optional)", error: errors.assigned_to, ...register('assigned_to') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Due Date", type: "date", InputLabelProps: { shrink: true }, error: errors.due_date, required: true, ...register('due_date') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Asset ID", type: "number", placeholder: "Asset ID (optional)", error: errors.asset_id, ...register('asset_id') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Tags", placeholder: "e.g., urgent, hardware, network", error: errors.tags, ...register('tags') }) })] }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mt: 3 }, children: [_jsx(Button, { variant: "contained", color: "primary", type: "submit", startIcon: isSubmitting ? (_jsx(CircularProgress, { size: 20 })) : (_jsx(Add, {})), disabled: isSubmitting || loading, children: isSubmitting || loading ? 'Creating...' : 'Create Ticket' }), _jsx(Button, { variant: "outlined", color: "secondary", onClick: () => navigate('/tickets'), disabled: isSubmitting || loading, children: "Cancel" })] })] }) }) })] }));
};
export default TicketCreate;
