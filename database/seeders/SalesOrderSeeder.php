<?php

namespace Database\Seeders;

use App\Models\SalesOrder;
use App\Models\SoDetail;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SalesOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [1, 2, 3]; // Customer A, B, C
        $currencies = ['IDR', 'USD', 'SGD'];
        $orderTypes = [1, 2, 3]; // Sales, Sewa, Maintenance
        $statusTypes = [1, 2, 3]; // Open, Closed, Cancelled
        $products = [
            1 => 'PC Server',
            2 => 'Laptop',
            3 => 'Printer',
            4 => 'Monitor',
            5 => 'Keyboard'
        ];
        $pphOptions = [1, 2, 3]; // PPH 21, 23, 25
        $vatOptions = [1, 2]; // PPN 11%, 10%

        // Create 15 sample sales orders
        for ($i = 1; $i <= 15; $i++) {
            $soDate = now()->subDays(rand(0, 30));
            $customerId = $customers[array_rand($customers)];
            $currencyId = $currencies[array_rand($currencies)];
            $orderTypeId = $orderTypes[array_rand($orderTypes)];
            $statusTypeId = $statusTypes[array_rand($statusTypes)];

            // Generate SO Number
            $soNumber = 'SO' . $soDate->format('Ymd') . sprintf('%04d', $i);

            // Create sales order first to get totals
            $details = [];
            $subtotal = 0;
            $discountAmount = 0;

            // Generate 1-5 line items per order
            $itemCount = rand(1, 5);
            for ($j = 0; $j < $itemCount; $j++) {
                $productIds = array_keys($products);
                $productId = $productIds[array_rand($productIds)];
                $productName = $products[$productId];
                $qty = rand(1, 10);
                $unitPrice = rand(100, 10000);

                // Random discount (30% chance)
                $discountType = rand(1, 10) <= 3 ? (rand(0, 1) ? 'percentage' : 'amount') : null;
                $discountValue = 0;

                if ($discountType) {
                    $discountValue = $discountType === 'percentage' ? rand(5, 25) : rand(50, 500);
                }

                $lineTotal = $qty * $unitPrice;
                $subtotal += $lineTotal;

                if ($discountType && $discountValue > 0) {
                    if ($discountType === 'percentage') {
                        $lineDiscount = $lineTotal * ($discountValue / 100);
                    } else {
                        $lineDiscount = $discountValue * $qty;
                    }
                    $discountAmount += $lineDiscount;
                    $totalPrice = $lineTotal - $lineDiscount;
                } else {
                    $totalPrice = $lineTotal;
                }

                $details[] = [
                    'product_id' => $productId,
                    'product_name' => $productName,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'discount_type' => $discountType,
                    'discount_value' => $discountValue,
                    'total_price' => max(0, $totalPrice),
                ];
            }

            $totalAmount = $subtotal - $discountAmount;

            // Create the sales order
            $salesOrder = SalesOrder::create([
                'so_number' => $soNumber,
                'so_date' => $soDate->format('Y-m-d'),
                'customer_id' => $customerId,
                'currency_id' => $currencyId,
                'order_type_id' => $orderTypeId,
                'status_type_id' => $statusTypeId,
                'remarks' => rand(1, 3) === 1 ? 'Sample remarks for order ' . $soNumber : null,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'pph_id' => rand(1, 4) === 1 ? $pphOptions[array_rand($pphOptions)] : null,
                'vat_id' => rand(1, 3) === 1 ? $vatOptions[array_rand($vatOptions)] : null,
            ]);

            // Create the details
            foreach ($details as $detail) {
                SoDetail::create([
                    'sales_order_id' => $salesOrder->id,
                    'product_id' => $detail['product_id'],
                    'product_name' => $detail['product_name'],
                    'qty' => $detail['qty'],
                    'unit_price' => $detail['unit_price'],
                    'discount_type' => $detail['discount_type'],
                    'discount_value' => $detail['discount_value'],
                    'total_price' => $detail['total_price'],
                ]);
            }
        }
    }
}
