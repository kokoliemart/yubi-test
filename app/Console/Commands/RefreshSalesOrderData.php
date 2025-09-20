<?php

namespace App\Console\Commands;

use App\Models\SalesOrder;
use App\Models\SoDetail;
use Database\Seeders\SalesOrderSeeder;
use Illuminate\Console\Command;

class RefreshSalesOrderData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales-orders:refresh';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all sales order data and reseed with fresh sample data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Clearing existing sales order data...');

        // Delete all existing data
        SoDetail::truncate();
        SalesOrder::truncate();

        $this->info('Seeding fresh sales order data...');

        // Run the seeder
        $this->call('db:seed', ['--class' => 'SalesOrderSeeder']);

        $this->info('Sales order data refreshed successfully!');
        $this->info('15 sample sales orders with line items have been created.');
    }
}
