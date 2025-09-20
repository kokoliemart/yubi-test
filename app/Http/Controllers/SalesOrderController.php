<?php

namespace App\Http\Controllers;

use App\Services\SalesOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class SalesOrderController extends Controller
{
    public function __construct(
        private SalesOrderService $salesOrderService
    ) {
    }

    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->get('search'),
            'customer_id' => $request->get('customer_id'),
            'currency_id' => $request->get('currency_id'),
            'order_type_id' => $request->get('order_type_id'),
            'status_type_id' => $request->get('status_type_id'),
            'date_from' => $request->get('date_from'),
            'date_to' => $request->get('date_to'),
        ];

        $sortBy = $request->get('sort_by', 'so_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $perPage = $request->get('per_page', 15);

        $salesOrders = $this->salesOrderService->getPaginatedSalesOrders($perPage, $filters, $sortBy, $sortDirection);

        return Inertia::render('SalesOrders/Index', [
            'salesOrders' => $salesOrders,
            'filters' => $filters,
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection,
            'perPage' => $perPage,
            'referenceData' => $this->getReferenceData(),
        ]);
    }

    public function create(): Response
    {
        $soNumber = $this->salesOrderService->generateSoNumber();

        return Inertia::render('SalesOrders/Create', [
            'soNumber' => $soNumber,
            'referenceData' => $this->getReferenceData(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validatedData = $request->validate([
            'so_date' => 'required|date',
            'customer_id' => 'required|integer',
            'currency_id' => 'required|string|max:3',
            'order_type_id' => 'required|integer',
            'status_type_id' => 'required|integer',
            'remarks' => 'nullable|string',
            'pph_id' => 'nullable|integer',
            'vat_id' => 'nullable|integer',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|integer',
            'details.*.product_name' => 'required|string',
            'details.*.qty' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
            'details.*.discount_type' => 'nullable|in:percentage,amount,none',
            'details.*.discount_value' => 'nullable|numeric|min:0',
        ]);

        $salesOrder = $this->salesOrderService->createSalesOrder($validatedData);

        return redirect()->route('sales-orders.show', $salesOrder->id)
            ->with('success', 'Sales order created successfully.');
    }

    public function show(int $id): Response
    {
        $salesOrder = $this->salesOrderService->getSalesOrderById($id);

        if (!$salesOrder) {
            abort(404);
        }

        return Inertia::render('SalesOrders/Show', [
            'salesOrder' => $salesOrder,
            'referenceData' => $this->getReferenceData(),
        ]);
    }

    public function edit(int $id): Response
    {
        $salesOrder = $this->salesOrderService->getSalesOrderById($id);

        if (!$salesOrder) {
            abort(404);
        }

        return Inertia::render('SalesOrders/Edit', [
            'salesOrder' => $salesOrder,
            'referenceData' => $this->getReferenceData(),
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validatedData = $request->validate([
            'so_date' => 'required|date',
            'customer_id' => 'required|integer',
            'currency_id' => 'required|string|max:3',
            'order_type_id' => 'required|integer',
            'status_type_id' => 'required|integer',
            'remarks' => 'nullable|string',
            'pph_id' => 'nullable|integer',
            'vat_id' => 'nullable|integer',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|integer',
            'details.*.product_name' => 'required|string',
            'details.*.qty' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
            'details.*.discount_type' => 'nullable|in:percentage,amount,none',
            'details.*.discount_value' => 'nullable|numeric|min:0',
        ]);

        $salesOrder = $this->salesOrderService->updateSalesOrder($id, $validatedData);

        return redirect()->route('sales-orders.show', $salesOrder->id)
            ->with('success', 'Sales order updated successfully.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $this->salesOrderService->deleteSalesOrder($id);

        return redirect()->route('sales-orders.index')
            ->with('success', 'Sales order deleted successfully.');
    }

    private function getReferenceData(): array
    {
        return [
            'customers' => [
                ['id' => 1, 'name' => 'Customer A'],
                ['id' => 2, 'name' => 'Customer B'],
                ['id' => 3, 'name' => 'Customer C'],
            ],
            'currencies' => [
                ['id' => 'IDR', 'name' => 'Indonesian Rupiah'],
                ['id' => 'USD', 'name' => 'US Dollar'],
                ['id' => 'SGD', 'name' => 'Singapore Dollar'],
            ],
            'orderTypes' => [
                ['id' => 1, 'name' => 'Sales'],
                ['id' => 2, 'name' => 'Sewa'],
                ['id' => 3, 'name' => 'Maintenance'],
            ],
            'statusTypes' => [
                ['id' => 1, 'name' => 'Open'],
                ['id' => 2, 'name' => 'Closed'],
                ['id' => 3, 'name' => 'Cancelled'],
            ],
            'products' => [
                ['id' => 1, 'name' => 'PC Server'],
                ['id' => 2, 'name' => 'Laptop'],
                ['id' => 3, 'name' => 'Printer'],
                ['id' => 4, 'name' => 'Monitor'],
                ['id' => 5, 'name' => 'Keyboard'],
            ],
            'pphOptions' => [
                ['id' => 1, 'name' => 'PPH 21'],
                ['id' => 2, 'name' => 'PPH 23'],
                ['id' => 3, 'name' => 'PPH 25'],
            ],
            'vatOptions' => [
                ['id' => 1, 'name' => 'PPN 11%'],
                ['id' => 2, 'name' => 'PPN 10%'],
            ],
        ];
    }
}
