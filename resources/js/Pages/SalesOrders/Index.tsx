import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SimpleLayout from '@/Layouts/SimpleLayout';
import { Button } from '@/Components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/shadcn/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/shadcn/ui/table';
import { Badge } from '@/Components/shadcn/ui/badge';
import { Input } from '@/Components/shadcn/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/shadcn/ui/select';
import { ChevronUpIcon, ChevronDownIcon, TriangleUpIcon, TriangleDownIcon } from '@radix-ui/react-icons';
import AppBreadcrumb from '@/Components/AppBreadcrumb';

interface SalesOrder {
    id: number;
    so_number: string;
    so_date: string;
    customer_id: number;
    currency_id: string;
    order_type_id: number;
    status_type_id: number;
    total_amount: number;
    created_at: string;
    updated_at: string;
    details: SalesOrderDetail[];
}

interface SalesOrderDetail {
    id: number;
    product_id: number;
    product_name: string;
    qty: number;
    unit_price: number;
    discount_type: string | null;
    discount_value: number;
    total_price: number;
}

interface PaginatedSalesOrders {
    data: SalesOrder[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface ReferenceData {
    customers: Array<{ id: number; name: string }>;
    currencies: Array<{ id: string; name: string }>;
    orderTypes: Array<{ id: number; name: string }>;
    statusTypes: Array<{ id: number; name: string }>;
}

interface Filters {
    search?: string;
    customer_id?: string;
    currency_id?: string;
    order_type_id?: string;
    status_type_id?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    salesOrders: PaginatedSalesOrders;
    filters: Filters;
    sortBy: string;
    sortDirection: string;
    perPage: number;
    referenceData: ReferenceData;
}

const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
        'IDR': 'Rp',
        'USD': '$',
        'SGD': 'S$',
    };

    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
};

export default function Index({ salesOrders, filters, sortBy, sortDirection, perPage, referenceData }: Props) {
    const [localFilters, setLocalFilters] = useState<Filters>(filters);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleFilterChange = (key: keyof Filters, value: string) => {
        const newFilters = { ...localFilters, [key]: value || undefined };
        setLocalFilters(newFilters);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            router.get('/sales-orders', {
                ...newFilters,
                sort_by: sortBy,
                sort_direction: sortDirection,
                per_page: perPage
            }, {
                preserveState: true,
                replace: true
            });
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleSort = (column: string) => {
        const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
        router.get('/sales-orders', {
            ...filters,
            sort_by: column,
            sort_direction: newDirection,
            per_page: perPage
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handlePerPageChange = (newPerPage: string) => {
        router.get('/sales-orders', {
            ...filters,
            sort_by: sortBy,
            sort_direction: sortDirection,
            per_page: newPerPage
        }, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get('/sales-orders', {
            sort_by: sortBy,
            sort_direction: sortDirection,
            per_page: perPage
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleDelete = (salesOrder: SalesOrder) => {
        if (confirm(`Are you sure you want to delete Sales Order ${salesOrder.so_number}? This action cannot be undone.`)) {
            router.delete(`/sales-orders/${salesOrder.id}`, {
                onSuccess: () => {
                    // The page will automatically refresh due to the redirect
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete sales order. Please try again.');
                }
            });
        }
    };

    const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
        <TableHead
            className="cursor-pointer hover:bg-muted/50 select-none transition-colors"
            onClick={() => handleSort(column)}
        >
            <div className="flex items-center space-x-1">
                <span>{children}</span>
                <div className="flex flex-col ml-1">
                    {sortBy === column ? (
                        sortDirection === 'asc' ?
                            <ChevronUpIcon className="h-4 w-4 text-primary" /> :
                            <ChevronDownIcon className="h-4 w-4 text-primary" />
                    ) : (
                        <div className="flex flex-col opacity-40 hover:opacity-70 transition-opacity">
                            <TriangleUpIcon className="h-3 w-3 -mb-1" />
                            <TriangleDownIcon className="h-3 w-3" />
                        </div>
                    )}
                </div>
            </div>
        </TableHead>
    );
    return (
        <SimpleLayout>
            <Head title="Sales Orders" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AppBreadcrumb
                        items={[
                            { label: 'Sales Orders', active: true }
                        ]}
                        className="mb-6"
                    />
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl">Sales Orders</CardTitle>
                                    <CardDescription>
                                        Manage and track your sales orders
                                    </CardDescription>
                                </div>
                                <Link href="/sales-orders/create">
                                    <Button className="w-full sm:w-auto">Create New Sales Order</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Filters Section */}
                            <div className="mb-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Input
                                            placeholder="Search SO Number or Remarks..."
                                            value={localFilters.search || ''}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Select value={localFilters.customer_id || 'all'} onValueChange={(value) => handleFilterChange('customer_id', value === 'all' ? '' : value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Customers" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Customers</SelectItem>
                                                {referenceData.customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                                        {customer.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Select value={localFilters.currency_id || 'all'} onValueChange={(value) => handleFilterChange('currency_id', value === 'all' ? '' : value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Currencies" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Currencies</SelectItem>
                                                {referenceData.currencies.map((currency) => (
                                                    <SelectItem key={currency.id} value={currency.id}>
                                                        {currency.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Select value={localFilters.status_type_id || 'all'} onValueChange={(value) => handleFilterChange('status_type_id', value === 'all' ? '' : value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                {referenceData.statusTypes.map((status) => (
                                                    <SelectItem key={status.id} value={status.id.toString()}>
                                                        {status.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
                                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">From:</label>
                                            <Input
                                                type="date"
                                                value={localFilters.date_from || ''}
                                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                                className="w-full sm:w-40"
                                            />
                                        </div>
                                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                                            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">To:</label>
                                            <Input
                                                type="date"
                                                value={localFilters.date_to || ''}
                                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                                className="w-full sm:w-40"
                                            />
                                        </div>
                                        <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                                            Clear Filters
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-start space-x-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
                                        <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="15">15</SelectItem>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">per page</span>
                                    </div>
                                </div>
                            </div>

                            {salesOrders.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground mb-4">No sales orders found.</p>
                                    <Link href="/sales-orders/create">
                                        <Button className="w-full sm:w-auto">Create your first sales order</Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="rounded-md border overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <SortableHeader column="so_number">SO Number</SortableHeader>
                                                    <SortableHeader column="so_date">Date</SortableHeader>
                                                    <SortableHeader column="customer_id">Customer</SortableHeader>
                                                    <TableHead className="hidden sm:table-cell">Order Type</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <SortableHeader column="total_amount">Total Amount</SortableHeader>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {salesOrders.data.map((salesOrder) => (
                                                    <TableRow key={salesOrder.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="min-w-0">
                                                                <div className="truncate">{salesOrder.so_number}</div>
                                                                <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                                                    {referenceData.orderTypes.find(ot => ot.id === salesOrder.order_type_id)?.name || `Order Type ${salesOrder.order_type_id}`}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {new Date(salesOrder.so_date).toLocaleDateString()}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm">
                                                                    {referenceData.customers.find(c => c.id === salesOrder.customer_id)?.name || `Customer ${salesOrder.customer_id}`}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <div className="text-sm">
                                                                {referenceData.orderTypes.find(ot => ot.id === salesOrder.order_type_id)?.name || `Order Type ${salesOrder.order_type_id}`}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    salesOrder.status_type_id === 1
                                                                        ? 'default'
                                                                        : salesOrder.status_type_id === 2
                                                                        ? 'secondary'
                                                                        : 'destructive'
                                                                }
                                                                className="w-16 sm:w-20 justify-center text-xs"
                                                            >
                                                                {referenceData.statusTypes.find(st => st.id === salesOrder.status_type_id)?.name || `Status ${salesOrder.status_type_id}`}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            <div className="text-sm">
                                                                {formatCurrency(salesOrder.total_amount, salesOrder.currency_id)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col sm:flex-row justify-end space-y-1 sm:space-y-0 sm:space-x-2">
                                                                <Link href={`/sales-orders/${salesOrder.id}`}>
                                                                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                                                                        View
                                                                    </Button>
                                                                </Link>
                                                                <Link href={`/sales-orders/${salesOrder.id}/edit`}>
                                                                    <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                                                                        Edit
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="w-full sm:w-auto text-xs"
                                                                    onClick={() => handleDelete(salesOrder)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {salesOrders.last_page > 1 && (
                                        <div className="mt-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                            <div className="text-sm text-muted-foreground text-center sm:text-left">
                                                Showing {salesOrders.from} to {salesOrders.to} of {salesOrders.total} results
                                            </div>
                                            <div className="flex justify-center space-x-2">
                                                {salesOrders.current_page > 1 && (
                                                    <Link href={`/sales-orders?page=${salesOrders.current_page - 1}`}>
                                                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                                            Previous
                                                        </Button>
                                                    </Link>
                                                )}
                                                {salesOrders.current_page < salesOrders.last_page && (
                                                    <Link href={`/sales-orders?page=${salesOrders.current_page + 1}`}>
                                                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                                            Next
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SimpleLayout>
    );
}