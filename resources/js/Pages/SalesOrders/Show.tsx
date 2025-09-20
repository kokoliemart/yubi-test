import { Head, Link, router } from '@inertiajs/react';
import SimpleLayout from '@/Layouts/SimpleLayout';
import { Button } from '@/Components/shadcn/ui/button';
import AppBreadcrumb from '@/Components/AppBreadcrumb';

interface SalesOrder {
    id: number;
    so_number: string;
    so_date: string;
    customer_id: number;
    currency_id: string;
    order_type_id: number;
    status_type_id: number;
    remarks: string | null;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    pph_id: number | null;
    vat_id: number | null;
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

interface ReferenceData {
    customers: Array<{ id: number; name: string }>;
    currencies: Array<{ id: string; name: string }>;
    orderTypes: Array<{ id: number; name: string }>;
    statusTypes: Array<{ id: number; name: string }>;
    products: Array<{ id: number; name: string }>;
    pphOptions: Array<{ id: number; name: string }>;
    vatOptions: Array<{ id: number; name: string }>;
}

interface Props {
    salesOrder: SalesOrder;
    referenceData: ReferenceData;
}

const getReferenceDataName = (data: any[], id: number | string) => {
    const item = data.find(item => item.id === id);
    return item ? item.name : id;
};

const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
        'IDR': 'Rp',
        'USD': '$',
        'SGD': 'S$',
    };

    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
};

export default function Show({ salesOrder, referenceData }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete Sales Order ${salesOrder.so_number}? This action cannot be undone.`)) {
            router.delete(`/sales-orders/${salesOrder.id}`, {
                onSuccess: () => {
                    // Will redirect to index page
                },
                onError: (errors) => {
                    console.error('Delete failed:', errors);
                    alert('Failed to delete sales order. Please try again.');
                }
            });
        }
    };

    return (
        <SimpleLayout>
            <Head title={`Sales Order ${salesOrder.so_number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AppBreadcrumb
                        items={[
                            { label: 'Sales Orders', href: '/sales-orders' },
                            { label: salesOrder.so_number, active: true }
                        ]}
                        className="mb-6"
                    />
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Sales Order #{salesOrder.so_number}</h2>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                    <Link href="/sales-orders">
                                        <Button variant="outline" className="w-full sm:w-auto">Back to List</Button>
                                    </Link>
                                    <Link href={`/sales-orders/${salesOrder.id}/edit`}>
                                        <Button className="w-full sm:w-auto">Edit</Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        className="w-full sm:w-auto"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            {/* Header Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">SO Number</label>
                                        <p className="mt-1 text-sm text-gray-900">{salesOrder.so_number}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">SO Date</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {new Date(salesOrder.so_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Customer</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {getReferenceDataName(referenceData.customers, salesOrder.customer_id)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {getReferenceDataName(referenceData.currencies, salesOrder.currency_id)}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Order Type</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {getReferenceDataName(referenceData.orderTypes, salesOrder.order_type_id)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            salesOrder.status_type_id === 1
                                                ? 'bg-green-100 text-green-800'
                                                : salesOrder.status_type_id === 2
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {getReferenceDataName(referenceData.statusTypes, salesOrder.status_type_id)}
                                        </span>
                                    </div>
                                    {salesOrder.pph_id && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">PPH</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {getReferenceDataName(referenceData.pphOptions, salesOrder.pph_id)}
                                            </p>
                                        </div>
                                    )}
                                    {salesOrder.vat_id && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">VAT</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {getReferenceDataName(referenceData.vatOptions, salesOrder.vat_id)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {salesOrder.remarks && (
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                        {salesOrder.remarks}
                                    </p>
                                </div>
                            )}

                            {/* Order Details */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium mb-4">Order Details</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Qty
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Unit Price
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                                    Discount
                                                </th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total Price
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {salesOrder.details.map((detail) => (
                                                <tr key={detail.id}>
                                                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                                                        <div className="font-medium">{detail.product_name}</div>
                                                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                                                            Discount: {detail.discount_type && detail.discount_value > 0 ? (
                                                                detail.discount_type === 'percentage'
                                                                    ? `${detail.discount_value}%`
                                                                    : formatCurrency(detail.discount_value, salesOrder.currency_id)
                                                            ) : (
                                                                'No discount'
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {detail.qty}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(detail.unit_price, salesOrder.currency_id)}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                                                        {detail.discount_type && detail.discount_value > 0 ? (
                                                            <span>
                                                                {detail.discount_type === 'percentage'
                                                                    ? `${detail.discount_value}%`
                                                                    : formatCurrency(detail.discount_value, salesOrder.currency_id)
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">No discount</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(detail.total_price, salesOrder.currency_id)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="text-center sm:text-left">
                                        <label className="block text-sm font-medium text-gray-700">Subtotal</label>
                                        <p className="mt-1 text-lg text-gray-900">
                                            {formatCurrency(salesOrder.subtotal, salesOrder.currency_id)}
                                        </p>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <label className="block text-sm font-medium text-gray-700">Discount Amount</label>
                                        <p className="mt-1 text-lg text-gray-900">
                                            {formatCurrency(salesOrder.discount_amount, salesOrder.currency_id)}
                                        </p>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                                        <p className="mt-1 text-xl font-bold text-gray-900">
                                            {formatCurrency(salesOrder.total_amount, salesOrder.currency_id)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                                    <div className="text-center sm:text-left">
                                        <span className="font-medium">Created:</span> {new Date(salesOrder.created_at).toLocaleString()}
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <span className="font-medium">Last Updated:</span> {new Date(salesOrder.updated_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleLayout>
    );
}