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
            'action' => ['required', 'in:approve,pending,reject'],
            'reason' => ['required_if:action,reject', 'string', 'max:255'],
        ];
    }
}