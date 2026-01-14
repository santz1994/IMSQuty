import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import { CustomThemeProvider } from './context/ThemeContext'
import './index.css'
import store from './store'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <CustomThemeProvider>
          <App />
        </CustomThemeProvider>
      </Router>
    </Provider>
  </React.StrictMode>,
)
