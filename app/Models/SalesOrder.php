<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'so_number',
        'so_date',
        'customer_id',
        'currency_id',
        'order_type_id',
        'status_type_id',
        'remarks',
        'subtotal',
        'discount_amount',
        'total_amount',
        'pph_id',
        'vat_id',
    ];

    protected $casts = [
        'so_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(SoDetail::class);
    }
}
