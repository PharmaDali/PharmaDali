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
            'low_stock_threshold'     => 'sometimes|integer|min:1|max:100000',
            'shortage_days_threshold' => 'sometimes|integer|min:1|max:365',
            'expiry_days_threshold'   => 'sometimes|integer|min:1|max:365',
            'enable_vat_exemption_discount' => 'sometimes|boolean',
            'allow_otc_discount'            => 'sometimes|boolean',
            'item_exchange_window_days'     => 'sometimes|integer|min:1|max:365',
            'allow_item_exchange'           => 'sometimes|boolean',
            'allow_cash_refund'             => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'closing_hour.after'                 => 'The closing hour must be later than the opening hour.',
            'low_stock_threshold.min'            => 'The low stock threshold must be at least 1 unit.',
            'shortage_days_threshold.min'        => 'The shortage days threshold must be at least 1 day.',
            'expiry_days_threshold.min'          => 'The expiry days threshold must be at least 1 day.',
        ];
    }
}
