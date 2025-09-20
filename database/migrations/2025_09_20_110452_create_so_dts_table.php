<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('so_dts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_order_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('product_id');
            $table->string('product_name');
            $table->integer('qty');
            $table->decimal('unit_price', 15, 2);
            $table->enum('discount_type', ['percentage', 'amount'])->nullable();
            $table->decimal('discount_value', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('so_dts');
    }
};
