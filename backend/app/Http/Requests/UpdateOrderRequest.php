<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
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
            'payment_method' => ['sometimes', 'in:cash,gcash'],
            'scheduled_pickup_at' => ['sometimes', 'nullable', 'date', 'after_or_equal:now'],
            'note' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'in:cancelled'],
            'reason' => ['required_if:status,cancelled', 'string', 'max:1000'],
        ];
    }
}
