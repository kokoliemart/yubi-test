<?php

namespace App\Repositories\Eloquent;

use App\Models\SalesOrder;
use App\Repositories\Contracts\SalesOrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class SalesOrderRepository implements SalesOrderRepositoryInterface
{
    public function __construct(private SalesOrder $model)
    {
    }

    public function all(): Collection
    {
        return $this->model->with('details')->get();
    }

    public function paginate(int $perPage = 15, array $filters = [], string $sortBy = 'so_date', string $sortDirection = 'desc'): LengthAwarePaginator
    {
        $query = $this->model->with('details');

        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('so_number', 'like', "%{$search}%")
                  ->orWhere('remarks', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['currency_id'])) {
            $query->where('currency_id', $filters['currency_id']);
        }

        if (!empty($filters['order_type_id'])) {
            $query->where('order_type_id', $filters['order_type_id']);
        }

        if (!empty($filters['status_type_id'])) {
            $query->where('status_type_id', $filters['status_type_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('so_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('so_date', '<=', $filters['date_to']);
        }

        // Apply sorting
        $allowedSortColumns = ['so_number', 'so_date', 'customer_id', 'total_amount', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('so_date', 'desc');
        }

        return $query->paginate($perPage)->appends(request()->query());
    }

    public function find(int $id): ?SalesOrder
    {
        return $this->model->find($id);
    }

    public function create(array $data): SalesOrder
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): SalesOrder
    {
        $salesOrder = $this->model->findOrFail($id);
        $salesOrder->update($data);
        return $salesOrder->fresh();
    }

    public function delete(int $id): bool
    {
        $salesOrder = $this->model->findOrFail($id);
        return $salesOrder->delete();
    }

    public function findWithDetails(int $id): ?SalesOrder
    {
        return $this->model->with('details')->find($id);
    }

    public function generateSoNumber(): string
    {
        $latestOrder = $this->model->latest('id')->first();
        $nextNumber = $latestOrder ? $latestOrder->id + 1 : 1;

        return 'SO' . date('Ymd') . sprintf('%04d', $nextNumber);
    }
}