<?php

namespace App\Http\Requests;

use App\Models\Pharmacist;
use Illuminate\Foundation\Http\FormRequest;

class PharmacistRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('create', Pharmacist::class);
    }

    public function rules(): array
    {
        return [
            'first_name'      => ['required', 'string', 'max:255'],
            'last_name'       => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'max:255', 'unique:users,email'],
            'mobile_number'   => ['required', 'string', 'max:20'],
            'date_of_birth'   => ['nullable', 'date'],
            'address'         => ['nullable', 'string', 'max:255'],
            'license_number'  => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'      => 'First name is required.',
            'last_name.required'       => 'Last name is required.',
            'email.required'           => 'Email is required.',
            'email.unique'             => 'This email is already taken.',
            'mobile_number.required'   => 'Mobile number is required.',
            'license_number.unique'    => 'This license number is already taken.',
        ];
    }
}
