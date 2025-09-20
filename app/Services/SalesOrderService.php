<?php

namespace App\Services;

use App\Models\SalesOrder;
use App\Repositories\Contracts\SalesOrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SalesOrderService
{
    public function __construct(
        private SalesOrderRepositoryInterface $salesOrderRepository
    ) {
    }

    public function getAllSalesOrders(): Collection
    {
        return $this->salesOrderRepository->all();
    }

    public function getPaginatedSalesOrders(int $perPage = 15, array $filters = [], string $sortBy = 'so_date', string $sortDirection = 'desc'): LengthAwarePaginator
    {
        return $this->salesOrderRepository->paginate($perPage, $filters, $sortBy, $sortDirection);
    }

    public function getSalesOrderById(int $id): ?SalesOrder
    {
        return $this->salesOrderRepository->findWithDetails($id);
    }

    public function createSalesOrder(array $data): SalesOrder
    {
        return DB::transaction(function () use ($data) {
            $salesOrderData = $this->prepareSalesOrderData($data, true); // true for create

            $salesOrder = $this->salesOrderRepository->create($salesOrderData);

            if (isset($data['details']) && is_array($data['details'])) {
                $this->createSalesOrderDetails($salesOrder, $data['details']);
            }

            return $this->salesOrderRepository->findWithDetails($salesOrder->id);
        });
    }

    public function updateSalesOrder(int $id, array $data): SalesOrder
    {
        return DB::transaction(function () use ($id, $data) {
            $salesOrderData = $this->prepareSalesOrderData($data, false); // false for update

            $salesOrder = $this->salesOrderRepository->update($id, $salesOrderData);

            if (isset($data['details']) && is_array($data['details'])) {
                $salesOrder->details()->delete();
                $this->createSalesOrderDetails($salesOrder, $data['details']);
            }

            return $this->salesOrderRepository->findWithDetails($salesOrder->id);
        });
    }

    public function deleteSalesOrder(int $id): bool
    {
        return $this->salesOrderRepository->delete($id);
    }

    public function generateSoNumber(): string
    {
        return $this->salesOrderRepository->generateSoNumber();
    }

    private function prepareSalesOrderData(array $data, bool $isCreate = true): array
    {
        $prepared = [
            'so_date' => $data['so_date'],
            'customer_id' => $data['customer_id'],
            'currency_id' => $data['currency_id'],
            'order_type_id' => $data['order_type_id'],
            'status_type_id' => $data['status_type_id'],
            'remarks' => $data['remarks'] ?? null,
            'pph_id' => $data['pph_id'] ?? null,
            'vat_id' => $data['vat_id'] ?? null,
        ];

        // Only generate SO number for new records (create)
        // For updates, SO number should never be changed
        if ($isCreate) {
            $prepared['so_number'] = $data['so_number'] ?? $this->generateSoNumber();
        }

        if (isset($data['details']) && is_array($data['details'])) {
            $totals = $this->calculateTotals($data['details']);
            $prepared['subtotal'] = $totals['subtotal'];
            $prepared['discount_amount'] = $totals['discount_amount'];
            $prepared['total_amount'] = $totals['total_amount'];
        }

        return $prepared;
    }

    private function createSalesOrderDetails(SalesOrder $salesOrder, array $details): void
    {
        foreach ($details as $detail) {
            $totalPrice = $this->calculateDetailTotalPrice(
                $detail['qty'],
                $detail['unit_price'],
                $detail['discount_type'] ?? null,
                $detail['discount_value'] ?? 0
            );

            $salesOrder->details()->create([
                'product_id' => $detail['product_id'],
                'product_name' => $detail['product_name'],
                'qty' => $detail['qty'],
                'unit_price' => $detail['unit_price'],
                'discount_type' => $detail['discount_type'] ?? null,
                'discount_value' => $detail['discount_value'] ?? 0,
                'total_price' => $totalPrice,
            ]);
        }
    }

    private function calculateTotals(array $details): array
    {
        $subtotal = 0;
        $discountAmount = 0;

        foreach ($details as $detail) {
            $lineTotal = $detail['qty'] * $detail['unit_price'];
            $subtotal += $lineTotal;

            if (isset($detail['discount_type']) && isset($detail['discount_value']) && $detail['discount_type'] !== 'none') {
                if ($detail['discount_type'] === 'percentage') {
                    $discountAmount += $lineTotal * ($detail['discount_value'] / 100);
                } elseif ($detail['discount_type'] === 'amount') {
                    $discountAmount += $detail['discount_value'] * $detail['qty'];
                }
            }
        }

        return [
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'total_amount' => $subtotal - $discountAmount,
        ];
    }

    private function calculateDetailTotalPrice(int $qty, float $unitPrice, ?string $discountType, float $discountValue): float
    {
        $lineTotal = $qty * $unitPrice;

        if ($discountType && $discountValue > 0 && $discountType !== 'none') {
            if ($discountType === 'percentage') {
                $lineTotal -= $lineTotal * ($discountValue / 100);
            } elseif ($discountType === 'amount') {
                $lineTotal -= $discountValue * $qty;
            }
        }

        return max(0, $lineTotal);
    }
}