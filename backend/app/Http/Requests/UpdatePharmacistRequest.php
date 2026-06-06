<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePharmacistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('pharmacist');

        return [
            'first_name'     => ['sometimes', 'string', 'max:255'],
            'last_name'      => ['sometimes', 'string', 'max:255'],
            'email'          => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'mobile_number'  => ['sometimes', 'string', 'max:20'],
            'date_of_birth'  => ['nullable', 'date'],
            'address'        => ['nullable', 'string', 'max:255'],
            'is_active'      => ['sometimes', 'boolean'],
            'license_number' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already taken.',
        ];
    }
}
