<?php

namespace App\Http\Requests;

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
            'action' => ['required', 'string', 'in:approve,ready,complete,pending,reject'],
            'reason' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}