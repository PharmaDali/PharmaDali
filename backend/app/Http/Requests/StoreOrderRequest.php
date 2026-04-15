<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_method' => ['required', 'in:cash,gcash'],
            'scheduled_pickup_at' => ['nullable', 'date', 'after_or_equal:now'],
            'picked_up_at' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
            'cart_item_ids' => ['required', 'array', 'min:1'],
            'cart_item_ids.*' => ['integer', 'distinct', 'exists:cart_items,id'],
        ];
    }
}
