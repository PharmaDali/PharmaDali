<?php

namespace App\Http\Requests\Discount;

use Illuminate\Foundation\Http\FormRequest;

class StoreDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'percentage' => 'required|numeric|min:0|max:100',
            'requires_id_number' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string|max:500',
        ];
    }
}
