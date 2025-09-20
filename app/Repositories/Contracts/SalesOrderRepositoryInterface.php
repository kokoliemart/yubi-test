<?php

namespace App\Repositories\Contracts;

use App\Models\SalesOrder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface SalesOrderRepositoryInterface
{
    public function all(): Collection;

    public function paginate(int $perPage = 15, array $filters = [], string $sortBy = 'so_date', string $sortDirection = 'desc'): LengthAwarePaginator;

    public function find(int $id): ?SalesOrder;

    public function create(array $data): SalesOrder;

    public function update(int $id, array $data): SalesOrder;

    public function delete(int $id): bool;

    public function findWithDetails(int $id): ?SalesOrder;

    public function generateSoNumber(): string;
}