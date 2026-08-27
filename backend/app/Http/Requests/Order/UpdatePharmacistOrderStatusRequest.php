<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePharmacistOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action'  => ['required', 'string', 'in:approve,ready,pending,out_pending,reject'],
            'section' => ['sometimes', 'nullable', 'string', 'in:prescription,discount,receipt'],
            'reason'  => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}