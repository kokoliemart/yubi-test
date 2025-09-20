import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import SimpleLayout from '@/Layouts/SimpleLayout';
import { Button } from '@/Components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/shadcn/ui/card';
import { Input } from '@/Components/shadcn/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/shadcn/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/shadcn/ui/table';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import AppBreadcrumb from '@/Components/AppBreadcrumb';

interface ReferenceData {
    customers: Array<{ id: number; name: string }>;
    currencies: Array<{ id: string; name: string }>;
    orderTypes: Array<{ id: number; name: string }>;
    statusTypes: Array<{ id: number; name: string }>;
    products: Array<{ id: number; name: string }>;
    pphOptions: Array<{ id: number; name: string }>;
    vatOptions: Array<{ id: number; name: string }>;
}

interface SalesOrderDetail {
    product_id: number | '';
    product_name: string;
    qty: number | '';
    unit_price: number | '';
    discount_type: 'percentage' | 'amount' | 'none' | '';
    discount_value: number | '';
    total_price: number;
}

interface Props {
    soNumber: string;
    referenceData: ReferenceData;
}

export default function Create({ soNumber, referenceData }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        so_number: soNumber,
        so_date: new Date().toISOString().split('T')[0],
        customer_id: '',
        currency_id: '',
        order_type_id: '',
        status_type_id: '',
        remarks: '',
        pph_id: '',
        vat_id: '',
        details: [] as SalesOrderDetail[],
    });

    const [details, setDetails] = useState<SalesOrderDetail[]>([
        {
            product_id: '',
            product_name: '',
            qty: '',
            unit_price: '',
            discount_type: 'none',
            discount_value: '',
            total_price: 0,
        },
    ]);

    const addDetailRow = () => {
        setDetails([
            ...details,
            {
                product_id: '',
                product_name: '',
                qty: '',
                unit_price: '',
                discount_type: 'none',
                discount_value: '',
                total_price: 0,
            },
        ]);
    };

    const removeDetailRow = (index: number) => {
        if (details.length > 1) {
            const newDetails = details.filter((_, i) => i !== index);
            setDetails(newDetails);
            setData('details', newDetails);
        }
    };

    const updateDetail = (index: number, field: keyof SalesOrderDetail, value: any) => {
        const newDetails = [...details];
        newDetails[index] = { ...newDetails[index], [field]: value };

        if (field === 'product_id') {
            const product = referenceData.products.find(p => p.id === parseInt(value));
            if (product) {
                newDetails[index].product_name = product.name;
            }
        }

        if (['qty', 'unit_price', 'discount_type', 'discount_value'].includes(field)) {
            const detail = newDetails[index];
            const qty = typeof detail.qty === 'number' ? detail.qty : parseInt(detail.qty as string) || 0;
            const unitPrice = typeof detail.unit_price === 'number' ? detail.unit_price : parseFloat(detail.unit_price as string) || 0;
            const discountValue = typeof detail.discount_value === 'number' ? detail.discount_value : parseFloat(detail.discount_value as string) || 0;

            let totalPrice = qty * unitPrice;

            if (detail.discount_type && detail.discount_type !== 'none' && discountValue > 0) {
                if (detail.discount_type === 'percentage') {
                    totalPrice -= totalPrice * (discountValue / 100);
                } else {
                    totalPrice -= discountValue * qty;
                }
            }

            newDetails[index].total_price = Math.max(0, totalPrice);
        }

        setDetails(newDetails);
        setData('details', newDetails);
    };

    const calculateTotals = () => {
        const subtotal = details.reduce((sum, detail) => {
            const qty = typeof detail.qty === 'number' ? detail.qty : parseInt(detail.qty as string) || 0;
            const unitPrice = typeof detail.unit_price === 'number' ? detail.unit_price : parseFloat(detail.unit_price as string) || 0;
            return sum + (qty * unitPrice);
        }, 0);

        const discountAmount = details.reduce((sum, detail) => {
            const qty = typeof detail.qty === 'number' ? detail.qty : parseInt(detail.qty as string) || 0;
            const unitPrice = typeof detail.unit_price === 'number' ? detail.unit_price : parseFloat(detail.unit_price as string) || 0;
            const discountValue = typeof detail.discount_value === 'number' ? detail.discount_value : parseFloat(detail.discount_value as string) || 0;

            if (detail.discount_type && detail.discount_type !== 'none' && discountValue > 0) {
                if (detail.discount_type === 'percentage') {
                    return sum + (qty * unitPrice * (discountValue / 100));
                } else {
                    return sum + (discountValue * qty);
                }
            }
            return sum;
        }, 0);

        return {
            subtotal,
            discountAmount,
            totalAmount: subtotal - discountAmount,
        };
    };

    const { subtotal, discountAmount, totalAmount } = calculateTotals();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setData('details', details);
        post(route('sales-orders.store'));
    };

    return (
        <SimpleLayout>
            <Head title="Create Sales Order" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <AppBreadcrumb
                        items={[
                            { label: 'Sales Orders', href: '/sales-orders' },
                            { label: 'Create', active: true }
                        ]}
                        className="mb-6"
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl">Create Sales Order</CardTitle>
                            <CardDescription>
                                Create a new sales order with customer details and line items
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-8">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg sm:text-xl">Order Information</CardTitle>
                                        <CardDescription>Basic details for the sales order</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <InputLabel htmlFor="so_number" value="SO Number" />
                                            <Input
                                                id="so_number"
                                                name="so_number"
                                                value={data.so_number}
                                                readOnly
                                                className="bg-muted"
                                            />
                                            <InputError message={errors.so_number} />
                                        </div>

                                        <div className="space-y-2">
                                            <InputLabel htmlFor="so_date" value="SO Date" />
                                            <Input
                                                id="so_date"
                                                name="so_date"
                                                type="date"
                                                value={data.so_date}
                                                onChange={(e) => setData('so_date', e.target.value)}
                                            />
                                            <InputError message={errors.so_date} />
                                        </div>

                                        <div className="space-y-2">
                                            <InputLabel htmlFor="customer_id" value="Customer" />
                                            <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {referenceData.customers.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.customer_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <InputLabel htmlFor="currency_id" value="Currency" />
                                            <Select value={data.currency_id} onValueChange={(value) => setData('currency_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {referenceData.currencies.map((currency) => (
                                                        <SelectItem key={currency.id} value={currency.id}>
                                                            {currency.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.currency_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <InputLabel htmlFor="order_type_id" value="Order Type" />
                                            <Select value={data.order_type_id} onValueChange={(value) => setData('order_type_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Order Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {referenceData.orderTypes.map((orderType) => (
                                                        <SelectItem key={orderType.id} value={orderType.id.toString()}>
                                                            {orderType.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.order_type_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <InputLabel htmlFor="status_type_id" value="Status" />
                                            <Select value={data.status_type_id} onValueChange={(value) => setData('status_type_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {referenceData.statusTypes.map((statusType) => (
                                                        <SelectItem key={statusType.id} value={statusType.id.toString()}>
                                                            {statusType.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.status_type_id} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="pph_id" value="PPH" />
                                        <Select value={data.pph_id || 'none'} onValueChange={(value) => setData('pph_id', value === 'none' ? '' : value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select PPH" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No PPH</SelectItem>
                                                {referenceData.pphOptions.map((pph) => (
                                                    <SelectItem key={pph.id} value={pph.id.toString()}>
                                                        {pph.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.pph_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel htmlFor="vat_id" value="VAT" />
                                        <Select value={data.vat_id || 'none'} onValueChange={(value) => setData('vat_id', value === 'none' ? '' : value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select VAT" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No VAT</SelectItem>
                                                {referenceData.vatOptions.map((vat) => (
                                                    <SelectItem key={vat.id} value={vat.id.toString()}>
                                                        {vat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.vat_id} />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="remarks" value="Remarks" />
                                    <textarea
                                        id="remarks"
                                        name="remarks"
                                        value={data.remarks}
                                        onChange={(e) => setData('remarks', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        rows={3}
                                    />
                                    <InputError message={errors.remarks} className="mt-2" />
                                </div>

                                {/* Order Details */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                                            <div>
                                                <CardTitle className="text-lg sm:text-xl">Order Details</CardTitle>
                                                <CardDescription>Add line items to the sales order</CardDescription>
                                            </div>
                                            <Button type="button" onClick={addDetailRow} variant="outline" className="w-full sm:w-auto">
                                                Add Item
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead>Qty</TableHead>
                                                        <TableHead>Unit Price</TableHead>
                                                        <TableHead>Discount Type</TableHead>
                                                        <TableHead>Discount Value</TableHead>
                                                        <TableHead>Total Price</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {details.map((detail, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="min-w-48">
                                                                <Select
                                                                    value={detail.product_id?.toString() || ''}
                                                                    onValueChange={(value) => updateDetail(index, 'product_id', parseInt(value))}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select Product" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {referenceData.products.map((product) => (
                                                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                                                {product.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell className="min-w-20">
                                                                <Input
                                                                    type="number"
                                                                    value={detail.qty}
                                                                    onChange={(e) => updateDetail(index, 'qty', parseInt(e.target.value))}
                                                                    min="1"
                                                                    className="w-full min-w-16"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="min-w-32">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={detail.unit_price}
                                                                    onChange={(e) => updateDetail(index, 'unit_price', parseFloat(e.target.value))}
                                                                    min="0"
                                                                    className="w-full min-w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="min-w-36">
                                                                <Select
                                                                    value={detail.discount_type || ''}
                                                                    onValueChange={(value) => updateDetail(index, 'discount_type', value)}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="No Discount" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="none">None</SelectItem>
                                                                        <SelectItem value="percentage">%</SelectItem>
                                                                        <SelectItem value="amount">Amount</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell className="min-w-24">
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={detail.discount_value}
                                                                    onChange={(e) => updateDetail(index, 'discount_value', parseFloat(e.target.value))}
                                                                    min="0"
                                                                    disabled={!detail.discount_type || detail.discount_type === 'none'}
                                                                    className="w-full min-w-20"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="font-medium min-w-24">
                                                                <div className="text-sm">
                                                                    {detail.total_price.toFixed(2)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right min-w-24">
                                                                {details.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => removeDetailRow(index)}
                                                                        className="w-full text-xs"
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Totals */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <div className="text-center sm:text-left">
                                            <span className="font-medium">Subtotal: </span>
                                            <span>{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <span className="font-medium">Discount: </span>
                                            <span>{discountAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="text-lg font-bold text-center sm:text-left">
                                            <span>Total: </span>
                                            <span>{totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-end sm:space-y-0 sm:space-x-4">
                                    <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-full sm:w-auto">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                        Create Sales Order
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SimpleLayout>
    );
}