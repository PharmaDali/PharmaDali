<?php

namespace App\Http\Requests\Pos;

use Illuminate\Foundation\Http\FormRequest;

class StorePosOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('payment_method')) {
            $pm = $this->payment_method;
            if (is_array($pm)) {
                $pm = $pm['id'] ?? $pm['value'] ?? 'cash';
            }
            if (is_string($pm)) {
                $this->merge([
                    'payment_method' => strtolower($pm),
                ]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:pharmacy_products,id',
            'items.*.qty' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'discount_type' => 'nullable|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_id_number' => 'nullable|string|max:100',
            'discount_remarks' => 'nullable|string|max:255',
            'amount_received' => 'nullable|numeric|min:0',
            'change_amount' => 'nullable|numeric|min:0',
            'note' => 'nullable|string|max:255',
        ];
    }
}
