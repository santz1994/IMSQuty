import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// ============================================================================
// AXIOS CLIENT INSTANCE
// ============================================================================

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// ============================================================================
// REQUEST INTERCEPTOR - Add JWT token to all requests
// ============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('[API] 📤', config.method?.toUpperCase(), config.url)
    }

    return config
  },
  (error: AxiosError) => {
    console.error('[API] ❌ Request error:', error.message)
    return Promise.reject(error)
  }
)

// ============================================================================
// RESPONSE INTERCEPTOR - Handle errors and token refresh
// ============================================================================

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })

  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('[API] 📥', response.config.method?.toUpperCase(), response.config.url, '→', response.status)
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Log error in development
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('[API] ❌', error.response?.status, error.config?.url, error.response?.data)
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        // No refresh token, redirect to login
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Attempt to refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        })

        const { access_token } = response.data.data

        // Store new access token
        localStorage.setItem(TOKEN_KEY, access_token)

        // Update default authorization header
        if (apiClient.defaults.headers) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        }

        // Process queued requests
        processQueue(null, access_token)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }

        console.log('[API] 🔄 Token refreshed successfully')

        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error('[API] ❌ Token refresh failed, logging out')
        processQueue(refreshError, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle 403 Forbidden - No permission
    if (error.response?.status === 403) {
      console.error('[API] 🚫 Access forbidden - insufficient permissions')
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('[API] 🔍 Resource not found')
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      console.error('[API] ⚠ Validation error:', error.response.data)
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('[API] 💥 Server error - please try again later')
    }

    // Network error (no response)
    if (!error.response) {
      console.error('[API] 🌐 Network error - check your connection')
    }

    return Promise.reject(error)
  }
)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract error message from API response
 */
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.response?.data?.errors) {
    const errors = error.response.data.errors
    const firstError = Object.values(errors)[0]
    return Array.isArray(firstError) ? firstError[0] : String(firstError)
  }

  if (error.message) {
    return error.message
  }

  return 'An unexpected error occurred'
}

/**
 * Check if error is network error
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request
}

/**
 * Check if error is timeout error
 */
export const isTimeoutError = (error: any): boolean => {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout')
}

export default apiClient
