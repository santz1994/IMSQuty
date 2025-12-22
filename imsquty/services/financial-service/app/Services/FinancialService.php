<?php

namespace App\Services;

use App\Repositories\FinancialRepository;

class FinancialService
{
    public function __construct(private FinancialRepository $repository) {}

    public function getAllInvoices(int $perPage = 15, array $filters = [])
    {
        return $this->repository->getAllInvoices($perPage, $filters);
    }

    public function getInvoiceById(int $id)
    {
        return $this->repository->findInvoiceById($id);
    }

    public function createInvoice(array $data)
    {
        return $this->repository->createInvoice($data);
    }

    public function updateInvoice(int $id, array $data): bool
    {
        return $this->repository->updateInvoice($id, $data);
    }

    public function getAllBudgets(int $perPage = 15, array $filters = [])
    {
        return $this->repository->getAllBudgets($perPage, $filters);
    }

    public function getBudgetById(int $id)
    {
        return $this->repository->findBudgetById($id);
    }

    public function createBudget(array $data)
    {
        return $this->repository->createBudget($data);
    }

    public function getAllExpenses(int $perPage = 15, array $filters = [])
    {
        return $this->repository->getAllExpenses($perPage, $filters);
    }

    public function createExpense(array $data)
    {
        return $this->repository->createExpense($data);
    }

    public function approveExpense(int $id, int $approvedBy): bool
    {
        return $this->repository->approveExpense($id, $approvedBy);
    }

    public function getFinancialSummary(): array
    {
        return $this->repository->getFinancialSummary();
    }
}
