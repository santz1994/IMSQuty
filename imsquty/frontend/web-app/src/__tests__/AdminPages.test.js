import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import SystemSettings from '../pages/Admin/SystemSettings';
const mockStore = configureMockStore();
const renderWithProviders = (component) => {
    const store = mockStore({
        auth: { token: 'test-token', user: { id: 1, role: 'admin' } },
    });
    return render(_jsx(Provider, { store: store, children: _jsx(BrowserRouter, { children: component }) }));
};
describe('Admin Pages', () => {
    describe('SystemSettings', () => {
        it('should render settings page', () => {
            renderWithProviders(_jsx(SystemSettings, {}));
            expect(screen.getByText('General Settings')).toBeInTheDocument();
            expect(screen.getByText('Security Settings')).toBeInTheDocument();
        });
        it('should display form fields', async () => {
            renderWithProviders(_jsx(SystemSettings, {}));
            await waitFor(() => {
                expect(screen.getByDisplayValue('imsquty')).toBeInTheDocument();
            });
        });
        it('should show conditional fields when toggle enabled', async () => {
            const user = userEvent.setup();
            renderWithProviders(_jsx(SystemSettings, {}));
            await waitFor(() => {
                const throttlingToggle = screen.getByRole('checkbox', {
                    name: /api throttling/i,
                });
                expect(throttlingToggle).toBeInTheDocument();
            });
            const throttlingToggle = screen.getByRole('checkbox', {
                name: /api throttling/i,
            });
            await user.click(throttlingToggle);
            // After toggling, the rate field should appear
            await waitFor(() => {
                expect(screen.queryByDisplayValue(/api throttle rate/i)).toBeInTheDocument();
            });
        });
        it('should have save and reload buttons', async () => {
            renderWithProviders(_jsx(SystemSettings, {}));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
            });
        });
        it('should update settings on save', async () => {
            const user = userEvent.setup();
            renderWithProviders(_jsx(SystemSettings, {}));
            await waitFor(() => {
                const appNameInput = screen.getByDisplayValue('imsquty');
                expect(appNameInput).toBeInTheDocument();
            });
            const appNameInput = screen.getByDisplayValue('imsquty');
            await user.clear(appNameInput);
            await user.type(appNameInput, 'Updated App');
            const saveButton = screen.getByRole('button', { name: /save/i });
            await user.click(saveButton);
            await waitFor(() => {
                expect(screen.getByText(/success|saved/i)).toBeInTheDocument();
            });
        });
    });
});
