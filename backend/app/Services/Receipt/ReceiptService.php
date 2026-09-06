<?php

namespace App\Services\Receipt;

use App\Models\Order;
use Illuminate\Support\Carbon;

class ReceiptService
{
    /**
     * Build the full receipt payload for an order.
     *
     * Returns structured data only — formatting is handled by the frontend.
     *
     * @param  Order  $order  Must be loaded with: pharmacy, items, verifier, customer.user
     * @return array
     */
    public function buildReceiptData(Order $order): array
    {
        $pharmacy = $order->pharmacy;
        $items    = $order->items;

        // --- Totals ---
        $rawSubtotal    = (float) ($order->subtotal > 0 ? $order->subtotal : $items->sum('line_total'));
        $discountAmount = (float) ($order->discount_amount ?? 0);
        $totalAmount    = (float) ($order->total_amount > 0 ? $order->total_amount : max(0, $rawSubtotal - $discountAmount));
        $vatAmount      = 0.00;
        $netSubtotal    = $totalAmount;

        if ($pharmacy && $pharmacy->vat_type === 'vat') {
            // Philippine BIR VAT-inclusive: VAT is embedded in net amount.
            $netSubtotal = round($totalAmount / 1.12, 2);
            $vatAmount   = round($totalAmount - $netSubtotal, 2);
        }

        $itemsSold = $items->sum('quantity');

        // Format discount type label for display
        $discountTypeLabel = match(strtolower($order->discount_type ?? 'none')) {
            'senior', 'senior_citizen' => 'Senior Citizen',
            'pwd' => 'PWD',
            'employee' => 'Employee',
            'custom' => 'Custom Discount',
            default => 'None'
        };

        // --- Cashier name ---
        $cashierName = 'N/A';
        if ($order->verifier) {
            $cashierName = trim($order->verifier->first_name . ' ' . $order->verifier->last_name);
        }

        // --- Customer name ---
        $customerName = 'Walk-in';
        if ($order->customer && $order->customer->user) {
            $user         = $order->customer->user;
            $customerName = trim($user->first_name . ' ' . $user->last_name);
        }

        // --- Item Sorting according to pharmacy settings ---
        $sortBy = $pharmacy?->receipt_sort_by ?? 'By Added Order';
        $sortedItems = match ($sortBy) {
            'By Product Name (A–Z)' => $items->sortBy('product_name', SORT_NATURAL | SORT_FLAG_CASE),
            'By Category'           => $items->sortBy(fn($item) => $item->pharmacyProduct?->category?->category_name ?? ''),
            'By Price (Low to High)'=> $items->sortBy('unit_price_snapshot'),
            'By Price (High to Low)'=> $items->sortByDesc('unit_price_snapshot'),
            default                 => $items,
        };

        // --- Timestamps ---
        $completedAt = $order->completed_at ?? $order->placed_at ?? now();
        $receiptDate = Carbon::parse($completedAt)->format('F j, Y');
        $receiptTime = Carbon::parse($completedAt)->format('g:i A');

        return [
            'pharmacy' => [
                'name'             => $pharmacy?->pharmacy_name  ?? 'PharmaDali',
                'address'          => $pharmacy?->location       ?? null,
                'tin'              => $pharmacy?->tin             ?? null,
                'vat_type'         => $pharmacy?->vat_type === 'non_vat' ? 'Non-VAT' : 'VAT Registered',
                'contact_number'   => $pharmacy?->contact_number ?? null,
                'bir_permit_no'    => $pharmacy?->bir_permit_no  ?? null,
                'permit_issued_at' => $pharmacy?->permit_issued_at
                    ? Carbon::parse($pharmacy->permit_issued_at)->format('F j, Y')
                    : null,
                'ptu_valid_until'  => $pharmacy?->ptu_valid_until
                    ? Carbon::parse($pharmacy->ptu_valid_until)->format('F j, Y')
                    : null,
                'machine_no'       => $pharmacy?->machine_no       ?? null,
                'serial_no'        => $pharmacy?->serial_no        ?? null,
                'accreditation_no' => $pharmacy?->accreditation_no ?? null,
            ],
            'receipt_settings' => [
                'header'                => $pharmacy?->receipt_header ?: ($pharmacy?->pharmacy_name ?? 'PharmaDali'),
                'footer'                => $pharmacy?->receipt_footer ?? 'Thank you for choosing PharmaDali! Get well soon.',
                'printer_name'          => $pharmacy?->printer_name ?? 'POS Thermal Printer (USB)',
                'print_after_payment'   => (bool) ($pharmacy?->print_after_payment ?? true),
                'show_discount'         => (bool) ($pharmacy?->show_discount_on_receipt ?? true),
                'show_vat_breakdown'    => (bool) ($pharmacy?->show_vat_breakdown_on_receipt ?? true),
                'sort_by'               => $sortBy,
            ],
            'invoice' => [
                'invoice_no' => $order->order_number,
                'date'       => $receiptDate,
                'time'       => $receiptTime,
                'cashier'    => $cashierName,
                'customer'   => $customerName,
            ],
            'items' => $sortedItems->map(fn($item) => [
                'qty'        => (int) $item->quantity,
                'name'       => $item->product_name,
                'unit_price' => (float) $item->unit_price_snapshot,
                'line_total' => (float) $item->line_total,
            ])->values()->all(),
            'discount' => [
                'type'             => $discountTypeLabel,
                'raw_type'         => $order->discount_type ?? 'none',
                'percentage'       => (float) ($order->discount_percentage ?? 0),
                'id_number'        => $order->discount_id_number ?? null,
                'remarks'          => $order->discount_remarks ?? null,
                'amount'           => $discountAmount,
            ],
            'totals' => [
                'subtotal'        => $rawSubtotal,
                'net_subtotal'    => $netSubtotal,
                'vat_amount'      => $vatAmount,
                'discount_amount' => $discountAmount,
                'total_amount'    => $totalAmount,
                'items_sold'      => (int) $itemsSold,
            ],
            'payment' => [
                'method'          => ucfirst($order->payment_method ?? 'cash'),
                'amount_received' => (float) ($order->amount_received ?? $totalAmount),
                'change_amount'   => (float) ($order->change_amount ?? 0),
            ],
        ];
    }
}
