<?php

namespace App\Http\Requests\Pos;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemExchangeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'order_id' => 'required',
            'returned_items' => 'required|array|min:1',
            'returned_items.*.order_item_id' => 'required|exists:order_items,id',
            'returned_items.*.quantity' => 'required|integer|min:1',
            'returned_items.*.condition' => 'nullable|string|in:resalable,damaged,expired',
            'replacement_items' => 'required|array|min:1',
            'replacement_items.*.pharmacy_product_id' => 'required|exists:pharmacy_products,id',
            'replacement_items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string',
            'amount_received' => 'nullable|numeric|min:0',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ];
    }
}
