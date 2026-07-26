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
        $totalAmount    = (float) $order->total_amount;
        $discountAmount = (float) ($order->discount_amount ?? 0);
        $vatAmount      = 0.00;
        $subtotal       = $totalAmount;

        if ($pharmacy && $pharmacy->vat_type === 'vat') {
            // Philippine BIR VAT-inclusive: VAT is embedded in the selling price.
            // VAT-exclusive base = total / 1.12
            $subtotal  = round($totalAmount / 1.12, 2);
            $vatAmount = round($totalAmount - $subtotal, 2);
        }

        $itemsSold = $items->sum('quantity');

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
            'invoice' => [
                'invoice_no' => $order->order_number,
                'date'       => $receiptDate,
                'time'       => $receiptTime,
                'cashier'    => $cashierName,
                'customer'   => $customerName,
            ],
            'items' => $items->map(fn($item) => [
                'qty'        => (int) $item->quantity,
                'name'       => $item->product_name,
                'unit_price' => (float) $item->unit_price_snapshot,
                'line_total' => (float) $item->line_total,
            ])->values()->all(),
            'totals' => [
                'subtotal'        => $subtotal,
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
