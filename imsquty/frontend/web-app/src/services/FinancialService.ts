/**
 * Financial Service
 * Handles financial operations including invoices, budgets, and expenses
 */

import { BaseService, PaginationParams, ServiceResponse } from './BaseService'

export interface Invoice {
  id: number
  invoice_number: string
  vendor_name: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  payment_date?: string
  description?: string
  items?: InvoiceItem[]
  created_at?: string
  updated_at?: string
}

export interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Budget {
  id: number
  department: string
  category: string
  allocated_amount: number
  spent_amount: number
  remaining_amount: number
  fiscal_year: string
  status: 'active' | 'depleted' | 'exceeded'
  created_at?: string
  updated_at?: string
}

export interface Expense {
  id: number
  title: string
  category: string
  amount: number
  currency: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
  description?: string
  receipt_url?: string
  user_id: number
  user_name?: string
  approver_id?: number
  approver_name?: string
  created_at?: string
  updated_at?: string
}

export interface CreateInvoiceData {
  vendor_name: string
  amount: number
  currency?: string
  issue_date: string
  due_date: string
  description?: string
  items?: Omit<InvoiceItem, 'id'>[]
}

export interface CreateBudgetData {
  department: string
  category: string
  allocated_amount: number
  fiscal_year: string
}

export interface CreateExpenseData {
  title: string
  category: string
  amount: number
  currency?: string
  date: string
  description?: string
  receipt?: File
}

export interface FinancialSummary {
  total_revenue: number
  total_expenses: number
  net_profit: number
  outstanding_invoices: number
  overdue_invoices: number
  budget_utilization: number
  monthly_trend: { month: string; revenue: number; expenses: number }[]
}

class FinancialService extends BaseService {
  constructor() {
    super('/financial')
  }

  // ========== INVOICES ==========

  /**
   * Get all invoices with pagination
   */
  async getInvoices(params?: PaginationParams): Promise<ServiceResponse<Invoice[]>> {
    try {
      const response = await this.get<Invoice[]>('/invoices', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get single invoice
   */
  async getInvoice(id: number): Promise<ServiceResponse<Invoice>> {
    try {
      const response = await this.get<Invoice>(`/invoices/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Create new invoice
   */
  async createInvoice(data: CreateInvoiceData): Promise<ServiceResponse<Invoice>> {
    try {
      const response = await this.post<Invoice>('/invoices', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: number, data: Partial<CreateInvoiceData>): Promise<ServiceResponse<Invoice>> {
    try {
      const response = await this.put<Invoice>(`/invoices/${id}`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/invoices/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Mark invoice as paid
   */
  async markInvoicePaid(id: number, payment_date: string): Promise<ServiceResponse<Invoice>> {
    try {
      const response = await this.post<Invoice>(`/invoices/${id}/pay`, { payment_date })
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  // ========== BUDGETS ==========

  /**
   * Get all budgets
   */
  async getBudgets(params?: PaginationParams): Promise<ServiceResponse<Budget[]>> {
    try {
      const response = await this.get<Budget[]>('/budgets', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Create new budget
   */
  async createBudget(data: CreateBudgetData): Promise<ServiceResponse<Budget>> {
    try {
      const response = await this.post<Budget>('/budgets', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update budget
   */
  async updateBudget(id: number, data: Partial<CreateBudgetData>): Promise<ServiceResponse<Budget>> {
    try {
      const response = await this.put<Budget>(`/budgets/${id}`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete budget
   */
  async deleteBudget(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/budgets/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  // ========== EXPENSES ==========

  /**
   * Get all expenses
   */
  async getExpenses(params?: PaginationParams): Promise<ServiceResponse<Expense[]>> {
    try {
      const response = await this.get<Expense[]>('/expenses', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Create new expense
   */
  async createExpense(data: CreateExpenseData): Promise<ServiceResponse<Expense>> {
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value)
        }
      })

      const response = await this.post<Expense>('/expenses', formData)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update expense
   */
  async updateExpense(id: number, data: Partial<CreateExpenseData>): Promise<ServiceResponse<Expense>> {
    try {
      const response = await this.put<Expense>(`/expenses/${id}`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/expenses/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Approve expense
   */
  async approveExpense(id: number): Promise<ServiceResponse<Expense>> {
    try {
      const response = await this.post<Expense>(`/expenses/${id}/approve`, {})
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Reject expense
   */
  async rejectExpense(id: number, reason?: string): Promise<ServiceResponse<Expense>> {
    try {
      const response = await this.post<Expense>(`/expenses/${id}/reject`, { reason })
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  // ========== SUMMARY & REPORTS ==========

  /**
   * Get financial summary
   */
  async getSummary(): Promise<ServiceResponse<FinancialSummary>> {
    try {
      const response = await this.get<FinancialSummary>('/summary')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<ServiceResponse<Invoice[]>> {
    try {
      const response = await this.get<Invoice[]>('/invoices/overdue')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }
}

// Export singleton instance
export const financialService = new FinancialService()
export default financialService

