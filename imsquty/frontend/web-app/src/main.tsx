import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ThemeErrorBoundary from './components/common/ThemeErrorBoundary'
import { DataSyncProvider } from './context/DataSyncContext'
import { NotificationProvider } from './context/NotificationContext'
import { SmartNotificationProvider } from './context/SmartNotificationContext'
import { CustomThemeProvider } from './context/ThemeContext'
import './index.css'
import { store } from './store'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeErrorBoundary>
          <CustomThemeProvider>
            <NotificationProvider>
              <SmartNotificationProvider>
                <DataSyncProvider>
                  <App />
                </DataSyncProvider>
              </SmartNotificationProvider>
            </NotificationProvider>
          </CustomThemeProvider>
        </ThemeErrorBoundary>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
