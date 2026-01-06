import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layouts/DashboardLayout';
import AssetCreate from './pages/Assets/AssetCreate';
import AssetDetail from './pages/Assets/AssetDetail';
import AssetList from './pages/Assets/AssetList';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import TicketCreate from './pages/Tickets/TicketCreate';
import TicketDetail from './pages/Tickets/TicketDetail';
import TicketList from './pages/Tickets/TicketList';
import InventoryList from './pages/Inventory/InventoryList';
import FinancialList from './pages/Financial/FinancialList';
import ReportsList from './pages/Reports/ReportsList';
import MeetingRoomsList from './pages/MeetingRooms/MeetingRoomsList';
import NotificationsList from './pages/Notifications/NotificationsList';
import UsersList from './pages/Users/UsersList';
import AuditLogsList from './pages/AuditLogs/AuditLogsList';
import SettingsPage from './pages/Settings/SettingsPage';
import { useAppSelector } from './store/hooks';
const ProtectedRoute = ({ children, }) => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
/**
 * ProtectedDashboardRoute - Reusable wrapper for protected routes with dashboard layout
 * Eliminates 60% of JSX duplication
 */
const ProtectedDashboardRoute = ({ children, }) => (_jsx(ProtectedRoute, { children: _jsx(DashboardLayout, { children: children }) }));
function App() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: isAuthenticated ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(Login, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedDashboardRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/assets", element: _jsx(ProtectedDashboardRoute, { children: _jsx(AssetList, {}) }) }), _jsx(Route, { path: "/assets/create", element: _jsx(ProtectedDashboardRoute, { children: _jsx(AssetCreate, {}) }) }), _jsx(Route, { path: "/assets/:id", element: _jsx(ProtectedDashboardRoute, { children: _jsx(AssetDetail, {}) }) }), _jsx(Route, { path: "/tickets", element: _jsx(ProtectedDashboardRoute, { children: _jsx(TicketList, {}) }) }), _jsx(Route, { path: "/tickets/create", element: _jsx(ProtectedDashboardRoute, { children: _jsx(TicketCreate, {}) }) }), _jsx(Route, { path: "/tickets/:id", element: _jsx(ProtectedDashboardRoute, { children: _jsx(TicketDetail, {}) }) }), _jsx(Route, { path: "/inventory", element: _jsx(ProtectedDashboardRoute, { children: _jsx(InventoryList, {}) }) }), _jsx(Route, { path: "/financial", element: _jsx(ProtectedDashboardRoute, { children: _jsx(FinancialList, {}) }) }), _jsx(Route, { path: "/reports", element: _jsx(ProtectedDashboardRoute, { children: _jsx(ReportsList, {}) }) }), _jsx(Route, { path: "/meeting-rooms", element: _jsx(ProtectedDashboardRoute, { children: _jsx(MeetingRoomsList, {}) }) }), _jsx(Route, { path: "/notifications", element: _jsx(ProtectedDashboardRoute, { children: _jsx(NotificationsList, {}) }) }), _jsx(Route, { path: "/users", element: _jsx(ProtectedDashboardRoute, { children: _jsx(UsersList, {}) }) }), _jsx(Route, { path: "/audit-logs", element: _jsx(ProtectedDashboardRoute, { children: _jsx(AuditLogsList, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedDashboardRoute, { children: _jsx(SettingsPage, {}) }) })] }));
}
export default App;
