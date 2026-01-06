import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
const Dashboard = () => {
    const dispatch = useAppDispatch();
    const { assets, pagination: assetPagination } = useAppSelector((state) => state.asset);
    const { tickets, pagination: ticketPagination } = useAppSelector((state) => state.ticket);
    useEffect(() => {
        // TODO: Enable once backend API is properly configured with CORS
        // dispatch(fetchAssets({ page: 1, perPage: 5 }))
        // dispatch(fetchTickets({ page: 1, perPage: 5 }))
    }, [dispatch]);
    const StatCard = ({ title, value, }) => (_jsxs(Paper, { sx: { p: 2, textAlign: 'center' }, children: [_jsx(Typography, { variant: "h6", color: "textSecondary", children: title }), _jsx(Typography, { variant: "h4", sx: { mt: 1 }, children: value })] }));
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { mb: 3 }, children: "Dashboard" }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Total Assets", value: assetPagination.total }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Active Tickets", value: ticketPagination.total }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Open Requests", value: "0" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(StatCard, { title: "Maintenance", value: "0" }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Recent Assets" }), assets.slice(0, 5).map((asset) => (_jsxs(Box, { sx: { py: 1, borderBottom: '1px solid #eee' }, children: [_jsx(Typography, { variant: "body2", children: asset.name }), _jsxs(Typography, { variant: "caption", color: "textSecondary", children: ["Tag: ", asset.asset_tag] })] }, asset.id)))] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: "Recent Tickets" }), tickets.slice(0, 5).map((ticket) => (_jsxs(Box, { sx: { py: 1, borderBottom: '1px solid #eee' }, children: [_jsx(Typography, { variant: "body2", children: ticket.title }), _jsxs(Typography, { variant: "caption", color: "textSecondary", children: ["#", ticket.ticket_number] })] }, ticket.id)))] }) })] })] }));
};
export default Dashboard;
