import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AuditLog,
  AuditLogFilters,
  AuditLogsResponse,
  AuditStatistics,
  exportAuditLogs,
  ExportFormat,
  getAuditLogById,
  getAuditLogs,
  getAuditStatistics,
  getAvailableActions,
  getAvailableModules,
  purgeOldLogs,
} from '../../api/auditService';

// ============================================
// STATE INTERFACE
// ============================================

export interface AuditState {
  // Audit logs data
  logs: AuditLog[];
  selectedLog: AuditLog | null;

  // Pagination
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };

  // Filters
  filters: AuditLogFilters;

  // Statistics
  statistics: AuditStatistics | null;

  // Filter options
  availableActions: string[];
  availableModules: string[];

  // Loading states
  loading: boolean;
  loadingDetail: boolean;
  exporting: boolean;
  loadingStats: boolean;
  purging: boolean;

  // Error handling
  error: string | null;

  // Success messages
  successMessage: string | null;
}

const initialState: AuditState = {
  logs: [],
  selectedLog: null,
  pagination: {
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
  },
  filters: {
    page: 1,
    per_page: 25,
  },
  statistics: null,
  availableActions: [],
  availableModules: [],
  loading: false,
  loadingDetail: false,
  exporting: false,
  loadingStats: false,
  purging: false,
  error: null,
  successMessage: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Fetch audit logs with filters
 */
export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchLogs',
  async (filters: AuditLogFilters = {}, { rejectWithValue }) => {
    try {
      const response = await getAuditLogs(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch single audit log detail
 */
export const fetchAuditLogDetail = createAsyncThunk(
  'audit/fetchDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getAuditLogById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Export audit logs
 */
export const exportLogs = createAsyncThunk(
  'audit/export',
  async (
    { format, filters }: { format: ExportFormat; filters?: AuditLogFilters },
    { rejectWithValue }
  ) => {
    try {
      const blob = await exportAuditLogs({ format, filters });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `audit_logs_${timestamp}.${format === 'excel' ? 'xlsx' : format}`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { format };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch audit statistics
 */
export const fetchAuditStatistics = createAsyncThunk(
  'audit/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAuditStatistics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch available actions for filter dropdown
 */
export const fetchAvailableActions = createAsyncThunk(
  'audit/fetchActions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAvailableActions();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch available modules for filter dropdown
 */
export const fetchAvailableModules = createAsyncThunk(
  'audit/fetchModules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAvailableModules();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Purge old audit logs
 */
export const purgeAuditLogs = createAsyncThunk(
  'audit/purge',
  async (daysToKeep: number, { rejectWithValue }) => {
    try {
      const response = await purgeOldLogs(daysToKeep);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// SLICE
// ============================================

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    /**
     * Set filters for audit logs
     */
    setFilters: (state, action: PayloadAction<AuditLogFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    /**
     * Clear all filters
     */
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        per_page: 25,
      };
    },

    /**
     * Set selected log for detail view
     */
    setSelectedLog: (state, action: PayloadAction<AuditLog | null>) => {
      state.selectedLog = action.payload;
    },

    /**
     * Clear selected log
     */
    clearSelectedLog: (state) => {
      state.selectedLog = null;
    },

    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Clear success message
     */
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },

    /**
     * Clear all messages
     */
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    // FETCH AUDIT LOGS
    // ==========================================
    builder.addCase(fetchAuditLogs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAuditLogs.fulfilled, (state, action: PayloadAction<AuditLogsResponse>) => {
      state.loading = false;
      state.logs = action.payload.data;
      state.pagination = action.payload.pagination;
      state.error = null;
    });
    builder.addCase(fetchAuditLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ==========================================
    // FETCH AUDIT LOG DETAIL
    // ==========================================
    builder.addCase(fetchAuditLogDetail.pending, (state) => {
      state.loadingDetail = true;
      state.error = null;
    });
    builder.addCase(fetchAuditLogDetail.fulfilled, (state, action: PayloadAction<AuditLog>) => {
      state.loadingDetail = false;
      state.selectedLog = action.payload;
      state.error = null;
    });
    builder.addCase(fetchAuditLogDetail.rejected, (state, action) => {
      state.loadingDetail = false;
      state.error = action.payload as string;
    });

    // ==========================================
    // EXPORT AUDIT LOGS
    // ==========================================
    builder.addCase(exportLogs.pending, (state) => {
      state.exporting = true;
      state.error = null;
    });
    builder.addCase(exportLogs.fulfilled, (state, action) => {
      state.exporting = false;
      state.successMessage = `Audit logs exported successfully as ${action.payload.format.toUpperCase()}`;
    });
    builder.addCase(exportLogs.rejected, (state, action) => {
      state.exporting = false;
      state.error = action.payload as string;
    });

    // ==========================================
    // FETCH AUDIT STATISTICS
    // ==========================================
    builder.addCase(fetchAuditStatistics.pending, (state) => {
      state.loadingStats = true;
      state.error = null;
    });
    builder.addCase(fetchAuditStatistics.fulfilled, (state, action: PayloadAction<AuditStatistics>) => {
      state.loadingStats = false;
      state.statistics = action.payload;
      state.error = null;
    });
    builder.addCase(fetchAuditStatistics.rejected, (state, action) => {
      state.loadingStats = false;
      state.error = action.payload as string;
    });

    // ==========================================
    // FETCH AVAILABLE ACTIONS
    // ==========================================
    builder.addCase(fetchAvailableActions.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchAvailableActions.fulfilled, (state, action: PayloadAction<string[]>) => {
      state.availableActions = action.payload;
    });
    builder.addCase(fetchAvailableActions.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // ==========================================
    // FETCH AVAILABLE MODULES
    // ==========================================
    builder.addCase(fetchAvailableModules.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchAvailableModules.fulfilled, (state, action: PayloadAction<string[]>) => {
      state.availableModules = action.payload;
    });
    builder.addCase(fetchAvailableModules.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // ==========================================
    // PURGE OLD LOGS
    // ==========================================
    builder.addCase(purgeAuditLogs.pending, (state) => {
      state.purging = true;
      state.error = null;
    });
    builder.addCase(purgeAuditLogs.fulfilled, (state, action) => {
      state.purging = false;
      state.successMessage = `Successfully purged ${action.payload.deleted_count} old audit logs`;
    });
    builder.addCase(purgeAuditLogs.rejected, (state, action) => {
      state.purging = false;
      state.error = action.payload as string;
    });
  },
});

// ============================================
// EXPORTS
// ============================================

export const {
  setFilters,
  clearFilters,
  setSelectedLog,
  clearSelectedLog,
  clearError,
  clearSuccessMessage,
  clearMessages,
} = auditSlice.actions;

export default auditSlice.reducer;
