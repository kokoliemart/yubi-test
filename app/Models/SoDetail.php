<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SoDetail extends Model
{
    use HasFactory;

    protected $table = 'so_dts';

    protected $fillable = [
        'sales_order_id',
        'product_id',
        'product_name',
        'qty',
        'unit_price',
        'discount_type',
        'discount_value',
        'total_price',
    ];

    protected $casts = [
        'qty' => 'integer',
        'unit_price' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }
}
