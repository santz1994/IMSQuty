/**
 * Financial Hook - Custom React hook for financial operations
 */
import { useCallback, useEffect, useState } from 'react'
import financialService, { Budget, CreateBudgetData, CreateExpenseData, CreateInvoiceData, Expense, Invoice } from '../services/FinancialService'

export const useInvoices = (autoFetch = false) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.getInvoices()
      if (response.success && response.data) {
        setInvoices(response.data)
      } else {
        setError(response.message || 'Failed to fetch invoices')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const createInvoice = useCallback(async (data: CreateInvoiceData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.createInvoice(data)
      if (response.success) {
        await fetchInvoices()
        return response.data
      } else {
        setError(response.message || 'Failed to create invoice')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchInvoices])

  const updateInvoice = useCallback(async (id: number, data: Partial<CreateInvoiceData>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.updateInvoice(id, data)
      if (response.success) {
        await fetchInvoices()
        return response.data
      } else {
        setError(response.message || 'Failed to update invoice')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchInvoices])

  const deleteInvoice = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.deleteInvoice(id)
      if (response.success) {
        await fetchInvoices()
        return true
      } else {
        setError(response.message || 'Failed to delete invoice')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchInvoices])

  useEffect(() => {
    if (autoFetch) {
      fetchInvoices()
    }
  }, [autoFetch, fetchInvoices])

  return { invoices, loading, error, fetchInvoices, createInvoice, updateInvoice, deleteInvoice }
}

export const useBudgets = (autoFetch = false) => {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.getBudgets()
      if (response.success && response.data) {
        setBudgets(response.data)
      } else {
        setError(response.message || 'Failed to fetch budgets')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const createBudget = useCallback(async (data: CreateBudgetData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.createBudget(data)
      if (response.success) {
        await fetchBudgets()
        return response.data
      } else {
        setError(response.message || 'Failed to create budget')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchBudgets])

  const updateBudget = useCallback(async (id: number, data: Partial<CreateBudgetData>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.updateBudget(id, data)
      if (response.success) {
        await fetchBudgets()
        return response.data
      } else {
        setError(response.message || 'Failed to update budget')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchBudgets])

  const deleteBudget = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.deleteBudget(id)
      if (response.success) {
        await fetchBudgets()
        return true
      } else {
        setError(response.message || 'Failed to delete budget')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchBudgets])

  useEffect(() => {
    if (autoFetch) {
      fetchBudgets()
    }
  }, [autoFetch, fetchBudgets])

  return { budgets, loading, error, fetchBudgets, createBudget, updateBudget, deleteBudget }
}

export const useExpenses = (autoFetch = false) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.getExpenses()
      if (response.success && response.data) {
        setExpenses(response.data)
      } else {
        setError(response.message || 'Failed to fetch expenses')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const createExpense = useCallback(async (data: CreateExpenseData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.createExpense(data)
      if (response.success) {
        await fetchExpenses()
        return response.data
      } else {
        setError(response.message || 'Failed to create expense')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchExpenses])

  const updateExpense = useCallback(async (id: number, data: Partial<CreateExpenseData>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.updateExpense(id, data)
      if (response.success) {
        await fetchExpenses()
        return response.data
      } else {
        setError(response.message || 'Failed to update expense')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchExpenses])

  const deleteExpense = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await financialService.deleteExpense(id)
      if (response.success) {
        await fetchExpenses()
        return true
      } else {
        setError(response.message || 'Failed to delete expense')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchExpenses])

  useEffect(() => {
    if (autoFetch) {
      fetchExpenses()
    }
  }, [autoFetch, fetchExpenses])

  return { expenses, loading, error, fetchExpenses, createExpense, updateExpense, deleteExpense }
}
