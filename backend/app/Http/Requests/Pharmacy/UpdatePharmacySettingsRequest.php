<?php

namespace App\Http\Requests\Pharmacy;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePharmacySettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pharmacy_name'           => 'sometimes|string|max:255',
            'location'                => 'sometimes|string|max:500',
            'contact_number'          => 'sometimes|string|max:30',
            'email'                   => 'sometimes|nullable|email|max:255',
            'opening_hour'            => 'sometimes|date_format:H:i',
            'closing_hour'            => 'sometimes|date_format:H:i|after:opening_hour',
            'is_active'               => 'sometimes|boolean',
            'is_manually_closed'      => 'sometimes|boolean',
            'low_stock_threshold'     => 'sometimes|integer|min:1|max:100000',
            'shortage_days_threshold' => 'sometimes|integer|min:1|max:365',
            'expiry_days_threshold'   => 'sometimes|integer|min:1|max:365',
            'enable_vat_exemption_discount' => 'sometimes|boolean',
            'allow_otc_discount'            => 'sometimes|boolean',
            'item_exchange_window_days'     => 'sometimes|integer|min:1|max:365',
            'allow_item_exchange'           => 'sometimes|boolean',
            'allow_cash_refund'             => 'sometimes|boolean',
            'printer_name'                  => 'sometimes|nullable|string|max:255',
            'print_after_payment'           => 'sometimes|boolean',
            'receipt_header'                => 'sometimes|nullable|string|max:255',
            'receipt_footer'                => 'sometimes|nullable|string|max:1000',
            'receipt_sort_by'               => 'sometimes|nullable|string|max:100',
            'show_discount_on_receipt'      => 'sometimes|boolean',
            'show_vat_breakdown_on_receipt' => 'sometimes|boolean',
            'enable_online_payment'         => 'sometimes|boolean',
            'gcash_name'                    => ['sometimes', 'required', 'string', 'max:100', 'regex:/^[a-zA-Z0-9\s.\-&\'\(\)]+$/'],
            'gcash_number'                  => ['sometimes', 'required', 'string', 'max:25', 'regex:/^(\+639|09)[\d\s\-]{9,15}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'closing_hour.after'                 => 'The closing hour must be later than the opening hour.',
            'low_stock_threshold.min'            => 'The low stock threshold must be at least 1 unit.',
            'shortage_days_threshold.min'        => 'The shortage days threshold must be at least 1 day.',
            'expiry_days_threshold.min'          => 'The expiry days threshold must be at least 1 day.',
            'gcash_name.required'                => 'The GCash account name is required.',
            'gcash_name.regex'                   => 'The GCash account name contains invalid characters.',
            'gcash_number.required'              => 'The GCash mobile or merchant number is required.',
            'gcash_number.regex'                 => 'Please enter a valid 11-digit mobile number starting with 09 (e.g. 09171234567 or +639171234567).',
        ];
    }
}
