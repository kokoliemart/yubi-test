<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For PostgreSQL, we need to use raw SQL to alter enum type
        DB::statement("ALTER TABLE so_dts DROP CONSTRAINT so_dts_discount_type_check");
        DB::statement("ALTER TABLE so_dts ADD CONSTRAINT so_dts_discount_type_check CHECK (discount_type IN ('percentage', 'amount', 'none'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original constraint
        DB::statement("ALTER TABLE so_dts DROP CONSTRAINT so_dts_discount_type_check");
        DB::statement("ALTER TABLE so_dts ADD CONSTRAINT so_dts_discount_type_check CHECK (discount_type IN ('percentage', 'amount'))");
    }
};
