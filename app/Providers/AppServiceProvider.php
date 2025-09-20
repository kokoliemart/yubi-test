<?php

namespace App\Providers;

use App\Repositories\Contracts\SalesOrderRepositoryInterface;
use App\Repositories\Eloquent\SalesOrderRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SalesOrderRepositoryInterface::class, SalesOrderRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
